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
  createPaymentUrl,
  handleCallback,
  checkPaymentStatus,
} from "../controllers/payment.controller.js";
import authMiddleware, { requireAdminAuth } from "../middleware/authMiddleware.js";

const paymentRouter = express.Router();

// ============= PUBLIC ROUTES (không cần auth) =============
// VNPay callbacks - VNPay sẽ call trực tiếp, không có token
paymentRouter.get("/vnpay_return", vnpayReturn); // User redirect từ VNPay (match với .env)
paymentRouter.get("/vnpay_ipn", vnpayIPN); // VNPay webhook
paymentRouter.post("/vnpay_ipn", vnpayIPN); // VNPay webhook backup

// Legacy routes for backward compatibility
paymentRouter.get("/vnpay/return", vnpayReturn);
paymentRouter.get("/vnpay/ipn", vnpayIPN);
paymentRouter.post("/vnpay/ipn", vnpayIPN);

// ============= DEVELOPMENT ROUTES =============
// Test VNPay config
paymentRouter.get("/test-vnpay-config", async (req, res) => {
  try {
    const { PaymentService } = await import("../services/paymentService.js");
    PaymentService.validateVNPayConfig();
    res.json({
      success: true,
      message: "VNPay configuration is valid",
      config: {
        VNP_TMNCODE: PaymentService.VNP_TMN_CODE ? `${PaymentService.VNP_TMN_CODE.substring(0, 4)}****` : "Not set",
        VNP_HASH_SECRET: PaymentService.VNP_HASH_SECRET ? "****" : "Not set",
        VNP_URL: PaymentService.VNP_URL,
        VNP_RETURN_URL: PaymentService.VNP_RETURN_URL,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============= USER ROUTES (cần auth) =============
// Tạo thanh toán
paymentRouter.post("/create", authMiddleware, createPayment);

// Compatibility routes với VNPayService cũ
paymentRouter.post("/create-url", authMiddleware, createPaymentUrl);
paymentRouter.post("/callback", handleCallback);
paymentRouter.get("/status/:orderId", authMiddleware, checkPaymentStatus);

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
