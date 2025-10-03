import express from "express";
import {
  createPayment,
  vnpayReturn,
  vnpayIPN,
  momoIPN,
  momoReturn,
  getPaymentByOrderId,
  getUserPayments,
  refundPayment,
  verifyPaymentStatus
} from "../controllers/payment.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const paymentRouter = express.Router();

// Create payment for order
paymentRouter.post("/create", authMiddleware, createPayment);

// VNPay routes
paymentRouter.get("/vnpay/return", vnpayReturn);
paymentRouter.post("/vnpay/ipn", vnpayIPN);

// MoMo routes
paymentRouter.post("/momo/ipn", momoIPN);
paymentRouter.post("/momo/return", momoReturn);

// Get payment info
paymentRouter.get("/order/:orderId", authMiddleware, getPaymentByOrderId);
paymentRouter.get("/user", authMiddleware, getUserPayments);
paymentRouter.get("/:paymentId/verify", authMiddleware, verifyPaymentStatus);

// Admin routes
paymentRouter.post("/:paymentId/refund", authMiddleware, refundPayment);

export default paymentRouter;
