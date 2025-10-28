import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const EXPIRES_IN_SECONDS = 60 * 60 * 24; // 1 day

export const generateToken = (_id, email, role) => {
  const payload = {
    id: _id,
    email: email,
    role: role,
  };
  return jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: EXPIRES_IN_SECONDS });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET_KEY);
  } catch (error) {
    throw new Error("Token không hợp lệ");
  }
};
