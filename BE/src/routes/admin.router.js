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
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  
  // Order Management
  getAllOrdersAdmin,
  updateOrderStatus,
  deleteOrder,
  
  // Inventory Management
  getInventoryList,
  updateInventory,
  
  // Category Management
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  
  // Payment Management
  getAllPayments,
  getPaymentById,
  updatePaymentStatus,
  getPaymentStats,
  
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
  getSystemInfo,
  getSystemSettings,
  updateSystemSettings
} from "../controllers/admin.controller.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const adminRouter = express.Router();

// Middleware: Tất cả routes admin phải được xác thực và là admin
adminRouter.use(authMiddleware);
adminRouter.use(adminMiddleware);

// ============= DASHBOARD & ANALYTICS =============
adminRouter.get("/dashboard/overview", getDashboardStats);
adminRouter.get("/dashboard/growth", getGrowthAnalytics);

// ============= USER MANAGEMENT =============
adminRouter.get("/users/all", getAllUsers);
adminRouter.get("/users/vip-customers", getVIPCustomers);
adminRouter.get("/users/:id", getUserById);
adminRouter.put("/users/:id", updateUser);
adminRouter.patch("/users/:id/status", toggleUserStatus);
adminRouter.delete("/users/:id", deleteUser);

// ============= PRODUCT MANAGEMENT =============
// Product listings and discovery
adminRouter.get("/products/all", getAllProductsAdmin);
adminRouter.get("/products/:id", getProductById);
// Product analytics
adminRouter.get("/products/category-stats", getProductCategoryStats);
adminRouter.get("/products/low-stock-alert", getLowStockAlert);
// Product operations
adminRouter.post("/products", createProduct);
adminRouter.put("/products/:id", updateProduct);
adminRouter.patch("/products/:id/status", toggleProductStatus);
adminRouter.delete("/products/:id", deleteProduct);

// ============= ORDER MANAGEMENT =============
adminRouter.get("/orders/all", getAllOrdersAdmin);
adminRouter.get("/orders/daily-stats", getOrdersByDayStats);
adminRouter.patch("/orders/:id/status", updateOrderStatus);
adminRouter.delete("/orders/:id", deleteOrder);

// ============= INVENTORY CONTROL =============
adminRouter.get("/inventory/stock-levels", getInventoryList);
adminRouter.put("/inventory/products/:productId", updateInventory);

// ============= CATEGORY MANAGEMENT =============
adminRouter.get("/categories/all", getAllCategories);
adminRouter.post("/categories", createCategory);
adminRouter.put("/categories/:id", updateCategory);
adminRouter.delete("/categories/:id", deleteCategory);

// ============= PAYMENT OVERSIGHT =============
adminRouter.get("/payments/all", getAllPayments);
adminRouter.get("/payments/statistics", getPaymentStats);
adminRouter.get("/payments/:id", getPaymentById);
adminRouter.patch("/payments/:id/status", updatePaymentStatus);

// ============= REPORTS & ANALYTICS =============
adminRouter.get("/reports/revenue", generateRevenueReport);
adminRouter.get("/reports/products", generateProductReport);

// ============= SYSTEM ADMINISTRATION =============
adminRouter.get("/system/information", getSystemInfo);
adminRouter.get("/system/settings", getSystemSettings);
adminRouter.put("/system/settings", updateSystemSettings);

export default adminRouter;