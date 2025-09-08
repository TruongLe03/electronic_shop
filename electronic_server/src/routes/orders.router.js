import express from 'express';
import {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  cancelOrder
} from '../controllers/orders.controller.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/', createOrder);
router.get('/:orderId', getOrderById);

// Protected routes (require authentication)
router.get('/user/orders', authMiddleware, getUserOrders);
router.put('/:orderId/status', authMiddleware, updateOrderStatus);
router.put('/:orderId/cancel', authMiddleware, cancelOrder);

export default router;
