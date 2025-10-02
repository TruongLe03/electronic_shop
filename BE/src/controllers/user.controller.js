import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

// Lấy thông tin profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -resetPasswordToken -resetPasswordExpires"
    );

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Cập nhật profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({ message: "Tên và số điện thoại là bắt buộc" });
    }

    // Validate phone number
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Số điện thoại không hợp lệ" });
    }

    // Kiểm tra email đã tồn tại (nếu thay đổi)
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: userId },
      });

      if (existingUser) {
        return res.status(400).json({ message: "Email đã được sử dụng" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        username: name, // Also update username field
        phone_number: phone,
        phone: phone, // Update both phone fields for compatibility  
        address: address || '',
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).select("-password -resetPasswordToken -resetPasswordExpires");

    res.json({
      success: true,
      message: "Cập nhật thông tin thành công",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: errors.join(", ") });
    }
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Đổi mật khẩu
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
    }

    // Lấy user với password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Kiểm tra mật khẩu hiện tại
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    // Mã hóa mật khẩu mới
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Cập nhật mật khẩu
    await User.findByIdAndUpdate(userId, {
      password: hashedNewPassword,
      updatedAt: new Date(),
    });

    res.json({
      success: true,
      message: "Đổi mật khẩu thành công",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Upload avatar (placeholder - cần multer để xử lý file upload)
export const uploadAvatar = async (req, res) => {
  try {
    // Placeholder - sẽ implement sau với multer
    res.json({
      success: true,
      message: "Upload avatar thành công",
      data: {
        avatarUrl: "/uploads/avatars/default.jpg",
      },
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Quản lý địa chỉ
export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("addresses");

    res.json({
      success: true,
      data: user.addresses || [],
    });
  } catch (error) {
    console.error("Get addresses error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const addAddress = async (req, res) => {
  try {
    const { name, phone, address, city, district, ward, isDefault } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Tạo địa chỉ mới
    const newAddress = {
      name,
      phone,
      address,
      city,
      district,
      ward,
      isDefault: isDefault || false,
    };

    // Nếu địa chỉ này là mặc định, set các địa chỉ khác thành false
    if (newAddress.isDefault) {
      user.addresses = user.addresses.map((addr) => ({
        ...addr,
        isDefault: false,
      }));
    }

    user.addresses.push(newAddress);
    await user.save();

    res.json({
      success: true,
      message: "Thêm địa chỉ thành công",
      data: user.addresses,
    });
  } catch (error) {
    console.error("Add address error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { name, phone, address, city, district, ward, isDefault } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );
    if (addressIndex === -1) {
      return res.status(404).json({ message: "Không tìm thấy địa chỉ" });
    }

    // Nếu set làm mặc định, update các địa chỉ khác
    if (isDefault) {
      user.addresses = user.addresses.map((addr) => ({
        ...addr,
        isDefault: false,
      }));
    }

    // Cập nhật địa chỉ
    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex],
      name,
      phone,
      address,
      city,
      district,
      ward,
      isDefault: isDefault || false,
    };

    await user.save();

    res.json({
      success: true,
      message: "Cập nhật địa chỉ thành công",
      data: user.addresses,
    });
  } catch (error) {
    console.error("Update address error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== addressId
    );
    await user.save();

    res.json({
      success: true,
      message: "Xóa địa chỉ thành công",
      data: user.addresses,
    });
  } catch (error) {
    console.error("Delete address error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Set tất cả địa chỉ thành false, sau đó set địa chỉ được chọn thành true
    user.addresses = user.addresses.map((addr) => ({
      ...addr,
      isDefault: addr._id.toString() === addressId,
    }));

    await user.save();

    res.json({
      success: true,
      message: "Đặt địa chỉ mặc định thành công",
      data: user.addresses,
    });
  } catch (error) {
    console.error("Set default address error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
