import express from 'express';
import {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  cancelOrder,
  getOrderStatistics,
  createOrderFromCart,
  createDirectOrder,
  updateOrderInfo,
  confirmPayment
} from '../controllers/orders.controller.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes (require authentication) - PUT THESE FIRST
router.get('/test', authMiddleware, (req, res) => {
  res.json({ success: true, message: 'Orders API working', user: req.user });
});
router.get('/user', authMiddleware, getUserOrders);
router.put('/:id/update-info', authMiddleware, updateOrderInfo);
router.put('/:id/confirm-payment', authMiddleware, confirmPayment);
router.patch('/:orderId/cancel', authMiddleware, cancelOrder);

// Public routes - PUT DYNAMIC ROUTES LAST
router.post('/', createOrder);
router.post('/from-cart', authMiddleware, createOrderFromCart);
router.post('/direct', authMiddleware, createDirectOrder);
router.get('/:orderId', getOrderById); // This should be LAST among GET routes

// Admin routes
router.put('/:orderId/status', authMiddleware, updateOrderStatus);
router.get('/admin/statistics', authMiddleware, getOrderStatistics);

export default router;
