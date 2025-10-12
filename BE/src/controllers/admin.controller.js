import { AdminAnalyticsService, AdminReportService } from "../services/adminService.js";
import { UserService } from "../services/userService.js";
import { ProductService } from "../services/productService.js";
import { OrderService } from "../services/orderService.js";
import { InventoryService } from "../services/inventoryService.js";
import { ResponseUtil, asyncHandler } from "../utils/response.util.js";
import { ValidationUtil } from "../utils/validation.util.js";

// ============= DASHBOARD ANALYTICS =============

// Lấy thống kê tổng quan cho dashboard
export const getDashboardStats = asyncHandler(async (req, res) => {
  const dashboardData = await AdminAnalyticsService.getDashboardStats();
  return ResponseUtil.success(res, dashboardData, 'Lấy thống kê dashboard thành công');
});

// ============= USER MANAGEMENT =============

// Lấy danh sách tất cả người dùng
export const getAllUsers = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    search = "", 
    role = "", 
    status = "",
    sortBy = "createdAt",
    sortOrder = "desc"
  } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    search,
    role,
    status,
    sortBy,
    sortOrder
  };

  const result = await UserService.getAllUsers(options);
  return ResponseUtil.success(res, result, 'Lấy danh sách người dùng thành công');
});

// Lấy thông tin chi tiết một người dùng
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!id || !ValidationUtil.isValidObjectId(id)) {
    return ResponseUtil.validationError(res, ['User ID không hợp lệ']);
  }

  const userData = await UserService.getUserByIdWithStats(id);
  
  if (!userData) {
    return ResponseUtil.notFound(res, 'Không tìm thấy người dùng');
  }

  return ResponseUtil.success(res, userData, 'Lấy thông tin người dùng thành công');
});

// Cập nhật thông tin người dùng
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!id || !ValidationUtil.isValidObjectId(id)) {
    return ResponseUtil.validationError(res, ['User ID không hợp lệ']);
  }

  // Không cho phép cập nhật password qua API này
  delete updateData.password;

  const updatedUser = await UserService.updateUser(id, updateData);
  
  if (!updatedUser) {
    return ResponseUtil.notFound(res, 'Không tìm thấy người dùng');
  }

  return ResponseUtil.success(res, updatedUser, 'Cập nhật thông tin người dùng thành công');
});

// Thay đổi trạng thái người dùng (active/inactive)
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!id || !ValidationUtil.isValidObjectId(id)) {
    return ResponseUtil.validationError(res, ['User ID không hợp lệ']);
  }

  const result = await UserService.toggleUserStatus(id);
  
  if (!result) {
    return ResponseUtil.notFound(res, 'Không tìm thấy người dùng');
  }

  const message = `${result.status === 'active' ? 'Kích hoạt' : 'Vô hiệu hóa'} người dùng thành công`;
  return ResponseUtil.success(res, result, message);
});

// Xóa người dùng
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!id || !ValidationUtil.isValidObjectId(id)) {
    return ResponseUtil.validationError(res, ['User ID không hợp lệ']);
  }

  const result = await UserService.deleteUser(id);
  
  if (!result.success) {
    if (result.reason === 'NOT_FOUND') {
      return ResponseUtil.notFound(res, 'Không tìm thấy người dùng');
    } else if (result.reason === 'HAS_ORDERS') {
      return ResponseUtil.error(res, 'Không thể xóa người dùng đã có đơn hàng. Hãy vô hiệu hóa thay vì xóa.', 400);
    }
  }

  return ResponseUtil.success(res, null, 'Xóa người dùng thành công');
});

// ============= PRODUCT MANAGEMENT =============

// Lấy danh sách sản phẩm cho admin
export const getAllProductsAdmin = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    category = "",
    status = "",
    sortBy = "createdAt",
    sortOrder = "desc"
  } = req.query;

  const filters = {
    sortBy,
    sortOrder
  };

  // Chỉ thêm filter khi có giá trị
  if (search && search.trim() !== '') {
    filters.search = search;
  }
  
  if (category && category.trim() !== '') {
    filters.category_id = category;
  }
  
  if (status && status.trim() !== '') {
    filters.status = status;
  }

  const pagination = {
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const result = await ProductService.getProducts(filters, pagination);
  return ResponseUtil.success(res, result, 'Lấy danh sách sản phẩm thành công');
});

