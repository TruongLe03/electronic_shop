import express from "express";
import {
  // Dashboard Analytics
  getDashboardStats,
  getRevenueChartData,
  
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
  getOrderById,
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
  exportReport,
  
  // System Management
  getSystemInfo,
  getSystemSettings,
  updateSystemSettings
} from "../controllers/admin.controller.js";

import { requireAdminAuth } from "../middleware/authMiddleware.js";

const adminRouter = express.Router();

// ============= DASHBOARD & ANALYTICS - Admin Only =============
adminRouter.get("/dashboard/overview", requireAdminAuth, getDashboardStats);
adminRouter.get("/dashboard/revenue-chart", requireAdminAuth, getRevenueChartData);
adminRouter.get("/dashboard/growth", requireAdminAuth, getGrowthAnalytics);

// ============= USER MANAGEMENT - Admin Only =============
adminRouter.get("/users/all", requireAdminAuth, getAllUsers);
adminRouter.get("/users/vip-customers", requireAdminAuth, getVIPCustomers);
adminRouter.get("/users/:id", requireAdminAuth, getUserById);
adminRouter.put("/users/:id", requireAdminAuth, updateUser);
adminRouter.patch("/users/:id/status", requireAdminAuth, toggleUserStatus);
adminRouter.delete("/users/:id", requireAdminAuth, deleteUser);

// ============= PRODUCT MANAGEMENT - Admin Only =============
// Product listings and discovery
adminRouter.get("/products/all", requireAdminAuth, getAllProductsAdmin);
adminRouter.get("/products/:id", requireAdminAuth, getProductById);
// Product analytics
adminRouter.get("/products/category-stats", requireAdminAuth, getProductCategoryStats);
adminRouter.get("/products/low-stock-alert", requireAdminAuth, getLowStockAlert);
// Product operations
adminRouter.post("/products", requireAdminAuth, createProduct);
adminRouter.put("/products/:id", requireAdminAuth, updateProduct);
adminRouter.patch("/products/:id/status", requireAdminAuth, toggleProductStatus);
adminRouter.delete("/products/:id", requireAdminAuth, deleteProduct);

// ============= ORDER MANAGEMENT - Admin Only =============
adminRouter.get("/orders/all", requireAdminAuth, getAllOrdersAdmin);
adminRouter.get("/orders/daily-stats", requireAdminAuth, getOrdersByDayStats);
adminRouter.get("/orders/:id", requireAdminAuth, getOrderById);
adminRouter.patch("/orders/:id/status", requireAdminAuth, updateOrderStatus);
adminRouter.delete("/orders/:id", requireAdminAuth, deleteOrder);

// ============= INVENTORY CONTROL - Admin Only =============
adminRouter.get("/inventory/stock-levels", requireAdminAuth, getInventoryList);
adminRouter.put("/inventory/products/:productId", requireAdminAuth, updateInventory);

// ============= CATEGORY MANAGEMENT - Admin Only =============
adminRouter.get("/categories/all", requireAdminAuth, getAllCategories);
adminRouter.post("/categories", requireAdminAuth, createCategory);
adminRouter.put("/categories/:id", requireAdminAuth, updateCategory);
adminRouter.delete("/categories/:id", requireAdminAuth, deleteCategory);

// ============= PAYMENT OVERSIGHT - Admin Only =============
adminRouter.get("/payments/all", requireAdminAuth, getAllPayments);
adminRouter.get("/payments/statistics", requireAdminAuth, getPaymentStats);
adminRouter.get("/payments/:id", requireAdminAuth, getPaymentById);
adminRouter.patch("/payments/:id/status", requireAdminAuth, updatePaymentStatus);

// ============= REPORTS & ANALYTICS - Admin Only =============
adminRouter.get("/reports/revenue", requireAdminAuth, generateRevenueReport);
adminRouter.get("/reports/products", requireAdminAuth, generateProductReport);
adminRouter.get("/reports/export", requireAdminAuth, exportReport);

// ============= SYSTEM ADMINISTRATION - Admin Only =============
adminRouter.get("/system/information", requireAdminAuth, getSystemInfo);
adminRouter.get("/system/settings", requireAdminAuth, getSystemSettings);
adminRouter.put("/system/settings", requireAdminAuth, updateSystemSettings);

export default adminRouter;