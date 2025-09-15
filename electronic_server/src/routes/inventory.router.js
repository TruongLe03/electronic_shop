import express from 'express';
import inventoryController from '../controllers/inventory.controller.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware to check if user is admin
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
};

// Apply auth middleware to all routes
router.use(authMiddleware);

// Public routes (for checking stock availability)
router.get('/check/:productId', inventoryController.checkStock);

// Admin only routes
router.use(adminOnly);

// Get all inventories with filters and pagination
router.get('/', inventoryController.getInventories);

// Get inventory dashboard stats
router.get('/stats', inventoryController.getInventoryStats);

// Run stock migration (one-time setup)
router.post('/migrate-stock', inventoryController.runStockMigration);

// Get inventory by product ID
router.get('/product/:productId', inventoryController.getInventoryByProduct);

// Get stock movements history for a product
router.get('/movements/:productId', inventoryController.getStockMovements);

// Update inventory settings
router.put('/product/:productId', inventoryController.updateInventory);

// Add stock (stock in)
router.post('/add/:productId', inventoryController.addStock);

// Remove stock (stock out)
router.post('/remove/:productId', inventoryController.removeStock);

export default router;