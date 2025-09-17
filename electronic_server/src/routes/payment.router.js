import express from 'express';
import {
  createPayment,
  vnpayReturn,
  momoIpn,
  confirmCodPayment,
  getPaymentStatus
} from '../controllers/payment.controller.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Create payment for order
router.post('/create', authMiddleware, createPayment);

// VNPay return URL
router.get('/vnpay/return', vnpayReturn);

// MoMo IPN
router.post('/momo/ipn', momoIpn);

// Confirm COD payment (admin only)
router.put('/cod/:paymentId/confirm', authMiddleware, confirmCodPayment);

// Get payment status
router.get('/:paymentId/status', getPaymentStatus);

export default router;