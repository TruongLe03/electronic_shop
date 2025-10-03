import { InventoryService } from "../services/inventoryService.js";
import { ResponseUtil, asyncHandler } from "../utils/response.util.js";
import { ValidationUtil } from "../utils/validation.util.js";

// Lấy thông tin tồn kho theo productId
export const getInventoryByProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!productId || !ValidationUtil.isValidObjectId(productId)) {
    return ResponseUtil.validationError(res, ['Product ID không hợp lệ']);
  }

  const inventory = await InventoryService.getInventoryByProduct(productId);

  if (!inventory) {
    return ResponseUtil.notFound(res, 'Không tìm thấy thông tin tồn kho');
  }

  return ResponseUtil.success(res, inventory, 'Lấy thông tin tồn kho thành công');
});

// Lấy danh sách tồn kho (Admin)
export const getAllInventories = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, category, lowStock } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    search,
    category,
    lowStock: lowStock === 'true'
  };

  const result = await InventoryService.getAllInventories(options);

  return ResponseUtil.success(res, result, 'Lấy danh sách tồn kho thành công');
});

// Cập nhật tồn kho (Admin)
export const updateInventory = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity, minStock, maxStock, status } = req.body;

  if (!productId || !ValidationUtil.isValidObjectId(productId)) {
    return ResponseUtil.validationError(res, ['Product ID không hợp lệ']);
  }

  // Validate input
  const errors = [];
  if (quantity !== undefined && (!Number.isInteger(quantity) || quantity < 0)) {
    errors.push('Số lượng phải là số nguyên không âm');
  }
  if (minStock !== undefined && (!Number.isInteger(minStock) || minStock < 0)) {
    errors.push('Tồn kho tối thiểu phải là số nguyên không âm');
  }
  if (maxStock !== undefined && (!Number.isInteger(maxStock) || maxStock < 0)) {
    errors.push('Tồn kho tối đa phải là số nguyên không âm');
  }
  if (status && !['active', 'inactive', 'discontinued'].includes(status)) {
    errors.push('Trạng thái không hợp lệ');
  }

  if (errors.length > 0) {
    return ResponseUtil.validationError(res, errors);
  }

  const updateData = { quantity, minStock, maxStock, status };
  const inventory = await InventoryService.updateInventory(productId, updateData);

  return ResponseUtil.success(res, inventory, 'Cập nhật tồn kho thành công');
});

// Thêm tồn kho cho sản phẩm mới (Admin)
export const createInventory = asyncHandler(async (req, res) => {
  const { productId, quantity = 0, minStock = 0, maxStock = 1000, status = 'active' } = req.body;

  if (!productId || !ValidationUtil.isValidObjectId(productId)) {
    return ResponseUtil.validationError(res, ['Product ID không hợp lệ']);
  }

  // Validate input
  const errors = [];
  if (!Number.isInteger(quantity) || quantity < 0) {
    errors.push('Số lượng phải là số nguyên không âm');
  }
  if (!Number.isInteger(minStock) || minStock < 0) {
    errors.push('Tồn kho tối thiểu phải là số nguyên không âm');
  }
  if (!Number.isInteger(maxStock) || maxStock < 0) {
    errors.push('Tồn kho tối đa phải là số nguyên không âm');
  }
  if (!['active', 'inactive', 'discontinued'].includes(status)) {
    errors.push('Trạng thái không hợp lệ');
  }

  if (errors.length > 0) {
    return ResponseUtil.validationError(res, errors);
  }

  const inventoryData = { productId, quantity, minStock, maxStock, status };
  const inventory = await InventoryService.createInventory(inventoryData);

  return ResponseUtil.success(res, inventory, 'Tạo tồn kho thành công', 201);
});

// Adjust stock (thêm/giảm tồn kho) - Admin
export const adjustStock = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { adjustment, type, reason } = req.body;
  const adminId = req.user.id;

  if (!productId || !ValidationUtil.isValidObjectId(productId)) {
    return ResponseUtil.validationError(res, ['Product ID không hợp lệ']);
  }

  // Validate input
  if (!adjustment || !Number.isInteger(adjustment) || adjustment === 0) {
    return ResponseUtil.validationError(res, ['Số lượng điều chỉnh phải là số nguyên khác 0']);
  }

  if (!type || !['in', 'out'].includes(type)) {
    return ResponseUtil.validationError(res, ['Loại điều chỉnh phải là "in" hoặc "out"']);
  }

  if (!reason || reason.trim().length < 5) {
    return ResponseUtil.validationError(res, ['Lý do điều chỉnh phải có ít nhất 5 ký tự']);
  }

  const adjustmentData = {
    adjustment: type === 'out' ? -Math.abs(adjustment) : Math.abs(adjustment),
    reason: reason.trim(),
    adminId
  };

  const result = await InventoryService.adjustStock(productId, adjustmentData);

  return ResponseUtil.success(res, result, 'Điều chỉnh tồn kho thành công');
});

// Lấy lịch sử điều chỉnh tồn kho (Admin)
export const getStockHistory = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10, type, fromDate, toDate } = req.query;

  if (!productId || !ValidationUtil.isValidObjectId(productId)) {
    return ResponseUtil.validationError(res, ['Product ID không hợp lệ']);
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    type,
    fromDate,
    toDate
  };

  const result = await InventoryService.getStockHistory(productId, options);

  return ResponseUtil.success(res, result, 'Lấy lịch sử tồn kho thành công');
});

// Reserve stock (đặt trước khi thanh toán)
export const reserveStock = asyncHandler(async (req, res) => {
  const { productId, quantity, orderId } = req.body;
  const userId = req.user.id;

  if (!productId || !ValidationUtil.isValidObjectId(productId)) {
    return ResponseUtil.validationError(res, ['Product ID không hợp lệ']);
  }

  if (!quantity || !Number.isInteger(quantity) || quantity <= 0) {
    return ResponseUtil.validationError(res, ['Số lượng phải là số nguyên dương']);
  }

  if (!orderId) {
    return ResponseUtil.validationError(res, ['Order ID là bắt buộc']);
  }

  const result = await InventoryService.reserveStock(productId, quantity, orderId, userId);

  return ResponseUtil.success(res, result, 'Đặt trước tồn kho thành công');
});

// Release reserved stock (hủy đặt trước)
export const releaseReservedStock = asyncHandler(async (req, res) => {
  const { productId, orderId } = req.body;
  const userId = req.user.id;

  if (!productId || !ValidationUtil.isValidObjectId(productId)) {
    return ResponseUtil.validationError(res, ['Product ID không hợp lệ']);
  }

  if (!orderId) {
    return ResponseUtil.validationError(res, ['Order ID là bắt buộc']);
  }

  const result = await InventoryService.releaseReservedStock(productId, orderId, userId);

  return ResponseUtil.success(res, result, 'Hủy đặt trước tồn kho thành công');
});

// Lấy báo cáo tồn kho thấp (Admin)
export const getLowStockReport = asyncHandler(async (req, res) => {
  const { threshold } = req.query;

  const result = await InventoryService.getLowStockReport(threshold ? parseInt(threshold) : undefined);

  return ResponseUtil.success(res, result, 'Báo cáo tồn kho thấp');
});