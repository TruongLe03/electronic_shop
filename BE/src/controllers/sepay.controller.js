import { SepayService } from '../services/sepayService.js';
import { ResponseUtil, asyncHandler } from '../utils/response.util.js';
import { ValidationUtil } from '../utils/validation.util.js';

/**
 * Tạo payment fields và checkout URL cho SePay
 */
export const createPaymentFields = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  // Validation
  if (!orderId) {
    return ResponseUtil.validationError(res, ['Order ID là bắt buộc']);
  }

  if (!ValidationUtil.isValidObjectId(orderId)) {
    return ResponseUtil.validationError(res, ['Order ID không hợp lệ']);
  }

  try {
    const result = await SepayService.createPaymentFields(orderId);
    return ResponseUtil.success(
      res,
      result,
      'Tạo thông tin thanh toán thành công'
    );
  } catch (error) {
    console.error('Create SePay payment fields error:', error);
    
    if (error.message.includes('không tìm thấy')) {
      return ResponseUtil.notFound(res, error.message);
    }
    
    if (error.message.includes('đã được thanh toán')) {
      return ResponseUtil.error(res, error.message, 400);
    }

    return ResponseUtil.error(res, 'Không thể tạo thông tin thanh toán', 500);
  }
});

/**
 * Xử lý callback từ SePay (success URL)
 */
export const handleCallback = asyncHandler(async (req, res) => {
  try {
    const callbackData = req.query; // SePay gửi data qua query params
    
    console.log('📨 SePay Callback received:', callbackData);

    const result = await SepayService.handleCallback(callbackData);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (result.success) {
      // Redirect về trang success với thông tin
      return res.redirect(
        `${frontendUrl}/payment/success?status=success&orderId=${result.orderId}&paymentId=${result.paymentId}`
      );
    } else {
      // Redirect về trang failed
      return res.redirect(
        `${frontendUrl}/payment/failed?status=failed&error=${encodeURIComponent(result.message)}`
      );
    }
  } catch (error) {
    console.error('SePay callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(
      `${frontendUrl}/payment/failed?status=error&error=${encodeURIComponent(error.message)}`
    );
  }
});

/**
 * Kiểm tra trạng thái thanh toán
 */
export const checkPaymentStatus = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  if (!paymentId || !ValidationUtil.isValidObjectId(paymentId)) {
    return ResponseUtil.validationError(res, ['Payment ID không hợp lệ']);
  }

  try {
    const result = await SepayService.checkTransactionStatus(paymentId);
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

/**
 * Lấy danh sách đơn hàng từ SePay (Admin only)
 */
export const getAllOrders = asyncHandler(async (req, res) => {
  const params = {
    per_page: parseInt(req.query.per_page) || 20,
    q: req.query.q,
    order_status: req.query.order_status,
    created_at: req.query.created_at,
    from_created_at: req.query.from_created_at,
    to_created_at: req.query.to_created_at,
    customer_id: req.query.customer_id,
  };

  try {
    const result = await SepayService.getAllOrders(params);
    return ResponseUtil.success(
      res,
      result,
      'Lấy danh sách đơn hàng thành công'
    );
  } catch (error) {
    console.error('Get orders error:', error);
    return ResponseUtil.error(res, error.message, 500);
  }
});

/**
 * Kiểm tra trạng thái đơn hàng từ SePay API
 */
export const checkOrderStatus = asyncHandler(async (req, res) => {
  const { orderInvoiceNumber } = req.params;

  if (!orderInvoiceNumber) {
    return ResponseUtil.validationError(res, ['Order invoice number là bắt buộc']);
  }

  try {
    const result = await SepayService.checkOrderStatus(orderInvoiceNumber);
    return ResponseUtil.success(
      res,
      result,
      'Lấy trạng thái đơn hàng thành công'
    );
  } catch (error) {
    console.error('Check order status error:', error);
    return ResponseUtil.error(res, error.message, 500);
  }
});

/**
 * Test endpoint để kiểm tra cấu hình SePay
 */
export const testConfig = asyncHandler(async (req, res) => {
  try {
    SepayService.validateConfig();
    return ResponseUtil.success(
      res,
      {
        accountNumber: SepayService.SEPAY_ACCOUNT_NUMBER,
        accountName: SepayService.SEPAY_ACCOUNT_NAME,
        bankCode: SepayService.SEPAY_BANK_CODE,
      },
      'Cấu hình SePay hợp lệ'
    );
  } catch (error) {
    return ResponseUtil.error(res, error.message, 500);
  }
});
