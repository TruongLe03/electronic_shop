import { OrderService } from "../services/orderService.js";
import { ResponseUtil, asyncHandler } from "../utils/response.util.js";
import { ValidationUtil } from "../utils/validation.util.js";

// Tạo đơn hàng mới
export const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const orderData = req.body;

  // Validate required fields
  const requiredFields = ["items", "shipping_address", "payment_method"];
  const validation = ValidationUtil.validateRequiredFields(
    orderData,
    requiredFields
  );

  if (!validation.isValid) {
    return ResponseUtil.validationError(
      res,
      validation.missingFields.map((field) => `${field} là bắt buộc`)
    );
  }

  const order = await OrderService.createOrder(userId, orderData);
  return ResponseUtil.success(res, order, "Tạo đơn hàng thành công", 201);
});

// Lấy danh sách đơn hàng của user
export const getUserOrders = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status;

  const result = await OrderService.getUserOrders(userId, page, limit, status);
  return ResponseUtil.paginated(
    res,
    result.orders,
    {
      page: result.page,
      limit,
      total: result.total,
      totalPages: result.totalPages,
    },
    "Lấy danh sách đơn hàng thành công"
  );
});

// Lấy chi tiết đơn hàng
export const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  // Validate orderId
  if (!ValidationUtil.isValidObjectId(orderId)) {
    return ResponseUtil.validationError(res, ["Order ID không hợp lệ"]);
  }

  const order = await OrderService.getOrderById(orderId);
  
  // Kiểm tra ownership nếu không phải admin
  if (req.user && req.user.role !== "admin") {
    // user_id có thể là ObjectId hoặc populated object
    const orderUserId = order.user_id?._id || order.user_id;
    
    if (!orderUserId) {
      return ResponseUtil.forbidden(res, "Đơn hàng không có thông tin người dùng");
    }
    
    if (orderUserId.toString() !== req.user.id.toString()) {
      return ResponseUtil.forbidden(res, "Bạn không có quyền xem đơn hàng này");
    }
  }
  
  return ResponseUtil.success(res, order, "Lấy chi tiết đơn hàng thành công");
});

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  const order = await OrderService.updateOrderStatus(
    orderId,
    status,
    req.user.role === "admin" ? null : userId
  );
  return ResponseUtil.success(
    res,
    order,
    "Cập nhật trạng thái đơn hàng thành công"
  );
});

// Lấy tất cả đơn hàng (admin)
export const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const filters = {
    status: req.query.status,
    payment_status: req.query.payment_status,
    dateFrom: req.query.dateFrom,
    dateTo: req.query.dateTo,
  };

  const result = await OrderService.getAllOrders(page, limit, filters);
  return ResponseUtil.paginated(
    res,
    result.orders,
    {
      page: result.page,
      limit,
      total: result.total,
      totalPages: result.totalPages,
    },
    "Lấy danh sách đơn hàng thành công"
  );
});

// Thống kê đơn hàng (admin)
export const getOrderStats = asyncHandler(async (req, res) => {
  const { dateFrom, dateTo } = req.query;
  const stats = await OrderService.getOrderStats(dateFrom, dateTo);
  return ResponseUtil.success(res, stats, "Lấy thống kê đơn hàng thành công");
});

// Hủy đơn hàng
export const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;
  const { reason } = req.body;

  if (!orderId || !ValidationUtil.isValidObjectId(orderId)) {
    return ResponseUtil.validationError(res, ["Order ID không hợp lệ"]);
  }

  const cancelData = { reason: reason?.trim() };
  const result = await OrderService.cancelOrder(orderId, userId, cancelData);

  if (!result.success) {
    if (result.reason === "NOT_FOUND") {
      return ResponseUtil.notFound(res, "Không tìm thấy đơn hàng");
    } else if (result.reason === "UNAUTHORIZED") {
      return ResponseUtil.forbidden(res, "Bạn không có quyền hủy đơn hàng này");
    } else if (result.reason === "CANNOT_CANCEL") {
      return ResponseUtil.error(
        res,
        "Không thể hủy đơn hàng ở trạng thái này",
        400
      );
    }
  }

  return ResponseUtil.success(res, result.order, "Hủy đơn hàng thành công");
});

