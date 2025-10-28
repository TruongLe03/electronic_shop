import express from "express";
import {
  createPayment,
  vnpayReturn,
  vnpayIPN,
  getPaymentById,
  getUserPayments,
  refundPayment,
  getAllPayments,
  updatePaymentStatus,
  getPaymentStats,
} from "../controllers/payment.controller.js";
import authMiddleware, { requireAdminAuth } from "../middleware/authMiddleware.js";

const paymentRouter = express.Router();

// ============= PUBLIC ROUTES (không cần auth) =============
// VNPay callbacks - VNPay sẽ call trực tiếp, không có token
paymentRouter.get("/vnpay/return", vnpayReturn); // User redirect từ VNPay
paymentRouter.get("/vnpay/ipn", vnpayIPN); // VNPay webhook
paymentRouter.post("/vnpay/ipn", vnpayIPN); // VNPay webhook backup

// ============= USER ROUTES (cần auth) =============
// Tạo thanh toán
paymentRouter.post("/create", authMiddleware, createPayment);

// Lấy danh sách thanh toán của user
paymentRouter.get("/user/my-payments", authMiddleware, getUserPayments);

// ============= ADMIN ROUTES (cần auth + admin role) =============
// Lấy tất cả payments
paymentRouter.get("/admin/all", requireAdminAuth, getAllPayments);

// Thống kê thanh toán
paymentRouter.get("/admin/stats", requireAdminAuth, getPaymentStats);

// Cập nhật trạng thái payment
paymentRouter.put("/admin/:paymentId/status", requireAdminAuth, updatePaymentStatus);

// Hoàn tiền
paymentRouter.post("/admin/:paymentId/refund", requireAdminAuth, refundPayment);

// Lấy thông tin thanh toán (đặt cuối cùng để tránh xung đột)
paymentRouter.get("/:paymentId", authMiddleware, getPaymentById);

export default paymentRouter;
