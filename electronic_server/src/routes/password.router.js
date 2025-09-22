import express from 'express';
import { 
  sendResetOTP, 
  verifyResetOTP, 
  resetPassword,
  checkEmailExists 
} from '../controllers/password.controller.js';

const router = express.Router();

// Route để gửi OTP reset password
router.post('/send-reset-otp', sendResetOTP);

// Route để verify OTP
router.post('/verify-otp', verifyResetOTP);

// Route để reset password
router.post('/reset-password', resetPassword);

// Route để check email có tồn tại không (cho validation)
router.post('/check-email', checkEmailExists);

export default router;