// Tạo đơn hàng từ giỏ hàng
export const createOrderFromCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { shippingAddress, paymentMethod, note } = req.body;

  // Validate required fields
  if (!shippingAddress || !paymentMethod) {
    return ResponseUtil.validationError(res, [
      "Địa chỉ giao hàng và phương thức thanh toán là bắt buộc",
    ]);
  }

  // Validate shipping address fields
  if (
    !shippingAddress.name ||
    !shippingAddress.phone ||
    !shippingAddress.address
  ) {
    return ResponseUtil.validationError(res, [
      "Họ tên, số điện thoại và địa chỉ giao hàng là bắt buộc",
    ]);
  }

  const orderData = {
    userId,
    shippingAddress,
    paymentMethod,
    note: note?.trim(),
  };

  const order = await OrderService.createOrderFromCart(orderData);
  return ResponseUtil.success(
    res,
    order,
    "Tạo đơn hàng từ giỏ hàng thành công",
    201
  );
});

// Tạo đơn hàng trực tiếp (mua ngay)
export const createDirectOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { items, shippingAddress, paymentMethod, note } = req.body;

  // Validate required fields
  if (!items || !Array.isArray(items) || items.length === 0) {
    return ResponseUtil.validationError(res, [
      "Danh sách sản phẩm không được trống",
    ]);
  }

  if (!shippingAddress || !paymentMethod) {
    return ResponseUtil.validationError(res, [
      "Địa chỉ giao hàng và phương thức thanh toán là bắt buộc",
    ]);
  }

  // More specific validation for shippingAddress
  if (typeof shippingAddress === "object") {
    if (
      !shippingAddress.name ||
      !shippingAddress.phone ||
      !shippingAddress.address
    ) {
      return ResponseUtil.validationError(res, [
        "Thông tin địa chỉ giao hàng không đầy đủ (thiếu tên, số điện thoại hoặc địa chỉ)",
      ]);
    }
  }

  // Validate items structure
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.productId && !item.product_id) {
      return ResponseUtil.validationError(res, [
        `Sản phẩm thứ ${i + 1} thiếu ID sản phẩm`,
      ]);
    }
    if (!item.quantity || item.quantity <= 0) {
      return ResponseUtil.validationError(res, [
        `Sản phẩm thứ ${i + 1} có số lượng không hợp lệ`,
      ]);
    }
  }

  const order = await OrderService.createDirectOrder(userId, {
    items,
    shippingAddress,
    paymentMethod,
    note: note?.trim(),
  });
  return ResponseUtil.success(
    res,
    order,
    "Tạo đơn hàng trực tiếp thành công",
    201
  );
});

// Cập nhật thông tin đơn hàng
export const updateOrderInfo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const updateData = req.body;

  if (!id || !ValidationUtil.isValidObjectId(id)) {
    return ResponseUtil.validationError(res, ["Order ID không hợp lệ"]);
  }

  const updatedOrder = await OrderService.updateOrderInfo(
    id,
    userId,
    updateData
  );

  if (!updatedOrder) {
    return ResponseUtil.notFound(
      res,
      "Không tìm thấy đơn hàng hoặc bạn không có quyền cập nhật"
    );
  }

  return ResponseUtil.success(
    res,
    updatedOrder,
    "Cập nhật thông tin đơn hàng thành công"
  );
});

// Xác nhận thanh toán
export const confirmPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { paymentData } = req.body;

  if (!id || !ValidationUtil.isValidObjectId(id)) {
    return ResponseUtil.validationError(res, ["Order ID không hợp lệ"]);
  }

  const result = await OrderService.confirmPayment(id, userId, paymentData);

  if (!result.success) {
    if (result.reason === "NOT_FOUND") {
      return ResponseUtil.notFound(res, "Không tìm thấy đơn hàng");
    } else if (result.reason === "UNAUTHORIZED") {
      return ResponseUtil.forbidden(
        res,
        "Bạn không có quyền xác nhận thanh toán cho đơn hàng này"
      );
    } else if (result.reason === "ALREADY_PAID") {
      return ResponseUtil.error(res, "Đơn hàng đã được thanh toán", 400);
    }
  }

  return ResponseUtil.success(
    res,
    result.order,
    "Xác nhận thanh toán thành công"
  );
});

// Alias cho getOrderStats để tương thích với router
export const getOrderStatistics = getOrderStats;
