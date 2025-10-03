import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateToken } from "../utils/auth.util.js";
import { UserService } from "./userService.js";

export class AuthService {
  // Đăng nhập
  static async login(email, password) {
    const user = await UserService.getUserByEmail(email);
    if (!user) {
      throw new Error("Tài khoản không tồn tại");
    }
    
    if (user.status === "inactive") {
      throw new Error("Tài khoản đã bị khóa");
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
}

// Backward compatibility - export cũ
export const findUserByEmail = async (email) => {
  return await UserService.getUserByEmail(email);
};

export const login = async (email, password) => {
  return await AuthService.login(email, password);
};
