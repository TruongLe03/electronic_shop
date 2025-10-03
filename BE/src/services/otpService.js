import OTP from "../models/otp.model.js";
import User from "../models/user.model.js";
import { generateOTP, sendOTPEmail } from "./emailService.js";
import bcrypt from "bcryptjs";

export class OTPService {
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
    const otpRecord = await OTP.findValidOTP(email.toLowerCase(), otpCode);
    
    if (!otpRecord) {
      throw new Error("Mã OTP không hợp lệ hoặc đã hết hạn");
    }

    return otpRecord;
  }

  // Reset password với OTP
  static async resetPasswordWithOTP(email, otpCode, newPassword) {
    // Verify OTP
    const otpRecord = await this.verifyOTP(email, otpCode);

    // Kiểm tra type của OTP
    if (otpRecord.type !== 'reset-password') {
      throw new Error("Mã OTP không hợp lệ cho việc đặt lại mật khẩu");
    }

    // Tìm user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error("Người dùng không tồn tại");
    }

    // Hash password mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật password
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Xóa OTP đã sử dụng
    await OTP.deleteOTP(email.toLowerCase(), otpCode);

    return {
      message: "Đặt lại mật khẩu thành công"
    };
  }

  // Gửi OTP cho verification (có thể mở rộng cho các mục đích khác)
  static async sendVerificationOTP(email, type = 'verification') {
    // Kiểm tra email tồn tại
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error("Email không tồn tại trong hệ thống");
    }

    // Generate OTP
    const otp = generateOTP();

    // Lưu OTP vào database
    await OTP.createOTP(email.toLowerCase(), otp, type);

    // Gửi OTP qua email
    const emailResult = await sendOTPEmail(email, otp, type);

    if (!emailResult.success) {
      throw new Error("Không thể gửi email. Vui lòng thử lại sau.");
    }

    return {
      email: email,
      type: type,
      expiresIn: '10 phút'
    };
  }

  // Verify email với OTP
  static async verifyEmail(email, otpCode) {
    // Verify OTP
    const otpRecord = await this.verifyOTP(email, otpCode);

    // Kiểm tra type
    if (otpRecord.type !== 'verification') {
      throw new Error("Mã OTP không hợp lệ cho việc xác thực email");
    }

    // Update user email verification status
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      user.emailVerified = true;
      user.emailVerifiedAt = new Date();
      await user.save();
    }

    // Xóa OTP đã sử dụng
    await OTP.deleteOTP(email.toLowerCase(), otpCode);

    return {
      message: "Xác thực email thành công",
      emailVerified: true
    };
  }

  // Resend OTP
  static async resendOTP(email, type = 'reset-password') {
    // Xóa OTP cũ
    await OTP.deleteAllOTPByEmail(email.toLowerCase());

    // Gửi OTP mới
    if (type === 'reset-password') {
      return await this.sendResetOTP(email);
    } else {
      return await this.sendVerificationOTP(email, type);
    }
  }

  // Lấy thông tin OTP (không trả về code)
  static async getOTPInfo(email) {
    const otpRecord = await OTP.findOne({ 
      email: email.toLowerCase(),
      expiresAt: { $gt: new Date() },
      isUsed: false
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return null;
    }

    return {
      email: otpRecord.email,
      type: otpRecord.type,
      expiresAt: otpRecord.expiresAt,
      attemptsLeft: Math.max(0, 3 - (otpRecord.attempts || 0))
    };
  }

  // Validate OTP format
  static validateOTPFormat(otpCode) {
    // OTP should be 6 digits
    const otpRegex = /^\d{6}$/;
    return otpRegex.test(otpCode);
  }

  // Clean expired OTPs (có thể chạy định kỳ)
  static async cleanExpiredOTPs() {
    const result = await OTP.deleteMany({
      $or: [
        { expiresAt: { $lt: new Date() } },
        { isUsed: true }
      ]
    });

    return {
      deletedCount: result.deletedCount,
      message: `Đã xóa ${result.deletedCount} OTP hết hạn/đã sử dụng`
    };
  }
}