import { OTPService } from "../services/otpService.js";
import { ResponseUtil, asyncHandler } from "../utils/response.util.js";
import { ValidationUtil } from "../utils/validation.util.js";
import { UserService } from "../services/userService.js";

// Gửi OTP để reset password
export const sendResetOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Validate email
  if (!email || !ValidationUtil.isValidEmail(email)) {
    return ResponseUtil.validationError(res, ['Email không hợp lệ']);
  }

  const result = await OTPService.sendResetOTP(email);
  
  return ResponseUtil.success(res, result, 'Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra email.');
});

// Verify OTP
export const verifyResetOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  // Validate input
  if (!email || !otp) {
    return ResponseUtil.validationError(res, ['Email và mã OTP là bắt buộc']);
  }

  if (!ValidationUtil.isValidEmail(email)) {
    return ResponseUtil.validationError(res, ['Email không hợp lệ']);
  }

  if (!OTPService.validateOTPFormat(otp)) {
    return ResponseUtil.validationError(res, ['Mã OTP không hợp lệ (phải là 6 chữ số)']);
  }

  const otpRecord = await OTPService.verifyOTP(email, otp);

  return ResponseUtil.success(res, {
    email: email,
    otpVerified: true,
    expiresAt: otpRecord.expiresAt
  }, 'Xác thực OTP thành công. Bạn có thể đặt lại mật khẩu.');
});

// Reset password sau khi verify OTP
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword, confirmPassword } = req.body;

  // Validate input
  if (!email || !otp || !newPassword || !confirmPassword) {
    return ResponseUtil.validationError(res, ['Tất cả các trường là bắt buộc']);
  }

  if (!ValidationUtil.isValidEmail(email)) {
    return ResponseUtil.validationError(res, ['Email không hợp lệ']);
  }

  if (!ValidationUtil.isValidPassword(newPassword)) {
    return ResponseUtil.validationError(res, ['Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ và số']);
  }

  if (newPassword !== confirmPassword) {
    return ResponseUtil.validationError(res, ['Mật khẩu xác nhận không khớp']);
  }

  const result = await OTPService.resetPasswordWithOTP(email, otp, newPassword);

  return ResponseUtil.success(res, null, result.message);
});

// Resend OTP
export const resendOTP = asyncHandler(async (req, res) => {
  const { email, type = 'reset-password' } = req.body;

  // Validate email
  if (!email || !ValidationUtil.isValidEmail(email)) {
    return ResponseUtil.validationError(res, ['Email không hợp lệ']);
  }

  const result = await OTPService.resendOTP(email, type);

  return ResponseUtil.success(res, result, 'Mã OTP mới đã được gửi đến email của bạn.');
});

// Kiểm tra email có tồn tại không
export const checkEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Validate email
  if (!email || !ValidationUtil.isValidEmail(email)) {
    return ResponseUtil.validationError(res, ['Email không hợp lệ']);
  }

  try {
    const user = await UserService.getUserByEmail(email);
    const exists = !!user;

    return ResponseUtil.success(res, {
      exists,
      email
    }, exists ? 'Email đã tồn tại' : 'Email chưa được đăng ký');
  } catch (error) {
    return ResponseUtil.success(res, {
      exists: false,
      email
    }, 'Email chưa được đăng ký');
  }
});