import express from "express";
import {
  handleLogin,
  register,
  getProfile,
  forgotPassword,
  resetPassword,
  validateResetToken,
  sendResetOTP,
  verifyResetOTP,
  resetPasswordWithOTP,
  sendVerificationOTP,
  verifyEmailWithOTP,
  checkEmailExists,
} from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const authRouter = express.Router();

// ==== AUTHENTICATION ====
authRouter.post("/login", handleLogin);
authRouter.post("/register", register);
authRouter.get("/profile", authMiddleware, getProfile);

// ==== PASSWORD MANAGEMENT ====
// JWT-based password reset (legacy)
authRouter.post("/password/forgot", forgotPassword);
authRouter.post("/password/reset", resetPassword);
authRouter.get("/password/validate/:token", validateResetToken);

// OTP-based password reset (recommended)
authRouter.post("/password/send-otp", sendResetOTP);
authRouter.post("/password/verify-otp", verifyResetOTP);
authRouter.post("/password/reset-with-otp", resetPasswordWithOTP);

// ==== EMAIL VERIFICATION ====
authRouter.post("/email/check", checkEmailExists);
authRouter.post("/email/send-verification", sendVerificationOTP);
authRouter.post("/email/verify", verifyEmailWithOTP);

export default authRouter;
