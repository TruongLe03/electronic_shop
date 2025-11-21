import { PaymentService } from '../services/paymentService.js';
import { ResponseUtil, asyncHandler } from '../utils/response.util.js';
import { ValidationUtil } from '../utils/validation.util.js';

// Tạo URL thanh toán VNPay
export const createPaymentUrl = asyncHandler(async (req, res) => {
  const { orderId, bankCode } = req.body;
  const ipAddr = req.headers['x-forwarded-for'] || 
                 req.connection.remoteAddress || 
                 req.socket.remoteAddress ||
                 (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                 req.ip;

  // Validation
  if (!orderId) {
    return ResponseUtil.validationError(res, ['Order ID là bắt buộc']);
  }

  if (!ValidationUtil.isValidObjectId(orderId)) {
    return ResponseUtil.validationError(res, ['Order ID không hợp lệ']);
  }

  try {
    const result = await PaymentService.createPaymentUrl({
      orderId,
      bankCode,
      ipAddr: ipAddr || '127.0.0.1',
    });

    return ResponseUtil.success(
      res,
      result,
      'Tạo URL thanh toán thành công'
    );
  } catch (error) {
    console.error('Create VNPay payment URL error:', error);
    
    if (error.message.includes('không tìm thấy')) {
      return ResponseUtil.notFound(res, error.message);
    }
    
    if (error.message.includes('đã được thanh toán')) {
      return ResponseUtil.error(res, error.message, 400);
    }
    
    if (error.message.includes('cấu hình')) {
      return ResponseUtil.error(res, 'Lỗi cấu hình hệ thống thanh toán', 500);
    }

    return ResponseUtil.error(res, 'Không thể tạo URL thanh toán', 500);
  }
});

// Xử lý callback từ VNPay (IPN - Instant Payment Notification)
export const handleIPN = asyncHandler(async (req, res) => {
  try {
    const vnp_Params = req.query;
    
    console.log('📨 VNPay IPN received:', vnp_Params);

    const result = await PaymentService.handleCallback(vnp_Params);

    if (result.success) {
      console.log('✅ VNPay payment success (IPN):', result);
      // Trả về response cho VNPay để xác nhận đã nhận IPN
      return res.status(200).json({ RspCode: '00', Message: 'success' });
    } else {
      console.log('❌ VNPay payment failed (IPN):', result);
      return res.status(200).json({ RspCode: '99', Message: 'failed' });
    }
  } catch (error) {
    console.error('❌ VNPay IPN error:', error);
    return res.status(200).json({ RspCode: '99', Message: 'error' });
  }
});

// Xử lý return từ VNPay (người dùng được redirect về)
export const handleReturn = asyncHandler(async (req, res) => {
  try {
    const vnp_Params = req.query;
    
    console.log('VNPay return received:', vnp_Params);

    const result = await PaymentService.handleCallback(vnp_Params);

    console.log("🎯 VNPay return result:", result);

    if (result.success) {
      // Redirect đến trang thành công
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const successUrl = `${frontendUrl}/payment/success?status=success&orderId=${result.orderId}&transactionNo=${result.transactionNo}`;
      console.log("✅ Redirecting to success:", successUrl);
      return res.redirect(successUrl);
    } else {
      // Redirect đến trang thất bại
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const failUrl = `${frontendUrl}/payment/failed?status=failed&orderId=${result.orderId}&error=${encodeURIComponent(result.message)}`;
      console.log("❌ Redirecting to failed:", failUrl);
      return res.redirect(failUrl);
    }
  } catch (error) {
    console.error('VNPay return error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/payment/failed?error=${encodeURIComponent('Lỗi xử lý thanh toán')}`);
  }
});

// Kiểm tra trạng thái thanh toán
export const checkPaymentStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  if (!orderId || !ValidationUtil.isValidObjectId(orderId)) {
    return ResponseUtil.validationError(res, ['Order ID không hợp lệ']);
  }

  try {
    const result = await PaymentService.checkPaymentStatus(orderId);
    return ResponseUtil.success(
      res,
      result,
      'Lấy trạng thái thanh toán thành công'
    );
  } catch (error) {
    console.error('Check payment status error:', error);
    
    if (error.message.includes('không tìm thấy')) {
      return ResponseUtil.notFound(res, error.message);
    }

    return ResponseUtil.error(res, 'Không thể kiểm tra trạng thái thanh toán', 500);
  }
});

// Tạo URL thanh toán cho đơn hàng của user hiện tại (cần authentication)
export const createUserPaymentUrl = asyncHandler(async (req, res) => {
  const { orderId, bankCode } = req.body;
  const userId = req.user.id;
  const ipAddr = req.headers['x-forwarded-for'] || 
                 req.connection.remoteAddress || 
                 req.socket.remoteAddress ||
                 (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                 req.ip;

  // Validation
  if (!orderId) {
    return ResponseUtil.validationError(res, ['Order ID là bắt buộc']);
  }

  if (!ValidationUtil.isValidObjectId(orderId)) {
    return ResponseUtil.validationError(res, ['Order ID không hợp lệ']);
  }

  try {
    // Kiểm tra quyền sở hữu đơn hàng
    const Order = (await import('../models/orders.model.js')).default;
    const order = await Order.findById(orderId);
    
    if (!order) {
      return ResponseUtil.notFound(res, 'Không tìm thấy đơn hàng');
    }

    if (order.user_id.toString() !== userId.toString()) {
      return ResponseUtil.forbidden(res, 'Bạn không có quyền thanh toán đơn hàng này');
    }

    const result = await PaymentService.createPaymentUrl({
      orderId,
      bankCode,
      ipAddr: ipAddr || '127.0.0.1',
    });

    return ResponseUtil.success(
      res,
      result,
      'Tạo URL thanh toán thành công'
    );
  } catch (error) {
    console.error('Create user VNPay payment URL error:', error);
    
    if (error.message.includes('không tìm thấy')) {
      return ResponseUtil.notFound(res, error.message);
    }
    
    if (error.message.includes('đã được thanh toán')) {
      return ResponseUtil.error(res, error.message, 400);
    }
    
    if (error.message.includes('cấu hình')) {
      return ResponseUtil.error(res, 'Lỗi cấu hình hệ thống thanh toán', 500);
    }

    return ResponseUtil.error(res, 'Không thể tạo URL thanh toán', 500);
  }
});