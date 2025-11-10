import { UserService } from "../services/userService.js";
import { ResponseUtil, asyncHandler } from "../utils/response.util.js";
import { ValidationUtil } from "../utils/validation.util.js";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

// Lấy thông tin profile
export const getProfile = asyncHandler(async (req, res) => {
  const user = await UserService.getUserById(req.user.id);
  return ResponseUtil.success(res, user, "Lấy thông tin profile thành công");
});

// Cập nhật profile
export const updateProfile = asyncHandler(async (req, res) => {
  const updateData = req.body;
  const userId = req.user.id;

  // Validate phone number if provided
  if (
    updateData.phone_number &&
    !ValidationUtil.isValidPhoneNumber(updateData.phone_number)
  ) {
    return ResponseUtil.validationError(res, ["Số điện thoại không hợp lệ"]);
  }

  // Validate email if provided
  if (updateData.email && !ValidationUtil.isValidEmail(updateData.email)) {
    return ResponseUtil.validationError(res, ["Email không hợp lệ"]);
  }

  const updatedUser = await UserService.updateUser(userId, updateData);

  return ResponseUtil.success(res, updatedUser, "Cập nhật profile thành công");
});

// Đổi mật khẩu
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  // Validate input
  if (!currentPassword || !newPassword) {
    return ResponseUtil.validationError(res, [
      "Vui lòng nhập đầy đủ thông tin",
    ]);
  }

  if (newPassword.length < 6) {
    return ResponseUtil.validationError(res, [
      "Mật khẩu mới phải có ít nhất 6 ký tự",
    ]);
  }

  if (currentPassword === newPassword) {
    return ResponseUtil.validationError(res, [
      "Mật khẩu mới phải khác mật khẩu hiện tại",
    ]);
  }

  // Lấy user với password
  const user = await User.findById(userId).select("+password");
  if (!user) {
    return ResponseUtil.notFound(res, "Không tìm thấy người dùng");
  }

  // Kiểm tra mật khẩu hiện tại
  const isCurrentPasswordValid = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!isCurrentPasswordValid) {
    return ResponseUtil.validationError(res, ["Mật khẩu hiện tại không đúng"]);
  }

  // Mã hóa mật khẩu mới
  const saltRounds = 12;
  const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

  // Cập nhật mật khẩu
  await User.findByIdAndUpdate(
    userId,
    {
      password: hashedNewPassword,
      updatedAt: new Date(),
    },
    { new: true }
  );

  return ResponseUtil.success(res, null, "Đổi mật khẩu thành công");
});

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
// Lấy danh sách địa chỉ đã lưu của user
export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("address");

    res.json({
      success: true,
      data: user.address || [], // Trả về array các address string
    });
  } catch (error) {
    console.error("Get addresses error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Thêm địa chỉ mới (sau khi đặt hàng thành công)
export const addAddress = async (req, res) => {
  try {
    const { address } = req.body; // Chỉ nhận address string đầy đủ
    const userId = req.user.id;

    if (!address) {
      return res.status(400).json({ message: "Địa chỉ không được để trống" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Khởi tạo address array nếu chưa có
    if (!user.address) {
      user.address = [];
    }

    // Kiểm tra địa chỉ đã tồn tại chưa để tránh trùng lặp
    if (!user.address.includes(address)) {
      user.address.push(address);
    }

    await user.save();

    res.json({
      success: true,
      message: "Thêm địa chỉ thành công",
      data: user.address, // Trả về array các address
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
