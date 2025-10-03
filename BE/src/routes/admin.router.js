import express from "express";
import {
  // Dashboard Analytics
  getDashboardStats,
  
  // User Management
  getAllUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
  deleteUser,
  
  // Product Management
  getAllProductsAdmin,
  
  // Order Management
  getAllOrdersAdmin,
  updateOrderStatus,
  
  // Inventory Management
  getInventoryList,
  updateInventory,
  
  // Advanced Analytics
  getGrowthAnalytics,
  getProductCategoryStats,
  getVIPCustomers,
  getLowStockAlert,
  getOrdersByDayStats,
  
  // Reports
  generateRevenueReport,
  generateProductReport,
  
  // System Management
  getSystemInfo
} from "../controllers/admin.controller.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const adminRouter = express.Router();

// Middleware: Tất cả routes admin phải được xác thực và là admin
adminRouter.use(authMiddleware);
adminRouter.use(adminMiddleware);

// ============= DASHBOARD ROUTES =============
adminRouter.get("/dashboard/stats", getDashboardStats);
adminRouter.get("/dashboard/growth", getGrowthAnalytics);

// ============= USER MANAGEMENT ROUTES =============
adminRouter.get("/users", getAllUsers);
adminRouter.get("/users/:id", getUserById);
adminRouter.put("/users/:id", updateUser);
adminRouter.patch("/users/:id/toggle-status", toggleUserStatus);
adminRouter.delete("/users/:id", deleteUser);
adminRouter.get("/users/vip/customers", getVIPCustomers);

// ============= PRODUCT MANAGEMENT ROUTES =============
adminRouter.get("/products", getAllProductsAdmin);
adminRouter.get("/products/category-stats", getProductCategoryStats);
adminRouter.get("/products/low-stock", getLowStockAlert);

// ============= ORDER MANAGEMENT ROUTES =============
adminRouter.get("/orders", getAllOrdersAdmin);
adminRouter.patch("/orders/:id/status", updateOrderStatus);
adminRouter.get("/orders/day-stats", getOrdersByDayStats);

// ============= INVENTORY MANAGEMENT ROUTES =============
adminRouter.get("/inventory", getInventoryList);
adminRouter.put("/inventory/:productId", updateInventory);

// ============= ANALYTICS & REPORTS ROUTES =============
adminRouter.get("/reports/revenue", generateRevenueReport);
adminRouter.get("/reports/products", generateProductReport);

// ============= SYSTEM MANAGEMENT ROUTES =============
adminRouter.get("/system/info", getSystemInfo);

export default adminRouter;