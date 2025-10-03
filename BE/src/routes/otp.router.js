import express from "express";
import {
  sendResetOTP,
  verifyResetOTP,
  resetPassword,
  resendOTP,
  checkEmail
} from "../controllers/otp.controller.js";

const otpRouter = express.Router();

// Route để kiểm tra email có tồn tại không
otpRouter.post("/check-email", checkEmail);

// Route để gửi OTP reset password
otpRouter.post("/send-reset-otp", sendResetOTP);

// Route để verify OTP
otpRouter.post("/verify-otp", verifyResetOTP);

// Route để reset password
otpRouter.post("/reset-password", resetPassword);

// Route để resend OTP
otpRouter.post("/resend", resendOTP);

export default otpRouter;
