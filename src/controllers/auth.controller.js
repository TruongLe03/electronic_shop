import { AuthService } from "../services/authService.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ResponseUtil, asyncHandler } from "../utils/response.util.js";
import { ValidationUtil } from "../utils/validation.util.js";

export const handleLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Validate input
  if (!email || !password) {
    return ResponseUtil.validationError(res, 
      ['Email và mật khẩu là bắt buộc'], 
      'Thiếu thông tin đăng nhập'
    );
  }

  // Validate email format
  if (!ValidationUtil.isValidEmail(email)) {
    return ResponseUtil.validationError(res, 
      ['Email không hợp lệ'], 
      'Định dạng email không đúng'
    );
  }

  const { user, token } = await AuthService.login(email, password);
  
  return ResponseUtil.success(res, {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
  }, "Đăng nhập thành công");
});

export const register = asyncHandler(async (req, res) => {
  const userData = req.body;
  
  // Validate registration data
  const validation = ValidationUtil.validateUserRegistration(userData);
  if (!validation.isValid) {
    return ResponseUtil.validationError(res, validation.errors, 'Dữ liệu đăng ký không hợp lệ');
  }

  const { user, token } = await AuthService.register(userData);

  return ResponseUtil.success(res, {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
  }, "Đăng ký thành công", 201);
});

export const getProfile = async (req, res) => {
  try {
    const user = await AuthService.getProfile(req.user.id);

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone_number,
        address: user.address,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        wishlist: user.wishlist,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Yêu cầu reset mật khẩu
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Kiểm tra email tồn tại
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "Email không tồn tại trong hệ thống",
      });
    }

    // Tạo token reset password (hết hạn sau 15 phút)
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "15m",
    });

    // Lưu token và thời gian hết hạn vào DB
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 phút
    await user.save();

    return res.json({
      message: "Token đặt lại mật khẩu đã được tạo",
      resetToken: resetToken,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Đặt lại mật khẩu với token
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
      return res.status(400).json({
        message: "Token không hợp lệ hoặc đã hết hạn",
      });
    }

    // Tìm user với token và token chưa hết hạn
    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Token không hợp lệ hoặc đã hết hạn",
      });
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu và xóa token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({
      message: "Đặt lại mật khẩu thành công",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Kiểm tra token reset password có hợp lệ
export const validateResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Token không hợp lệ hoặc đã hết hạn",
      });
    }

    return res.json({
      message: "Token hợp lệ",
    });
  } catch (error) {
    console.error("Validate reset token error:", error);
    return res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// ==== OTP FUNCTIONS ====

// Gửi OTP để reset password
export const sendResetOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return ResponseUtil.validationError(res, ['Email là bắt buộc']);
  }

  if (!ValidationUtil.isValidEmail(email)) {
    return ResponseUtil.validationError(res, ['Email không hợp lệ']);
  }

  const result = await AuthService.sendResetOTP(email);
  
  return ResponseUtil.success(res, result, 'OTP đã được gửi đến email của bạn');
});

// Xác thực OTP
export const verifyResetOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return ResponseUtil.validationError(res, ['Email và OTP là bắt buộc']);
  }

  const result = await AuthService.verifyOTP(email, otp);
  
  return ResponseUtil.success(res, result, 'OTP hợp lệ');
});

// Reset password với OTP
export const resetPasswordWithOTP = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return ResponseUtil.validationError(res, ['Email, OTP và mật khẩu mới là bắt buộc']);
  }

  if (newPassword.length < 6) {
    return ResponseUtil.validationError(res, ['Mật khẩu phải có ít nhất 6 ký tự']);
  }

  const result = await AuthService.resetPasswordWithOTP(email, otp, newPassword);
  
  return ResponseUtil.success(res, result, result.message);
});

// Gửi OTP để verify email
export const sendVerificationOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return ResponseUtil.validationError(res, ['Email là bắt buộc']);
  }

  const result = await AuthService.sendVerificationOTP(email);
  
  return ResponseUtil.success(res, result, 'OTP xác thực đã được gửi đến email của bạn');
});

// Verify email với OTP
export const verifyEmailWithOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return ResponseUtil.validationError(res, ['Email và OTP là bắt buộc']);
  }

  const result = await AuthService.verifyEmailWithOTP(email, otp);
  
  return ResponseUtil.success(res, result, result.message);
});

// Check email exists
export const checkEmailExists = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return ResponseUtil.validationError(res, ['Email là bắt buộc']);
  }

  const user = await User.findOne({ email });
  const exists = !!user;
  
  return ResponseUtil.success(res, { exists }, exists ? 'Email đã tồn tại' : 'Email chưa được đăng ký');
});
