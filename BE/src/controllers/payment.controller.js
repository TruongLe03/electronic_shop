import { PaymentService } from "../services/paymentService.js";
import { ResponseUtil, asyncHandler } from "../utils/response.util.js";
import { ValidationUtil } from "../utils/validation.util.js";

// Tạo payment URL
export const createPayment = asyncHandler(async (req, res) => {
  const { orderId, method = 'vnpay', customerInfo } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';

  // Validate input
  if (!orderId) {
    return ResponseUtil.validationError(res, ['Mã đơn hàng là bắt buộc']);
  }

  if (!ValidationUtil.isValidObjectId(orderId)) {
    return ResponseUtil.validationError(res, ['Mã đơn hàng không hợp lệ']);
  }

  if (!['vnpay', 'cod'].includes(method.toLowerCase())) {
    return ResponseUtil.validationError(res, ['Phương thức thanh toán không được hỗ trợ']);
  }

  try {
    const result = await PaymentService.createPayment(orderId, method, customerInfo, ipAddress);
    return ResponseUtil.success(res, result, 'Tạo thanh toán thành công');
  } catch (error) {
    console.error('❌ Create payment error:', error);
    return ResponseUtil.error(res, error.message, 400);
  }
});

// VNPay IPN Handler (Webhook từ VNPay)
export const vnpayIPN = asyncHandler(async (req, res) => {
  console.log('📨 VNPay IPN Request:', req.query);
  
  try {
    const vnpayData = req.query;
    const result = await PaymentService.handleVNPayIPN(vnpayData);

    // Trả về response theo format VNPay yêu cầu
    return res.status(200).json({
      RspCode: result.RspCode,
      Message: result.Message
    });
  } catch (error) {
    console.error('❌ VNPay IPN Error:', error);
    return res.status(200).json({
      RspCode: '99',
      Message: 'Unknown error'
    });
  }
});

// VNPay Return Handler (User quay về từ VNPay)
export const vnpayReturn = asyncHandler(async (req, res) => {
  console.log('🔙 VNPay Return Request:', req.query);
  
  try {
    const vnpayData = req.query;
    const payment = await PaymentService.verifyVNPayReturn(vnpayData);

    // Redirect về frontend với kết quả
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    if (payment.status === 'completed') {
      return res.redirect(`${frontendUrl}/payment/success?paymentId=${payment._id}&orderId=${payment.order_id}`);
    } else {
      return res.redirect(`${frontendUrl}/payment/failed?paymentId=${payment._id}&orderId=${payment.order_id}&reason=${encodeURIComponent(payment.failure_reason || 'Thanh toán thất bại')}`);
    }
  } catch (error) {
    console.error('❌ VNPay Return Error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/payment/error?message=${encodeURIComponent(error.message)}`);
  }
});

// Lấy thông tin payment theo ID
export const getPaymentById = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  if (!paymentId || !ValidationUtil.isValidObjectId(paymentId)) {
    return ResponseUtil.validationError(res, ['ID thanh toán không hợp lệ']);
  }

  try {
    const payment = await PaymentService.getPaymentById(paymentId);
    return ResponseUtil.success(res, payment, 'Lấy thông tin thanh toán thành công');
  } catch (error) {
    return ResponseUtil.error(res, error.message, 404);
  }
});

// Lấy danh sách payments của user
export const getUserPayments = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10, status, paymentMethod } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    status,
    paymentMethod
  };

  const result = await PaymentService.getUserPayments(userId, options);

  return ResponseUtil.success(res, result, 'Lấy danh sách thanh toán thành công');
});

// Refund payment (Admin only)
export const refundPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const { refundAmount, reason } = req.body;
  const adminId = req.user.id;

  if (!paymentId) {
    return ResponseUtil.validationError(res, ['ID thanh toán là bắt buộc']);
  }

  if (!refundAmount || !Number.isPositive(refundAmount)) {
    return ResponseUtil.validationError(res, ['Số tiền hoàn lại không hợp lệ']);
  }

  const result = await PaymentService.refundPayment(paymentId, {
    refundAmount,
    reason,
    adminId
  });

  return ResponseUtil.success(res, result, 'Hoàn tiền thành công');
});

