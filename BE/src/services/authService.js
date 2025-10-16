import User from "../models/user.model.js";
import OTP from "../models/otp.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateToken } from "../utils/auth.util.js";
import { UserService } from "./userService.js";
import { generateOTP, sendOTPEmail } from "./emailService.js";

export class AuthService {
  // Đăng nhập
  static async login(email, password) {
    // Lấy user kèm theo password để verify
    const user = await UserService.getUserByEmailWithPassword(email);
    if (!user) {
      throw new Error("Tài khoản không tồn tại");
    }
    
    if (user.status === "inactive") {
      throw new Error("Tài khoản đã bị khóa");
    }
    
    // Kiểm tra password có tồn tại không
    if (!user.password) {
      throw new Error("Lỗi dữ liệu tài khoản");
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error("Tài khoản hoặc mật khẩu không đúng");
    }
    
    const token = generateToken(user._id, user.email, user.role);
    return { user, token };
  }

  // Đăng ký
  static async register(userData) {
    const { email, password, phone_number, username } = userData;

    // Validate dữ liệu đầu vào
    if (!email || !password || !phone_number || !username) {
      throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc");
    }

    // Tạo user mới
    const newUser = await UserService.createUser(userData);

    // Tạo token cho user mới
    const token = generateToken(newUser._id, newUser.email, newUser.role);

    return { user: newUser, token };
  }

  // Lấy thông tin profile
  static async getProfile(userId) {
    return await UserService.getUserById(userId);
  }

  // Cập nhật profile
  static async updateProfile(userId, updateData) {
    return await UserService.updateUser(userId, updateData);
  }

  // Đổi mật khẩu
  static async changePassword(userId, currentPassword, newPassword) {
    return await UserService.changePassword(userId, currentPassword, newPassword);
  }

  // Verify token
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (error) {
      throw new Error("Token không hợp lệ");
    }
  }

  // Refresh token (nếu cần)
  static async refreshToken(userId) {
    const user = await UserService.getUserById(userId);
    const token = generateToken(user._id, user.email, user.role);
    return { user, token };
  }

  // ==== OTP FUNCTIONS ====
  
  // Gửi OTP để reset password
  static async sendResetOTP(email) {
    // Kiểm tra email có tồn tại trong hệ thống không
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error("Email không tồn tại trong hệ thống");
    }

    // Generate OTP
    const otp = generateOTP();

    // Lưu OTP vào database
    await OTP.createOTP(email.toLowerCase(), otp, 'reset-password');

    // Gửi OTP qua email
    const emailResult = await sendOTPEmail(email, otp);

    if (!emailResult.success) {
      throw new Error("Không thể gửi email. Vui lòng thử lại sau.");
    }

    return {
      email: email,
      expiresIn: '10 phút'
    };
  }

  // Xác thực OTP
  static async verifyOTP(email, otpCode) {
    const result = await OTP.verifyOTPCode(email.toLowerCase(), otpCode, 'reset-password');
    
    if (!result.success) {
      throw new Error(result.message);
    }

    return result;
  }

  // Reset password với OTP
  static async resetPasswordWithOTP(email, otpCode, newPassword) {
    // Tìm OTP đã được verified trong vòng 10 phút gần đây
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      otp: otpCode,
      purpose: 'reset-password',
      verified: true,
      createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) } // OTP còn trong vòng 10 phút
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      throw new Error("OTP không hợp lệ hoặc đã hết hạn");
    }

    // Tìm user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error("Người dùng không tồn tại");
    }

    // Hash password mới
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Cập nhật password
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Xóa OTP đã sử dụng
    await OTP.deleteMany({ 
      email: email.toLowerCase(), 
      purpose: 'reset-password'
    });

    return {
      message: "Đặt lại mật khẩu thành công"
    };
  }

  // Gửi OTP cho verification email
  static async sendVerificationOTP(email, type = 'verify-email') {
    // Kiểm tra email tồn tại
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error("Email không tồn tại trong hệ thống");
    }

    // Generate OTP
    const otp = generateOTP();

    // Lưu OTP vào database
    await OTP.createOTP(email.toLowerCase(), otp, 'verify-email');

    // Gửi OTP qua email
    const emailResult = await sendOTPEmail(email, otp);

    if (!emailResult.success) {
      throw new Error("Không thể gửi email. Vui lòng thử lại sau.");
    }

    return {
      email: email,
      expiresIn: '10 phút'
    };
  }

  // Verify email với OTP
  static async verifyEmailWithOTP(email, otpCode) {
    const result = await OTP.verifyOTPCode(email.toLowerCase(), otpCode, 'verify-email');
    
    if (!result.success) {
      throw new Error(result.message);
    }

    // Cập nhật trạng thái email verified cho user (nếu cần)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user && !user.emailVerified) {
      user.emailVerified = true;
      await user.save();
    }

    // Xóa OTP đã sử dụng
    await OTP.deleteMany({ 
      email: email.toLowerCase(), 
      purpose: 'verify-email',
      verified: true 
    });

    return {
      message: "Xác thực email thành công",
      emailVerified: true
    };
  }
}

// Backward compatibility - export cũ
export const findUserByEmail = async (email) => {
  return await UserService.getUserByEmail(email);
};

export const login = async (email, password) => {
  return await AuthService.login(email, password);
};
