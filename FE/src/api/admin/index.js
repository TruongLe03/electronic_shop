// Import các module cần thiết
import * as userService from "./userService";
import * as productService from "./productService";
import * as orderService from "./orderService";
import * as categoryService from "./categoryService";
import * as inventoryService from "./inventoryService";
import * as paymentService from "./paymentService";
import * as dashboardService from "./dashboardService";

// Export các functions cần thiết
export {
  // User Management
  getAllUsersAdmin,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  toggleUserStatus,
  deleteUser,
  getUserActivityHistory,
} from "./userService";

export {
  // Product Management
  getAllProductsAdmin,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getProductCategoryStats,
} from "./productService";

export {
  // Category Management
  getCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
  getParentCategories,
} from "./categoryService";

export {
  // Order Management
  getAllOrdersAdmin,
  getOrderById,
  updateOrderStatus,
  deleteOrderAdmin,
  getOrdersByDayStats,
} from "./orderService";

export {
  // Inventory Management (Quản lý tồn kho)
  getInventory,
  updateInventory,
  getInventoryHistory,
} from "./inventoryService";

export {
  // Payment Management
  getPayments,
  getPaymentStats,
  getPaymentById,
  updatePaymentStatus,
  processRefund,
  getPaymentRefunds,
  exportPayments,
  getPaymentMethodStats,
} from "./paymentService";

export {
  // Dashboard & Statistics
  getDashboardStats,
  getRecentActivities,
  getRevenueChartData,
  getDashboardTopProducts,
} from "./dashboardService";

// Default export object với các module cần thiết
export default {
  // User management
  ...userService,

  // Product management
  ...productService,

  // Category management
  ...categoryService,

  // Order management
  ...orderService,

  // Inventory management (Tồ kho)
  ...inventoryService,

  // Payment management
  ...paymentService,

  // Dashboard & Statistics
  ...dashboardService,
};
