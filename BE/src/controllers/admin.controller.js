import { AdminAnalyticsService, AdminReportService } from "../services/adminService.js";
import { ReportService } from "../services/reportService.js";
import { ExportService } from "../services/exportService.js";
import { UserService } from "../services/userService.js";
import { ProductService } from "../services/productService.js";
import { OrderService } from "../services/orderService.js";
import { InventoryService } from "../services/inventoryService.js";
import { CategoryService } from "../services/categoryService.js";
import { PaymentService } from "../services/paymentService.js";
import { ResponseUtil, asyncHandler } from "../utils/response.util.js";
import { ValidationUtil } from "../utils/validation.util.js";

// ============= DASHBOARD ANALYTICS =============

// Lấy thống kê tổng quan cho dashboard
export const getDashboardStats = asyncHandler(async (req, res) => {
  const dashboardData = await AdminAnalyticsService.getDashboardStats();
  return ResponseUtil.success(res, dashboardData, 'Lấy thống kê dashboard thành công');
});

// Lấy dữ liệu biểu đồ doanh thu
export const getRevenueChartData = asyncHandler(async (req, res) => {
  const { period = "month" } = req.query;
  const chartData = await AdminAnalyticsService.getRevenueChartData(period);
  return ResponseUtil.success(res, chartData, 'Lấy dữ liệu biểu đồ doanh thu thành công');
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
  const requiredFields = ['name', 'price', 'category_id', 'sku'];
  const missingFields = requiredFields.filter(field => !productData[field]);
  
  if (missingFields.length > 0) {
    return ResponseUtil.validationError(res, [`Thiếu các trường bắt buộc: ${missingFields.join(', ')}`]);
  }

  // Validate ObjectId cho category_id
  if (!ValidationUtil.isValidObjectId(productData.category_id)) {
    return ResponseUtil.validationError(res, ['Category ID không hợp lệ']);
  }

  // Validate price
  if (isNaN(productData.price) || productData.price < 0) {
    return ResponseUtil.validationError(res, ['Giá sản phẩm phải là số dương']);
  }

  // Thêm admin info
  productData.createdBy = req.user?.userId;
  productData.updatedBy = req.user?.userId;

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

// Lấy chi tiết đơn hàng (Admin)
export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || !ValidationUtil.isValidObjectId(id)) {
    return ResponseUtil.validationError(res, ['Order ID không hợp lệ']);
  }

  const order = await OrderService.getOrderById(id);
  if (!order) {
    return ResponseUtil.notFound(res, 'Không tìm thấy đơn hàng');
  }

  return ResponseUtil.success(res, order, 'Lấy chi tiết đơn hàng thành công');
});

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;

  if (!id || !ValidationUtil.isValidObjectId(id)) {
    return ResponseUtil.validationError(res, ['Order ID không hợp lệ']);
  }

  // Allow the full set of statuses defined in the Order model so admin UI can set any of them;
  // OrderService.updateOrderStatus will still validate allowed transitions.
  const validStatuses = [
    "pending",
    "payment_pending",
    "payment_failed",
    "confirmed",
    "processing",
    "ready_to_ship",
    "shipping",
    "delivered",
    "cancelled",
    "returned",
  ];

  if (!status || !validStatuses.includes(status)) {
    return ResponseUtil.validationError(res, ['Trạng thái đơn hàng không hợp lệ']);
  }

  // Gọi OrderService với đúng parameters
  const updatedOrder = await OrderService.updateOrderStatus(id, status, null); // null vì admin không cần userId
  
  if (!updatedOrder) {
    return ResponseUtil.notFound(res, 'Không tìm thấy đơn hàng');
  }

  // Cập nhật note nếu có
  if (note) {
    updatedOrder.adminNote = note.trim();
    await updatedOrder.save();
  }

  return ResponseUtil.success(res, updatedOrder, 'Cập nhật trạng thái đơn hàng thành công');
});

// Xóa đơn hàng (Admin only)
export const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || !ValidationUtil.isValidObjectId(id)) {
    return ResponseUtil.validationError(res, ['Order ID không hợp lệ']);
  }

  const result = await OrderService.deleteOrder(id);
  return ResponseUtil.success(res, result, result.message);
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

