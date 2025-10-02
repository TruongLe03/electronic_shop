import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import OTP from '../models/otp.model.js';
import { generateOTP, sendOTPEmail } from '../services/emailService.js';

// Gửi OTP để reset password
export const sendResetOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email là bắt buộc'
      });
    }

    // Kiểm tra email có tồn tại trong hệ thống không
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Email không tồn tại trong hệ thống'
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Lưu OTP vào database
    await OTP.createOTP(email.toLowerCase(), otp, 'reset-password');

    // Gửi OTP qua email
    const emailResult = await sendOTPEmail(email, otp);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Không thể gửi email. Vui lòng thử lại sau.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra email.',
      data: {
        email: email,
        expiresIn: '10 phút'
      }
    });

  } catch (error) {
    console.error('Send reset OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi gửi mã OTP'
    });
  }
};

// Verify OTP
export const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email và mã OTP là bắt buộc'
      });
    }

    // Verify OTP
    const result = await OTP.verifyOTPCode(email.toLowerCase(), otp, 'reset-password');

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Xác thực OTP thành công. Bạn có thể đặt lại mật khẩu.',
      data: {
        email: email,
        otpVerified: true
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xác thực OTP'
    });
  }
};

// Reset password sau khi verify OTP
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    // Validation
    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Tất cả các trường là bắt buộc'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu xác nhận không khớp'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự'
      });
    }

    // Kiểm tra OTP đã được verify chưa
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      otp: otp,
      purpose: 'reset-password',
      verified: true
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Mã OTP không hợp lệ hoặc chưa được xác thực'
      });
    }

    // Kiểm tra user có tồn tại không
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại'
      });
    }

    // Hash mật khẩu mới
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Cập nhật mật khẩu
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      updatedAt: new Date()
    });

    // Xóa OTP đã sử dụng
    await OTP.deleteMany({
      email: email.toLowerCase(),
      purpose: 'reset-password'
    });

    res.status(200).json({
      success: true,
      message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới.',
      data: {
        email: email
      }
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đặt lại mật khẩu'
    });
  }
};

// Check email exists (cho registration validation)
export const checkEmailExists = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email là bắt buộc'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    res.status(200).json({
      success: true,
      data: {
        email: email,
        exists: !!user,
        message: user ? 'Email đã được đăng ký' : 'Email chưa được đăng ký'
      }
    });

  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi kiểm tra email'
    });
  }
};