// Lấy chi tiết sản phẩm
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!id || !ValidationUtil.isValidObjectId(id)) {
    return ResponseUtil.validationError(res, ['Product ID không hợp lệ']);
  }

  const product = await ProductService.getProductById(id);
  if (!product) {
    return ResponseUtil.notFound(res, 'Không tìm thấy sản phẩm');
  }

  return ResponseUtil.success(res, product, 'Lấy thông tin sản phẩm thành công');
});

// Tạo sản phẩm mới
export const createProduct = asyncHandler(async (req, res) => {
  const productData = req.body;
  
  // Validation basic
  const requiredFields = ['name', 'price', 'category', 'stock'];
  const missingFields = requiredFields.filter(field => !productData[field]);
  
  if (missingFields.length > 0) {
    return ResponseUtil.validationError(res, [`Thiếu các trường bắt buộc: ${missingFields.join(', ')}`]);
  }

  // Thêm admin info
  productData.createdBy = req.user.userId;
  productData.updatedBy = req.user.userId;

  const newProduct = await ProductService.createProduct(productData);
  return ResponseUtil.success(res, newProduct, 'Tạo sản phẩm thành công', 201);
});

// Cập nhật sản phẩm
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  if (!id || !ValidationUtil.isValidObjectId(id)) {
    return ResponseUtil.validationError(res, ['Product ID không hợp lệ']);
  }

  // Thêm admin info
  updateData.updatedBy = req.user.userId;
  updateData.updatedAt = new Date();

  const updatedProduct = await ProductService.updateProduct(id, updateData);
  if (!updatedProduct) {
    return ResponseUtil.notFound(res, 'Không tìm thấy sản phẩm');
  }

  return ResponseUtil.success(res, updatedProduct, 'Cập nhật sản phẩm thành công');
});

// Xóa sản phẩm
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!id || !ValidationUtil.isValidObjectId(id)) {
    return ResponseUtil.validationError(res, ['Product ID không hợp lệ']);
  }

  const deletedProduct = await ProductService.deleteProduct(id);
  if (!deletedProduct) {
    return ResponseUtil.notFound(res, 'Không tìm thấy sản phẩm');
  }

  return ResponseUtil.success(res, { deletedId: id }, 'Xóa sản phẩm thành công');
});

// Thay đổi trạng thái sản phẩm
export const toggleProductStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!id || !ValidationUtil.isValidObjectId(id)) {
    return ResponseUtil.validationError(res, ['Product ID không hợp lệ']);
  }

  const product = await ProductService.getProductById(id);
  if (!product) {
    return ResponseUtil.notFound(res, 'Không tìm thấy sản phẩm');
  }

  const newStatus = product.status === 'active' ? 'inactive' : 'active';
  const updatedProduct = await ProductService.updateProduct(id, { 
    status: newStatus,
    updatedBy: req.user.userId,
    updatedAt: new Date()
  });

  return ResponseUtil.success(res, updatedProduct, 'Thay đổi trạng thái sản phẩm thành công');
});

// ============= ORDER MANAGEMENT =============

// Lấy danh sách đơn hàng cho admin
export const getAllOrdersAdmin = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status = "",
    startDate = "",
    endDate = "",
    userId = "",
    sortBy = "createdAt",
    sortOrder = "desc"
  } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    status,
    startDate,
    endDate,
    userId,
    sortBy,
    sortOrder
  };

  const filters = {
    status,
    dateFrom: startDate,
    dateTo: endDate,
    userId,
    sortBy,
    sortOrder
  };

  const result = await OrderService.getAllOrders(parseInt(page), parseInt(limit), filters);
  return ResponseUtil.success(res, result, 'Lấy danh sách đơn hàng thành công');
});

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;

  if (!id || !ValidationUtil.isValidObjectId(id)) {
    return ResponseUtil.validationError(res, ['Order ID không hợp lệ']);
  }

  const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
  
  if (!status || !validStatuses.includes(status)) {
    return ResponseUtil.validationError(res, ['Trạng thái đơn hàng không hợp lệ']);
  }

  const updateData = { status };
  if (note) {
    updateData.adminNote = note.trim();
  }

  const updatedOrder = await OrderService.updateOrderStatus(id, updateData);
  
  if (!updatedOrder) {
    return ResponseUtil.notFound(res, 'Không tìm thấy đơn hàng');
  }

  return ResponseUtil.success(res, updatedOrder, 'Cập nhật trạng thái đơn hàng thành công');
});

