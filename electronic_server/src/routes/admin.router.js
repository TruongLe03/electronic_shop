import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import requireAdmin from '../middleware/adminMiddleware.js';
import {
  getDashboardStats,
  getRecentOrders,
  getRecentUsers,
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getSalesAnalytics,
  getUsersAnalytics,
  getProductsAnalytics
} from '../controllers/admin.controller.js';

// Import existing controllers to reuse
import {
  getProducts,
  getProductById as getProductByIdOriginal,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/products.controller.js';

import inventoryController from '../controllers/inventory.controller.js';

const router = express.Router();

// Apply auth and admin middleware to all admin routes
router.use(authMiddleware);
router.use(requireAdmin);

// ===== DASHBOARD =====
router.get('/stats', getDashboardStats);
router.get('/recent-orders', getRecentOrders);
router.get('/recent-users', getRecentUsers);

// ===== USER MANAGEMENT =====
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserById);
router.patch('/users/:userId/status', updateUserStatus);
router.patch('/users/:userId/role', updateUserRole);
router.delete('/users/:userId', deleteUser);

// ===== ORDER MANAGEMENT =====
router.get('/orders', getAllOrders);
router.get('/orders/:orderId', getOrderById);
router.patch('/orders/:orderId/status', updateOrderStatus);

// ===== PRODUCT MANAGEMENT (reuse existing controllers) =====
router.get('/products', getProducts);
router.get('/products/:id', getProductByIdOriginal);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// ===== INVENTORY MANAGEMENT (reuse existing controllers) =====
router.get('/inventory', inventoryController.getInventories);
router.get('/inventory/stats', inventoryController.getInventoryStats);
router.get('/inventory/product/:productId', inventoryController.getInventoryByProduct);
router.get('/inventory/movements/:productId', inventoryController.getStockMovements);
router.put('/inventory/product/:productId', inventoryController.updateInventory);
router.post('/inventory/adjustment', inventoryController.addStock);

// ===== ANALYTICS =====
router.get('/analytics/sales', getSalesAnalytics);
router.get('/analytics/users', getUsersAnalytics);
router.get('/analytics/products', getProductsAnalytics);

export default router;