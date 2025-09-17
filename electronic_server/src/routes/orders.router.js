import express from 'express';
import {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  cancelOrder,
  getOrderStatistics,
  createOrderFromCart,
  createDirectOrder
} from '../controllers/orders.controller.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/', createOrder);
router.post('/from-cart', authMiddleware, createOrderFromCart);
router.post('/direct', authMiddleware, createDirectOrder);
router.get('/:orderId', getOrderById);

// Protected routes (require authentication)
router.get('/user/orders', authMiddleware, getUserOrders);
router.put('/:orderId/cancel', authMiddleware, cancelOrder);

// Admin routes
router.put('/:orderId/status', authMiddleware, updateOrderStatus);
router.get('/admin/statistics', authMiddleware, getOrderStatistics);

export default router;
