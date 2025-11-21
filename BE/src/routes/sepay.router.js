import express from 'express';
import {
  createPaymentFields,
  handleCallback,
  checkPaymentStatus,
  getAllOrders,
  checkOrderStatus,
  testConfig,
  getPaymentForm,
} from '../controllers/sepay.controller.js';
import authMiddleware, { requireAdminAuth } from '../middleware/authMiddleware.js';

const sepayRouter = express.Router();

// ===== PUBLIC ROUTES =====
// Callback từ SePay (success/error/cancel URL)
sepayRouter.get('/callback', handleCallback);

// Test cấu hình SePay
sepayRouter.get('/test-config', testConfig);

// ===== PROTECTED ROUTES (cần authentication) =====
// Tạo payment fields và checkout URL
sepayRouter.post('/create-payment', authMiddleware, createPaymentFields);

// Trả về HTML form thanh toán
sepayRouter.get('/payment-form/:orderId', authMiddleware, getPaymentForm);

// Kiểm tra trạng thái thanh toán
sepayRouter.get('/payment-status/:paymentId', authMiddleware, checkPaymentStatus);

// ===== ADMIN ROUTES =====
// Lấy danh sách đơn hàng từ SePay
sepayRouter.get('/orders', requireAdminAuth, getAllOrders);

// Kiểm tra trạng thái đơn hàng từ SePay API
sepayRouter.get('/order-status/:orderInvoiceNumber', requireAdminAuth, checkOrderStatus);

export default sepayRouter;
