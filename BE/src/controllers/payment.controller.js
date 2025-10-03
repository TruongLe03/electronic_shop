import { PaymentService } from "../services/paymentService.js";
import { ResponseUtil, asyncHandler } from "../utils/response.util.js";
import { ValidationUtil } from "../utils/validation.util.js";

// Tạo payment URL
export const createPayment = asyncHandler(async (req, res) => {
  const { orderId, amount, paymentMethod = 'VNPay', returnUrl, language = 'vn' } = req.body;
  const userId = req.user.id;

  // Validate input
  if (!orderId || !amount) {
    return ResponseUtil.validationError(res, ['Mã đơn hàng và số tiền là bắt buộc']);
  }

  if (!Number.isPositive(amount) || amount < 1000) {
    return ResponseUtil.validationError(res, ['Số tiền phải lớn hơn 1,000 VNĐ']);
  }

  if (!['VNPay', 'MoMo'].includes(paymentMethod)) {
    return ResponseUtil.validationError(res, ['Phương thức thanh toán không hợp lệ']);
  }

  const result = await PaymentService.createPayment({
    orderId,
    amount,
    paymentMethod,
    userId,
    returnUrl,
    language
  });

  return ResponseUtil.success(res, result, 'Tạo URL thanh toán thành công');
});

// VNPay IPN Handler
export const vnpayIPN = asyncHandler(async (req, res) => {
  const vnpayData = req.query;

  const result = await PaymentService.handleVNPayIPN(vnpayData);

  // Trả về response theo format VNPay yêu cầu
  return res.status(200).json({
    RspCode: result.RspCode,
    Message: result.Message
  });
});

// VNPay Return Handler
export const vnpayReturn = asyncHandler(async (req, res) => {
  const vnpayData = req.query;

  const result = await PaymentService.handleVNPayReturn(vnpayData);

  if (result.success) {
    return ResponseUtil.success(res, result.data, result.message);
  } else {
    return ResponseUtil.error(res, result.message, 400);
  }
});

// MoMo IPN Handler
export const momoIPN = asyncHandler(async (req, res) => {
  const momoData = req.body;

  const result = await PaymentService.handleMoMoIPN(momoData);

  // Trả về response theo format MoMo yêu cầu
  return res.status(200).json({
    resultCode: result.resultCode,
    message: result.message
  });
});

// MoMo Return Handler
export const momoReturn = asyncHandler(async (req, res) => {
  const momoData = req.body;

  const result = await PaymentService.handleMoMoReturn(momoData);

  if (result.success) {
    return ResponseUtil.success(res, result.data, result.message);
  } else {
    return ResponseUtil.error(res, result.message, 400);
  }
});

// Lấy thông tin payment theo orderId
export const getPaymentByOrderId = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  if (!orderId) {
    return ResponseUtil.validationError(res, ['Mã đơn hàng là bắt buộc']);
  }

  const payment = await PaymentService.getPaymentByOrderId(orderId, userId);

  if (!payment) {
    return ResponseUtil.notFound(res, 'Không tìm thấy thông tin thanh toán');
  }

  return ResponseUtil.success(res, payment, 'Lấy thông tin thanh toán thành công');
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

// Verify payment status
export const verifyPaymentStatus = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const userId = req.user.id;

  if (!paymentId) {
    return ResponseUtil.validationError(res, ['ID thanh toán là bắt buộc']);
  }

  const result = await PaymentService.verifyPaymentStatus(paymentId, userId);

  return ResponseUtil.success(res, result, 'Kiểm tra trạng thái thanh toán thành công');
});