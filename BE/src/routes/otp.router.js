import express from "express";
import {
  sendResetOTP,
  verifyResetOTP,
  resetPassword,
  checkEmailExists,
} from "../controllers/otp.controller.js";

const otpRouter = express.Router();

// Route để gửi OTP reset password
otpRouter.post("/send-reset-otp", sendResetOTP);

// Route để verify OTP
otpRouter.post("/verify-otp", verifyResetOTP);

// Route để reset password
otpRouter.post("/reset-password", resetPassword);

// Route để check email có tồn tại không (cho validation)
otpRouter.post("/check-email", checkEmailExists);

export default otpRouter;
