import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email và mật khẩu là bắt buộc" 
      });
    }

    // Tìm user theo email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Email không tồn tại trong hệ thống",
        type: "email_not_found"
      });
    }

    // Kiểm tra trạng thái tài khoản
    if (user.status === "inactive") {
      return res.status(401).json({ 
        success: false,
        message: "Tài khoản đã bị khóa" 
      });
    }

    // So sánh mật khẩu
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ 
        success: false,
        message: "Mật khẩu không đúng",
        type: "wrong_password"
      });
    }

    // Tạo token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    return res.json({
      success: true,
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false,
      message: "Lỗi server", 
      error: error.message 
    });
  }
};

export const register = async (req, res) => {
  try {
    const { email, password, phone_number, username } = req.body;

    // Validation
    if (!email || !password || !phone_number || !username) {
      return res.status(400).json({ 
        success: false,
        message: "Vui lòng điền đầy đủ thông tin bắt buộc" 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Email không đúng định dạng" 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự" 
      });
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        message: "Email đã được đăng ký trong hệ thống",
        type: "email_exists"
      });
    }

    // Kiểm tra phone number đã tồn tại chưa  
    const existingPhone = await User.findOne({ phone_number });
    if (existingPhone) {
      return res.status(409).json({ 
        success: false,
        message: "Số điện thoại đã được đăng ký",
        type: "phone_exists"
      });
    }

    // Mã hoá mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      phone_number,
      username: username,
      name: username,
      role: "customer",
    });

    await newUser.save();

    // Tạo token cho user mới
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    // Lấy user từ database (không lấy password)
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin người dùng",
      });
    }

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
