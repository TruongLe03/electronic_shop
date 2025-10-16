// Import các module cần thiết
import * as userService from "./userService";
import * as productService from "./productService";
import * as orderService from "./orderService";
import * as categoryService from "./categoryService";
import * as inventoryService from "./inventoryService";
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

  // Inventory management (Tồn kho)
  ...inventoryService,

  // Dashboard & Statistics
  ...dashboardService,
};
