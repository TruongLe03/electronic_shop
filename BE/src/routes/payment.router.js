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

// ============= PAYMENT INITIALIZATION =============
paymentRouter.post("/process", authMiddleware, createPayment);

// ============= GATEWAY CALLBACKS =============
// VNPay integration
paymentRouter.get("/gateways/vnpay/callback", vnpayReturn);
paymentRouter.post("/gateways/vnpay/ipn", vnpayIPN);

// MoMo integration  
paymentRouter.post("/gateways/momo/ipn", momoIPN);
paymentRouter.post("/gateways/momo/callback", momoReturn);

// ============= PAYMENT TRACKING =============
paymentRouter.get("/orders/:orderId", authMiddleware, getPaymentByOrderId);
paymentRouter.get("/my-payments", authMiddleware, getUserPayments);
paymentRouter.get("/:paymentId/status", authMiddleware, verifyPaymentStatus);

// ============= PAYMENT MANAGEMENT =============
paymentRouter.post("/:paymentId/refund", authMiddleware, refundPayment);

export default paymentRouter;
