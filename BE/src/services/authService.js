import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateToken } from "../utils/auth.util.js";

export const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};
export const login = async (email, password) => {
  const user = await findUserByEmail(email);
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
};
