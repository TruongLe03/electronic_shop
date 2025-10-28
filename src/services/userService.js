import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export class UserService {
  // Lấy thông tin user theo ID
  static async getUserById(userId) {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new Error("Không tìm thấy thông tin người dùng");
    }
    return user;
  }

  // Lấy thông tin user theo email
  static async getUserByEmail(email) {
    return await User.findOne({ email });
  }

  // Lấy thông tin user theo email kèm password (dành cho authentication)
  static async getUserByEmailWithPassword(email) {
    return await User.findOne({ email }).select('+password');
  }

  // Tạo user mới
  static async createUser(userData) {
    const { email, password, phone_number, username } = userData;

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await this.getUserByEmail(email);
    if (existingUser) {
      throw new Error("Email đã tồn tại");
    }

    // Mã hoá mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = new User({
      email,
      password: hashedPassword,
      phone_number,
      username,
      name: username,
      role: "customer",
      status: "active"
    });

    return await newUser.save();
  }

  // Cập nhật thông tin user
  static async updateUser(userId, updateData) {
    // Không cho phép cập nhật password qua hàm này
    delete updateData.password;
    delete updateData.email; // Email cũng không nên thay đổi

    const user = await User.findByIdAndUpdate(
      userId, 
      updateData, 
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      throw new Error("Không tìm thấy người dùng");
    }

    return user;
  }

  // Thay đổi mật khẩu
  static async changePassword(userId, currentPassword, newPassword) {
    // Lấy user kèm password để kiểm tra
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new Error("Không tìm thấy người dùng");
    }

    // Kiểm tra password có tồn tại không
    if (!user.password) {
      throw new Error("Lỗi dữ liệu tài khoản");
    }

    // Kiểm tra mật khẩu hiện tại
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error("Mật khẩu hiện tại không đúng");
    }

    // Mã hoá mật khẩu mới
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    
    user.password = hashedNewPassword;
    await user.save();

    return { message: "Đổi mật khẩu thành công" };
  }

  // Thêm địa chỉ
  static async addAddress(userId, addressData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Không tìm thấy người dùng");
    }

    // Nếu đây là địa chỉ mặc định, bỏ default của các địa chỉ khác
    if (addressData.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push(addressData);
    await user.save();

    return user.select("-password");
  }

  // Cập nhật địa chỉ
  static async updateAddress(userId, addressId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Không tìm thấy người dùng");
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      throw new Error("Không tìm thấy địa chỉ");
    }

    // Nếu set làm địa chỉ mặc định, bỏ default của các địa chỉ khác
    if (updateData.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    Object.assign(address, updateData);
    await user.save();

    return user.select("-password");
  }

  // Xóa địa chỉ
  static async deleteAddress(userId, addressId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Không tìm thấy người dùng");
    }

    user.addresses.id(addressId).remove();
    await user.save();

    return user.select("-password");
  }

  // Thêm sản phẩm vào wishlist
  static async addToWishlist(userId, productId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Không tìm thấy người dùng");
    }

    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }

    return user.select("-password").populate("wishlist");
  }

  // Xóa sản phẩm khỏi wishlist
  static async removeFromWishlist(userId, productId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Không tìm thấy người dùng");
    }

    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();

    return user.select("-password").populate("wishlist");
  }

  // Lấy wishlist
  static async getWishlist(userId) {
    const user = await User.findById(userId)
      .select("wishlist")
      .populate("wishlist");
    
    if (!user) {
      throw new Error("Không tìm thấy người dùng");
    }

    return user.wishlist;
  }

  // Cập nhật trạng thái user (admin only)
  static async updateUserStatus(userId, status) {
    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      throw new Error("Không tìm thấy người dùng");
    }

    return user;
  }

  // Lấy danh sách users (admin only)
  static async getAllUsers(page = 1, limit = 20, filters = {}) {
    const skip = (page - 1) * limit;
    
    let query = {};
    if (filters.role) {
      query.role = filters.role;
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { username: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    };
  }

  // Lấy thông tin user với thống kê đơn hàng (cho admin)
  static async getUserByIdWithStats(userId) {
    const User = (await import("../models/user.model.js")).default;
    const Order = (await import("../models/orders.model.js")).default;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return null;
    }

    // Lấy thống kê đơn hàng của user
    const orderStats = await Order.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
          avgOrderValue: { $avg: "$totalAmount" }
        }
      }
    ]);

    return {
      user,
      orderStats: orderStats[0] || {
        totalOrders: 0,
        totalSpent: 0,
        avgOrderValue: 0
      }
    };
  }

  // Toggle trạng thái user (admin)
  static async toggleUserStatus(userId) {
    const user = await User.findById(userId);
    if (!user) {
      return null;
    }

    user.status = user.status === "active" ? "inactive" : "active";
    await user.save();

    return {
      userId: user._id,
      status: user.status
    };
  }

  // Xóa user (admin)
  static async deleteUser(userId) {
    const User = (await import("../models/user.model.js")).default;
    const Order = (await import("../models/orders.model.js")).default;

    const user = await User.findById(userId);
    if (!user) {
      return { success: false, reason: 'NOT_FOUND' };
    }

    // Kiểm tra xem user có đơn hàng không
    const hasOrders = await Order.exists({ userId });
    if (hasOrders) {
      return { success: false, reason: 'HAS_ORDERS' };
    }

    await User.findByIdAndDelete(userId);
    return { success: true };
  }

  // Lấy danh sách tất cả user với thống kê đơn hàng (admin)
  static async getAllUsers(options) {
    const { 
      page = 1, 
      limit = 10, 
      search = "", 
      role = "", 
      status = "",
      sortBy = "createdAt",
      sortOrder = "desc"
    } = options;

    const query = {};
    
    // Tìm kiếm theo tên hoặc email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    // Lọc theo role
    if (role) {
      query.role = role;
    }

    // Lọc theo trạng thái
    if (status) {
      query.status = status;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Lấy users với thống kê đơn hàng
    const Order = (await import("../models/orders.model.js")).default;
    
    const [users, totalUsers] = await Promise.all([
      User.aggregate([
        { $match: query },
        {
          $lookup: {
            from: "orders",
            localField: "_id",
            foreignField: "user_id",
            as: "orders"
          }
        },
        {
          $addFields: {
            totalOrders: { $size: "$orders" },
            totalSpent: {
              $sum: {
                $map: {
                  input: "$orders",
                  as: "order",
                  in: { $ifNull: ["$$order.total", 0] }
                }
              }
            },
            avgOrderValue: {
              $cond: {
                if: { $gt: [{ $size: "$orders" }, 0] },
                then: {
                  $divide: [
                    {
                      $sum: {
                        $map: {
                          input: "$orders",
                          as: "order", 
                          in: { $ifNull: ["$$order.total", 0] }
                        }
                      }
                    },
                    { $size: "$orders" }
                  ]
                },
                else: 0
              }
            }
          }
        },
        {
          $project: {
            password: 0,
            orders: 0
          }
        },
        { $sort: sortOptions },
        { $skip: (page - 1) * limit },
        { $limit: limit }
      ]),
      User.countDocuments(query)
    ]);

    return {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasNextPage: page < Math.ceil(totalUsers / limit),
        hasPrevPage: page > 1
      }
    };
  }
}