// ============= ADMIN CONTROLLERS =============

// Lấy tất cả payments (Admin)
export const getAllPayments = asyncHandler(async (req, res) => {
  const options = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
    status: req.query.status || "",
    method: req.query.method || "",
    startDate: req.query.startDate || "",
    endDate: req.query.endDate || "",
    sortBy: req.query.sortBy || "createdAt",
    sortOrder: req.query.sortOrder || "desc"
  };

  const result = await PaymentService.getAllPayments(options);
  return ResponseUtil.success(res, result, 'Lấy danh sách thanh toán thành công');
});

// Cập nhật trạng thái payment (Admin)
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const { status, adminNote } = req.body;

  if (!paymentId || !ValidationUtil.isValidObjectId(paymentId)) {
    return ResponseUtil.validationError(res, ['ID thanh toán không hợp lệ']);
  }

  // Accept statuses used by frontend and legacy values
  const validStatuses = [
    "pending",
    "processing",
    "completed", // frontend uses 'completed'
    "success", // legacy
    "failed",
    "cancelled",
    "refunded",
    "partially_refunded",
  ];

  if (!status || !validStatuses.includes(status)) {
    return ResponseUtil.validationError(res, ['Trạng thái thanh toán không hợp lệ']);
  }

  try {
    // Use the manual update method for admin actions (COD / bank transfer, manual confirmations)
    const updatedPayment = await PaymentService.updatePaymentStatusManual(paymentId, { status, adminNote });
    return ResponseUtil.success(res, updatedPayment, 'Cập nhật trạng thái thanh toán thành công');
  } catch (error) {
    return ResponseUtil.error(res, error.message, 400);
  }
});

// Thống kê thanh toán (Admin)
export const getPaymentStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const stats = await PaymentService.getPaymentStats(startDate, endDate);
  return ResponseUtil.success(res, stats, 'Lấy thống kê thanh toán thành công');
});

// ============= COMPATIBILITY METHODS WITH OLD VNPayService =============

// Tạo payment URL (tương thích với VNPayService cũ)
export const createPaymentUrl = asyncHandler(async (req, res) => {
  const { orderId, bankCode } = req.body;
  const ipAddr = req.ip || req.connection.remoteAddress || '127.0.0.1';

  if (!orderId) {
    return ResponseUtil.validationError(res, ['Mã đơn hàng là bắt buộc']);
  }

  try {
    const result = await PaymentService.createPaymentUrl({ orderId, bankCode, ipAddr });
    return ResponseUtil.success(res, result, 'Tạo URL thanh toán thành công');
  } catch (error) {
    console.error('❌ Create payment URL error:', error);
    return ResponseUtil.error(res, error.message, 400);
  }
});

// Xử lý VNPay callback (tương thích với VNPayService cũ)
export const handleCallback = asyncHandler(async (req, res) => {
  try {
    const vnpParams = req.query;
    const result = await PaymentService.handleCallback(vnpParams);
    return ResponseUtil.success(res, result, 'Xử lý callback thành công');
  } catch (error) {
    console.error('❌ Handle callback error:', error);
    return ResponseUtil.error(res, error.message, 400);
  }
});

// Kiểm tra trạng thái thanh toán (tương thích với VNPayService cũ)
export const checkPaymentStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  if (!orderId) {
    return ResponseUtil.validationError(res, ['Mã đơn hàng là bắt buộc']);
  }

  try {
    const result = await PaymentService.checkPaymentStatus(orderId);
    return ResponseUtil.success(res, result, 'Kiểm tra trạng thái thanh toán thành công');
  } catch (error) {
    return ResponseUtil.error(res, error.message, 404);
  }
});