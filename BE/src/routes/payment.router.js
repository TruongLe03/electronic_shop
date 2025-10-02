import express from "express";
import {
  createPayment,
  vnpayReturn,
  momoIpn,
  confirmCodPayment,
  getPaymentStatus,
} from "../controllers/payment.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const paymentRouter = express.Router();

// Create payment for order
paymentRouter.post("/create", authMiddleware, createPayment);

// VNPay return URL
paymentRouter.get("/vnpay/return", vnpayReturn);

// MoMo IPN
paymentRouter.post("/momo/ipn", momoIpn);

// Confirm COD payment (admin only)
paymentRouter.put("/cod/:paymentId/confirm", authMiddleware, confirmCodPayment);

// Get payment status
paymentRouter.get("/:paymentId/status", getPaymentStatus);

export default paymentRouter;