// Xuất báo cáo với nhiều loại và thời gian
export const exportReport = asyncHandler(async (req, res) => {
  const { type, timeRange, startDate, endDate, format = 'json' } = req.query;

  // Validate report type
  const validTypes = ['revenue', 'inventory', 'best-sellers', 'orders', 'categories', 'comprehensive'];
  if (!type || !validTypes.includes(type)) {
    return ResponseUtil.validationError(res, ['Loại báo cáo không hợp lệ. Chọn: revenue, inventory, best-sellers, orders, categories, comprehensive']);
  }

  // Validate time range
  const validTimeRanges = ['day', 'week', 'month', 'quarter', 'year', 'custom'];
  if (!timeRange || !validTimeRanges.includes(timeRange)) {
    return ResponseUtil.validationError(res, ['Khoảng thời gian không hợp lệ. Chọn: day, week, month, quarter, year, custom']);
  }

  // Validate format
  const validFormats = ['json', 'excel', 'pdf', 'word'];
  if (!validFormats.includes(format)) {
    return ResponseUtil.validationError(res, ['Định dạng không hợp lệ. Chọn: json, excel, pdf, word']);
  }

  // Validate custom dates if needed
  if (timeRange === 'custom') {
    if (!startDate || !endDate) {
      return ResponseUtil.validationError(res, ['Vui lòng cung cấp startDate và endDate cho khoảng thời gian tùy chỉnh']);
    }
    if (!ValidationUtil.isValidDate(startDate) || !ValidationUtil.isValidDate(endDate)) {
      return ResponseUtil.validationError(res, ['Định dạng ngày không hợp lệ']);
    }
  }

  let report;

  // Generate report data
  switch (type) {
    case 'revenue':
      report = await ReportService.generateRevenueReport(timeRange, startDate, endDate);
      break;
    case 'inventory':
      report = await ReportService.generateInventoryReport(timeRange, startDate, endDate);
      break;
    case 'best-sellers':
      report = await ReportService.generateBestSellersReport(timeRange, startDate, endDate);
      break;
    case 'orders':
      report = await ReportService.generateOrdersReport(timeRange, startDate, endDate);
      break;
    case 'categories':
      report = await ReportService.generateCategoryReport(timeRange, startDate, endDate);
      break;
    case 'comprehensive':
      report = await ReportService.generateComprehensiveReport(timeRange, startDate, endDate);
      break;
    default:
      return ResponseUtil.validationError(res, ['Loại báo cáo không được hỗ trợ']);
  }

  // Export based on format
  if (format === 'excel') {
    let workbook;
    if (type === 'revenue') {
      workbook = await ExportService.exportRevenueToExcel(report);
    } else if (type === 'inventory') {
      workbook = await ExportService.exportInventoryToExcel(report);
    } else if (type === 'best-sellers') {
      workbook = await ExportService.exportBestSellersToExcel(report);
    } else {
      // Generic Excel export for other types
      workbook = await ExportService.exportRevenueToExcel(report);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=bao-cao-${type}-${Date.now()}.xlsx`);
    return res.send(buffer);
  } else if (format === 'pdf') {
    const pdfBuffer = await ExportService.exportToPDF(report, type);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=bao-cao-${type}-${Date.now()}.pdf`);
    return res.send(pdfBuffer);
  } else if (format === 'word') {
    const wordBuffer = await ExportService.exportToWord(report, type);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=bao-cao-${type}-${Date.now()}.docx`);
    return res.send(wordBuffer);
  } else {
    // JSON format (default)
    return ResponseUtil.success(res, report, `Tạo báo cáo ${type} thành công`);
  }
});

// ============= CATEGORY MANAGEMENT =============

// Lấy danh sách danh mục
export const getAllCategories = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    parent_id = "",
    sortBy = "createdAt",
    sortOrder = "desc"
  } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    search,
    parent_id,
    sortBy,
    sortOrder
  };

  const result = await CategoryService.getAllCategories(options);
  return ResponseUtil.success(res, result, 'Lấy danh sách danh mục thành công');
});

// Tạo danh mục mới
export const createCategory = asyncHandler(async (req, res) => {
  const categoryData = req.body;
  
  const requiredFields = ['name', 'slug'];
  const missingFields = requiredFields.filter(field => !categoryData[field]);
  
  if (missingFields.length > 0) {
    return ResponseUtil.validationError(res, [`Thiếu các trường bắt buộc: ${missingFields.join(', ')}`]);
  }

  const newCategory = await CategoryService.createCategory(categoryData);
  return ResponseUtil.success(res, newCategory, 'Tạo danh mục thành công', 201);
});

// Cập nhật danh mục
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  console.log('🔄 Update category request:', { id, updateData });
  
  if (!id || !ValidationUtil.isValidObjectId(id)) {
    return ResponseUtil.validationError(res, ['Category ID không hợp lệ']);
  }

  try {
    const updatedCategory = await CategoryService.updateCategory(id, updateData);
    if (!updatedCategory) {
      return ResponseUtil.notFound(res, 'Không tìm thấy danh mục');
    }

    return ResponseUtil.success(res, updatedCategory, 'Cập nhật danh mục thành công');
  } catch (error) {
    console.error('❌ Controller update error:', error);
    
    // Handle specific validation errors
    if (error.message.includes('đã tồn tại')) {
      return ResponseUtil.error(res, error.message, 400);
    }
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return ResponseUtil.validationError(res, messages);
    }
    
    throw error; // Let asyncHandler catch other errors
  }
});

// Xóa danh mục
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!id || !ValidationUtil.isValidObjectId(id)) {
    return ResponseUtil.validationError(res, ['Category ID không hợp lệ']);
  }

  const result = await CategoryService.deleteCategory(id);
  
  if (!result.success) {
    if (result.reason === 'NOT_FOUND') {
      return ResponseUtil.notFound(res, 'Không tìm thấy danh mục');
    } else if (result.reason === 'HAS_PRODUCTS') {
      return ResponseUtil.error(res, 'Không thể xóa danh mục đang có sản phẩm', 400);
    } else if (result.reason === 'HAS_CHILDREN') {
      const message = result.childNames 
        ? `Không thể xóa danh mục cha đang có ${result.childCount} danh mục con: ${result.childNames}`
        : 'Không thể xóa danh mục cha đang có danh mục con';
      return ResponseUtil.error(res, message, 400);
    }
  }

  return ResponseUtil.success(res, null, 'Xóa danh mục thành công');
});

// ============= PAYMENT MANAGEMENT =============

// Lấy danh sách thanh toán
export const getAllPayments = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status = "",
    method = "",
    startDate = "",
    endDate = "",
    sortBy = "createdAt",
    sortOrder = "desc"
  } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    status,
    method,
    startDate,
    endDate,
    sortBy,
    sortOrder
  };

  const result = await PaymentService.getAllPayments(options);
  return ResponseUtil.success(res, result, 'Lấy danh sách thanh toán thành công');
});

// Lấy chi tiết thanh toán
export const getPaymentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!id || !ValidationUtil.isValidObjectId(id)) {
    return ResponseUtil.validationError(res, ['Payment ID không hợp lệ']);
  }

  const payment = await PaymentService.getPaymentById(id);
  if (!payment) {
    return ResponseUtil.notFound(res, 'Không tìm thấy thanh toán');
  }

  return ResponseUtil.success(res, payment, 'Lấy thông tin thanh toán thành công');
});

// Cập nhật trạng thái thanh toán (cho COD, bank transfer)
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;

  if (!id || !ValidationUtil.isValidObjectId(id)) {
    return ResponseUtil.validationError(res, ['Payment ID không hợp lệ']);
  }

  const validStatuses = ["pending", "processing", "success", "failed", "cancelled", "refunded"];
  
  if (!status || !validStatuses.includes(status)) {
    return ResponseUtil.validationError(res, ['Trạng thái thanh toán không hợp lệ']);
  }

  const updateData = { status };
  if (note) {
    updateData.adminNote = note.trim();
  }

  const updatedPayment = await PaymentService.updatePaymentStatus(id, updateData);
  
  if (!updatedPayment) {
    return ResponseUtil.notFound(res, 'Không tìm thấy thanh toán');
  }

  return ResponseUtil.success(res, updatedPayment, 'Cập nhật trạng thái thanh toán thành công');
});

// Thống kê thanh toán
export const getPaymentStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const stats = await PaymentService.getPaymentStats(startDate, endDate);
  return ResponseUtil.success(res, stats, 'Lấy thống kê thanh toán thành công');
});

// ============= SYSTEM MANAGEMENT =============

// Lấy thông tin hệ thống
export const getSystemInfo = asyncHandler(async (req, res) => {
  const systemInfo = await AdminAnalyticsService.getSystemInfo();
  return ResponseUtil.success(res, systemInfo, 'Lấy thông tin hệ thống thành công');
});

// Lấy cài đặt hệ thống
export const getSystemSettings = asyncHandler(async (req, res) => {
  // Mock data - trong thực tế sẽ lưu trong database
  const settings = {
    siteName: "Electronic Shop",
    siteDescription: "Cửa hàng điện tử trực tuyến",
    siteKeywords: "điện tử, laptop, điện thoại, phụ kiện",
    currency: "VND",
    timezone: "Asia/Ho_Chi_Minh",
    language: "vi",
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: false,
    maxOrderAmount: 100000000, // 100 triệu VND
    minOrderAmount: 50000, // 50k VND
    shippingFee: 30000, // 30k VND
    freeShippingThreshold: 500000, // 500k VND
    taxRate: 0.1, // 10%
    contactInfo: {
      email: "admin@electronicshop.com",
      phone: "0123456789",
      address: "123 ABC Street, District 1, Ho Chi Minh City"
    }
  };

  return ResponseUtil.success(res, settings, 'Lấy cài đặt hệ thống thành công');
});

// Cập nhật cài đặt hệ thống
export const updateSystemSettings = asyncHandler(async (req, res) => {
  const settings = req.body;
  
  // Validation cơ bản
  if (settings.maxOrderAmount && settings.maxOrderAmount < 0) {
    return ResponseUtil.validationError(res, ['Số tiền tối đa đơn hàng phải lớn hơn 0']);
  }
  
  if (settings.minOrderAmount && settings.minOrderAmount < 0) {
    return ResponseUtil.validationError(res, ['Số tiền tối thiểu đơn hàng phải lớn hơn 0']);
  }

  // Trong thực tế sẽ lưu vào database
  // const updatedSettings = await SettingsService.updateSettings(settings);
  
  return ResponseUtil.success(res, settings, 'Cập nhật cài đặt hệ thống thành công');
});