// ============= INVENTORY MANAGEMENT =============

// Lấy danh sách tồn kho
export const getInventoryList = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    lowStock = false,
    sortBy = "createdAt",
    sortOrder = "desc"
  } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    search,
    lowStock: lowStock === "true",
    sortBy,
    sortOrder
  };

  const result = await InventoryService.getAllInventories(options);
  return ResponseUtil.success(res, result, 'Lấy danh sách tồn kho thành công');
});

// Cập nhật số lượng tồn kho
export const updateInventory = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity, action = "set" } = req.body; // action: "set", "add", "subtract"

  if (!productId || !ValidationUtil.isValidObjectId(productId)) {
    return ResponseUtil.validationError(res, ['Product ID không hợp lệ']);
  }

  if (quantity === undefined || quantity < 0 || !Number.isInteger(quantity)) {
    return ResponseUtil.validationError(res, ['Số lượng phải là số nguyên không âm']);
  }

  const validActions = ["set", "add", "subtract"];
  if (!validActions.includes(action)) {
    return ResponseUtil.validationError(res, ['Action không hợp lệ']);
  }

  const updateData = { quantity, action };
  const updatedInventory = await InventoryService.updateInventory(productId, updateData);

  return ResponseUtil.success(res, updatedInventory, 'Cập nhật tồn kho thành công');
});

// ============= ADVANCED ANALYTICS =============

// Lấy thống kê tăng trưởng
export const getGrowthAnalytics = asyncHandler(async (req, res) => {
  const growthStats = await AdminAnalyticsService.getGrowthStats();
  return ResponseUtil.success(res, growthStats, 'Lấy thống kê tăng trưởng thành công');
});

// Lấy thống kê sản phẩm theo danh mục
export const getProductCategoryStats = asyncHandler(async (req, res) => {
  const categoryStats = await AdminAnalyticsService.getProductsByCategory();
  return ResponseUtil.success(res, categoryStats, 'Lấy thống kê sản phẩm theo danh mục thành công');
});

// Lấy danh sách khách hàng VIP
export const getVIPCustomers = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const vipCustomers = await AdminAnalyticsService.getVIPCustomers(parseInt(limit));
  return ResponseUtil.success(res, vipCustomers, 'Lấy danh sách khách hàng VIP thành công');
});

// Lấy sản phẩm sắp hết hàng
export const getLowStockAlert = asyncHandler(async (req, res) => {
  const { threshold = 10 } = req.query;
  const lowStockProducts = await AdminAnalyticsService.getLowStockProducts(parseInt(threshold));
  return ResponseUtil.success(res, lowStockProducts, 'Lấy cảnh báo sản phẩm sắp hết hàng thành công');
});

// Lấy thống kê đơn hàng theo ngày trong tuần
export const getOrdersByDayStats = asyncHandler(async (req, res) => {
  const orderStats = await AdminAnalyticsService.getOrdersByDayOfWeek();
  return ResponseUtil.success(res, orderStats, 'Lấy thống kê đơn hàng theo ngày thành công');
});

// ============= REPORTS =============

// Tạo báo cáo doanh thu
export const generateRevenueReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return ResponseUtil.validationError(res, ['Vui lòng cung cấp ngày bắt đầu và ngày kết thúc']);
  }

  if (!ValidationUtil.isValidDate(startDate) || !ValidationUtil.isValidDate(endDate)) {
    return ResponseUtil.validationError(res, ['Định dạng ngày không hợp lệ']);
  }

  const report = await AdminReportService.generateRevenueReport(startDate, endDate);
  return ResponseUtil.success(res, report, 'Tạo báo cáo doanh thu thành công');
});

// Tạo báo cáo sản phẩm bán chạy
export const generateProductReport = asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;
  const limitNum = parseInt(limit);
  
  if (limitNum <= 0 || limitNum > 100) {
    return ResponseUtil.validationError(res, ['Limit phải từ 1 đến 100']);
  }

  const report = await AdminReportService.generateProductReport(limitNum);
  return ResponseUtil.success(res, report, 'Tạo báo cáo sản phẩm thành công');
});

// ============= SYSTEM MANAGEMENT =============

// Lấy thông tin hệ thống
export const getSystemInfo = asyncHandler(async (req, res) => {
  const systemInfo = await AdminAnalyticsService.getSystemInfo();
  return ResponseUtil.success(res, systemInfo, 'Lấy thông tin hệ thống thành công');
});
