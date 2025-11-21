import express from "express";
import {
  createPaymentUrl,
  createUserPaymentUrl,
  handleIPN,
  handleReturn,
  checkPaymentStatus,
} from "../controllers/vnpay.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const vnpayRouter = express.Router();

// ===== PUBLIC ROUTES (không cần authentication) =====
// Callback từ VNPay (IPN - Instant Payment Notification)
vnpayRouter.get("/ipn", handleIPN);

// Return URL từ VNPay (người dùng được redirect về)
vnpayRouter.get("/return", handleReturn);

// Kiểm tra trạng thái thanh toán (public để VNPay có thể gọi)
vnpayRouter.get("/status/:orderId", checkPaymentStatus);

// ===== PROTECTED ROUTES (cần authentication) =====
// Tạo URL thanh toán cho user hiện tại
vnpayRouter.post("/create", authMiddleware, createUserPaymentUrl);

// ===== ADMIN ROUTES (có thể thêm admin middleware sau) =====
// Tạo URL thanh toán (admin có thể tạo cho bất kỳ đơn hàng nào)
vnpayRouter.post("/admin/create-payment", authMiddleware, createPaymentUrl);

export default vnpayRouter;
