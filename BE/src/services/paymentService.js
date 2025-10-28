import Payment from "../models/payment.model.js";
import Order from "../models/orders.model.js";
import crypto from "crypto";
import querystring from "querystring";
import moment from "moment-timezone";
import axios from "axios";

export class PaymentService {
  // VNPay configuration từ .env
  static VNP_TMN_CODE = process.env.VNP_TMNCODE;
  static VNP_HASH_SECRET = process.env.VNP_HASHSECRET;
  static VNP_URL = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  static VNP_RETURN_URL = process.env.VNP_RETURNURL || 'http://localhost:6789/api/v1/payment/vnpay_return';

  // Tạo payment cho order
  static async createPayment(orderId, method, customerInfo = {}, ipAddress = '') {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Không tìm thấy đơn hàng');
    }

    if (order.payment_status === 'completed') {
      throw new Error('Đơn hàng đã được thanh toán');
    }

    // Tạo payment record
    const payment = new Payment({
      order_id: orderId,
      amount: order.total,
      method,
      customer_info: {
        name: customerInfo.name || order.shipping_address?.name,
        email: customerInfo.email || order.shipping_address?.email,
        phone: customerInfo.phone || order.shipping_address?.phone
      },
      ip_address: ipAddress,
      status: 'pending'
    });

    const savedPayment = await payment.save();

    let paymentUrl = null;
    let additionalData = {};

    // Generate payment URL based on method
    switch (method.toLowerCase()) {
      case 'vnpay':
        paymentUrl = await this.createVNPayUrl(savedPayment, order);
        break;
      case 'cod':
        // COD không cần payment URL
        paymentUrl = null;
        break;
      default:
        throw new Error('Phương thức thanh toán không được hỗ trợ');
    }

    return {
      payment: savedPayment,
      paymentUrl,
      ...additionalData
    };
  }

  // Tạo VNPay URL
  static async createVNPayUrl(payment, order) {
    console.log('🔧 Checking VNPay Config...');
    console.log('VNP_TMN_CODE:', this.VNP_TMN_CODE);
    console.log('VNP_HASH_SECRET exists:', !!this.VNP_HASH_SECRET);
    console.log('VNP_URL:', this.VNP_URL);
    console.log('VNP_RETURN_URL:', this.VNP_RETURN_URL);
    
    if (!this.VNP_TMN_CODE || !this.VNP_HASH_SECRET) {
      console.error('❌ VNPay config missing!');
      throw new Error('VNPay chưa được cấu hình đầy đủ');
    }

    console.log('🔧 VNPay Config:', {
      tmnCode: this.VNP_TMN_CODE,
      hasSecret: !!this.VNP_HASH_SECRET,
      url: this.VNP_URL,
      returnUrl: this.VNP_RETURN_URL
    });

    // Tạo thời gian theo định dạng VNPay yêu cầu: yyyyMMddHHmmss
    const createDate = moment().tz('Asia/Ho_Chi_Minh').format('YYYYMMDDHHmmss');

    // Tạo expire date (15 phút sau)
    const expireTime = new Date(Date.now() + 15 * 60 * 1000);
    const expireDate = moment(expireTime).tz('Asia/Ho_Chi_Minh').format('YYYYMMDDHHmmss');

    const txnRef = payment._id.toString();

    // Tạo parameters theo đúng format VNPay
    const vnpParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.VNP_TMN_CODE,
      vnp_Amount: Math.round(payment.amount * 100), // VNPay yêu cầu amount * 100 (đơn vị: xu)
      vnp_CurrCode: 'VND',
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Thanh toan don hang #${order._id.toString().slice(-8)}`,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: this.VNP_RETURN_URL,
      vnp_IpAddr: payment.ip_address || '127.0.0.1',
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate
    };

    console.log('📋 VNPay Params Before Sort:', vnpParams);

    // Sắp xếp parameters theo alphabet (VNPay yêu cầu)
    const sortedParams = this.sortObject(vnpParams);
    console.log('📋 Sorted Params:', sortedParams);
    
    // Tạo query string để ký (VNPay format - không encode cho signature)
    const signData = Object.keys(sortedParams)
      .map(key => `${key}=${sortedParams[key]}`)
      .join('&');
    console.log('📝 Sign Data:', signData);
    
    // Tạo chữ ký HMAC SHA512
    const hmac = crypto.createHmac('sha512', this.VNP_HASH_SECRET);
    const signed = hmac.update(signData, 'utf8').digest('hex');
    console.log('🔐 Signature:', signed);
    
    // Thêm chữ ký vào params
    sortedParams.vnp_SecureHash = signed;

    // Tạo URL cuối cùng (encode cho URL)
    const finalQueryString = Object.keys(sortedParams)
      .map(key => `${key}=${encodeURIComponent(sortedParams[key])}`)
      .join('&');
    const paymentUrl = this.VNP_URL + '?' + finalQueryString;
    console.log('🔗 Final VNPay URL:', paymentUrl);

    // Lưu thông tin thanh toán vào đơn hàng (tương thích với VNPayService cũ)
    order.payment_info = {
      ...order.payment_info,
      vnpay_txn_ref: txnRef,
      vnpay_create_date: createDate,
      payment_url: paymentUrl,
    };
    await order.save();

    return paymentUrl;
  }

  // Verify VNPay return
  static async verifyVNPayReturn(vnpParams) {
    console.log('🔍 Verifying VNPay Return:', vnpParams);

    if (!vnpParams.vnp_SecureHash) {
      throw new Error('Thiếu chữ ký bảo mật');
    }

    const secureHash = vnpParams.vnp_SecureHash;
    
    // Tạo bản sao để xử lý
    const paramsToVerify = { ...vnpParams };
    delete paramsToVerify.vnp_SecureHash;
    delete paramsToVerify.vnp_SecureHashType;

    // Sắp xếp parameters
    const sortedParams = this.sortObject(paramsToVerify);
    const signData = Object.keys(sortedParams)
      .map(key => `${key}=${sortedParams[key]}`)
      .join('&');
    
    console.log('📝 Verify Sign Data:', signData);

    // Tạo chữ ký để so sánh
    const hmac = crypto.createHmac('sha512', this.VNP_HASH_SECRET);
    const signed = hmac.update(signData, 'utf8').digest('hex');
    
    console.log('🔐 Expected Signature:', signed);
    console.log('🔐 Received Signature:', secureHash);
    console.log('✅ Signature Match:', secureHash === signed);

    if (secureHash === signed) {
      // Tìm payment record
      const payment = await Payment.findById(vnpParams.vnp_TxnRef);
      if (!payment) {
        throw new Error('Không tìm thấy giao dịch thanh toán');
      }

      console.log('💳 Found Payment:', payment._id);
      console.log('🏦 VNPay Response Code:', vnpParams.vnp_ResponseCode);

      // Xác định trạng thái thanh toán
      let status = 'failed';
      let failureReason = null;

      switch (vnpParams.vnp_ResponseCode) {
        case '00':
          status = 'completed';
          break;
        case '07':
          status = 'failed';
          failureReason = 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).';
          break;
        case '09':
          status = 'failed';
          failureReason = 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.';
          break;
        case '10':
          status = 'failed';
          failureReason = 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần';
          break;
        case '11':
          status = 'failed';
          failureReason = 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.';
          break;
        case '12':
          status = 'failed';
          failureReason = 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.';
          break;
        case '13':
          status = 'failed';
          failureReason = 'Giao dịch không thành công do: Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).';
          break;
        case '24':
          status = 'cancelled';
          failureReason = 'Giao dịch không thành công do: Khách hàng hủy giao dịch';
          break;
        case '51':
          status = 'failed';
          failureReason = 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.';
          break;
        case '65':
          status = 'failed';
          failureReason = 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.';
          break;
        case '75':
          status = 'failed';
          failureReason = 'Ngân hàng thanh toán đang bảo trì.';
          break;
        case '79':
          status = 'failed';
          failureReason = 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.';
          break;
        default:
          status = 'failed';
          failureReason = `Giao dịch thất bại với mã lỗi: ${vnpParams.vnp_ResponseCode}`;
      }

      // Cập nhật trạng thái payment
      const updatedPayment = await this.updatePaymentStatus(payment._id, status, {
        gateway_transaction_id: vnpParams.vnp_TransactionNo,
        gateway_response: vnpParams,
        failure_reason: failureReason
      });

      // Cập nhật thông tin thanh toán vào order (tương thích với VNPayService cũ)
      const order = await Order.findById(payment.order_id);
      if (order) {
        order.payment_info = {
          ...order.payment_info,
          vnpay_response_code: vnpParams.vnp_ResponseCode,
          vnpay_transaction_no: vnpParams.vnp_TransactionNo,
          vnpay_bank_code: vnpParams.vnp_BankCode,
          vnpay_pay_date: vnpParams.vnp_PayDate,
          vnpay_amount: parseInt(vnpParams.vnp_Amount) / 100,
        };

        // Tự động chuyển trạng thái đơn hàng nếu thanh toán thành công
        if (status === 'completed' && order.status === 'pending') {
          order.status = 'confirmed';
          order.confirmed_at = new Date();
        }

        await order.save();
      }

      console.log('✅ Payment Updated:', {
        id: updatedPayment._id,
        status: updatedPayment.status,
        amount: updatedPayment.amount
      });

      return updatedPayment;
    }
    
    throw new Error('Chữ ký không hợp lệ hoặc dữ liệu đã bị thay đổi');
  }

  // Verify MoMo IPN
  static async verifyMoMoIPN(momoData) {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature
    } = momoData;

    const rawSignature = `accessKey=${this.MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    
    const expectedSignature = crypto
      .createHmac('sha256', this.MOMO_SECRET_KEY)
      .update(rawSignature)
      .digest('hex');

    if (signature === expectedSignature) {
      const payment = await Payment.findById(orderId);
      if (payment) {
        const status = resultCode === 0 ? 'completed' : 'failed';
        return await this.updatePaymentStatus(payment._id, status, {
          gateway_transaction_id: transId,
          gateway_response: momoData
        });
      }
    }

    throw new Error('Chữ ký MoMo không hợp lệ');
  }

  // Cập nhật trạng thái payment
  static async updatePaymentStatus(paymentId, status, gatewayData = {}) {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error('Không tìm thấy payment');
    }

    payment.status = status;
    payment.gateway_transaction_id = gatewayData.gateway_transaction_id;
    payment.gateway_response = gatewayData.gateway_response;
    
    if (status === 'completed') {
      payment.paid_at = new Date();
    } else if (status === 'failed') {
      payment.failed_at = new Date();
      payment.failure_reason = gatewayData.failure_reason || 'Payment failed';
    }

    const updatedPayment = await payment.save();

    // Cập nhật order status
    await Order.findByIdAndUpdate(payment.order_id, {
      payment_status: status === 'completed' ? 'completed' : 'failed',
      paid_at: status === 'completed' ? new Date() : undefined
    });

    return updatedPayment;
  }

  // Lấy payment theo ID
  static async getPaymentById(paymentId) {
    const payment = await Payment.findById(paymentId).populate('order_id');
    if (!payment) {
      throw new Error('Không tìm thấy payment');
    }
    return payment;
  }

  // Lấy payments của user
  static async getUserPayments(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [payments, total] = await Promise.all([
      Payment.find()
        .populate({
          path: 'order_id',
          match: { user_id: userId },
          populate: { path: 'user_id', select: 'name email' }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments()
    ]);

    // Filter out payments where order is null (not belonging to user)
    const userPayments = payments.filter(payment => payment.order_id);

    return {
      payments: userPayments,
      total: userPayments.length,
      page,
      totalPages: Math.ceil(userPayments.length / limit)
    };
  }

  // Helper function to sort object
  static sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach(key => {
      if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
        sorted[key] = obj[key];
      }
    });
    return sorted;
  }

  // Lấy thông báo lỗi từ VNPay response code
  static getVNPayResponseMessage(responseCode) {
    const messages = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
      '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.',
      '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)',
    };

    return messages[responseCode] || 'Lỗi không xác định';
  }

  // Method tương thích với VNPayService cũ - tạo payment URL
  static async createPaymentUrl({ orderId, bankCode, ipAddr }) {
    try {
      console.log('🔍 Creating payment URL for:', { orderId, bankCode, ipAddr });
      
      const order = await Order.findById(orderId);
      if (!order) {
        console.error('❌ Order not found:', orderId);
        throw new Error('Không tìm thấy đơn hàng');
      }

      console.log('📋 Found order:', {
        id: order._id,
        total: order.total,
        payment_status: order.payment_status
      });

      if (order.payment_status === 'completed') {
        throw new Error('Đơn hàng đã được thanh toán');
      }

      // Tạo payment record
      const payment = new Payment({
        order_id: orderId,
        amount: order.total,
        method: 'vnpay',
        customer_info: {
          name: order.shipping_address?.name,
          email: order.shipping_address?.email,
          phone: order.shipping_address?.phone
        },
        ip_address: ipAddr || '127.0.0.1',
        status: 'pending'
      });

      console.log('💳 Creating payment record:', {
        order_id: payment.order_id,
        amount: payment.amount,
        method: payment.method
      });

      const savedPayment = await payment.save();
      console.log('✅ Payment saved:', savedPayment._id);
      
      const paymentUrl = await this.createVNPayUrl(savedPayment, order);
      console.log('🔗 VNPay URL created successfully');

      return {
        success: true,
        paymentUrl,
        txnRef: savedPayment._id.toString(),
        payment: savedPayment
      };
    } catch (error) {
      console.error('❌ createPaymentUrl error:', error);
      throw error;
    }
  }

  // Method tương thích với VNPayService cũ - xử lý callback
  static async handleCallback(vnpParams) {
    try {
      const updatedPayment = await this.verifyVNPayReturn(vnpParams);
      
      return {
        success: updatedPayment.status === 'completed',
        message: updatedPayment.status === 'completed' 
          ? 'Thanh toán thành công' 
          : this.getVNPayResponseMessage(vnpParams.vnp_ResponseCode),
        orderId: updatedPayment.order_id,
        transactionNo: vnpParams.vnp_TransactionNo,
        amount: updatedPayment.amount,
        responseCode: vnpParams.vnp_ResponseCode
      };
    } catch (error) {
      console.error('VNPay callback error:', error);
      throw error;
    }
  }

  // Method tương thích với VNPayService cũ - kiểm tra trạng thái
  static async checkPaymentStatus(orderId) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Không tìm thấy đơn hàng');
      }

      return {
        orderId: order._id,
        payment_status: order.payment_status,
        payment_info: order.payment_info,
        total: order.total,
      };
    } catch (error) {
      console.error('Check payment status error:', error);
      throw error;
    }
  }

  // Tạo IPN URL handler cho VNPay (webhook)
  static async handleVNPayIPN(vnpParams) {
    console.log('📨 VNPay IPN Received:', vnpParams);

    try {
      // Verify signature
      if (!vnpParams.vnp_SecureHash) {
        return { RspCode: '97', Message: 'Invalid signature' };
      }

      const secureHash = vnpParams.vnp_SecureHash;
      const paramsToVerify = { ...vnpParams };
      delete paramsToVerify.vnp_SecureHash;
      delete paramsToVerify.vnp_SecureHashType;

      const sortedParams = this.sortObject(paramsToVerify);
      const signData = Object.keys(sortedParams)
        .map(key => `${key}=${sortedParams[key]}`)
        .join('&');
      const hmac = crypto.createHmac('sha512', this.VNP_HASH_SECRET);
      const signed = hmac.update(signData, 'utf8').digest('hex');

      if (secureHash !== signed) {
        return { RspCode: '97', Message: 'Invalid signature' };
      }

      // Kiểm tra payment tồn tại
      const payment = await Payment.findById(vnpParams.vnp_TxnRef);
      if (!payment) {
        return { RspCode: '01', Message: 'Order not found' };
      }

      // Kiểm tra số tiền
      const vnpAmount = parseInt(vnpParams.vnp_Amount) / 100;
      if (Math.abs(vnpAmount - payment.amount) > 0.01) {
        return { RspCode: '04', Message: 'Invalid amount' };
      }

      // Kiểm tra trạng thái hiện tại
      if (payment.status === 'completed') {
        return { RspCode: '02', Message: 'Order already confirmed' };
      }

      // Cập nhật trạng thái payment
      if (vnpParams.vnp_ResponseCode === '00') {
        await this.updatePaymentStatus(payment._id, 'completed', {
          gateway_transaction_id: vnpParams.vnp_TransactionNo,
          gateway_response: vnpParams
        });
        
        console.log('✅ VNPay IPN: Payment completed successfully');
        return { RspCode: '00', Message: 'Success' };
      } else {
        await this.updatePaymentStatus(payment._id, 'failed', {
          gateway_transaction_id: vnpParams.vnp_TransactionNo,
          gateway_response: vnpParams,
          failure_reason: `VNPay error code: ${vnpParams.vnp_ResponseCode}`
        });
        
        console.log('❌ VNPay IPN: Payment failed');
        return { RspCode: '00', Message: 'Success' };
      }

    } catch (error) {
      console.error('❌ VNPay IPN Error:', error);
      return { RspCode: '99', Message: 'Unknown error' };
    }
  }

  // Refund payment (for admin)
  static async refundPayment(paymentId, refundAmount, reason) {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error('Không tìm thấy payment');
    }

    if (payment.status !== 'completed') {
      throw new Error('Chỉ có thể hoàn tiền cho payment đã hoàn thành');
    }

    if (refundAmount > payment.amount) {
      throw new Error('Số tiền hoàn không được lớn hơn số tiền gốc');
    }

    // Create refund record
    payment.refunds = payment.refunds || [];
    payment.refunds.push({
      amount: refundAmount,
      reason,
      refunded_at: new Date(),
      status: 'pending'
    });

    payment.refund_amount = (payment.refund_amount || 0) + refundAmount;
    
    if (payment.refund_amount >= payment.amount) {
      payment.status = 'refunded';
    } else {
      payment.status = 'partially_refunded';
    }

    return await payment.save();
  }

  // ============= ADMIN METHODS =============

  // Lấy tất cả payments với filter cho admin
  static async getAllPayments(options = {}) {
    const {
      page = 1,
      limit = 10,
      status = "",
      method = "",
      startDate = "",
      endDate = "",
      sortBy = "createdAt",
      sortOrder = "desc"
    } = options;

    // Xây dựng query
    const query = {};
    
    if (status && status.trim() !== "") {
      query.status = status;
    }
    
    if (method && method.trim() !== "") {
      query.method = method;
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      query.createdAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.createdAt = { $lte: new Date(endDate) };
    }

    // Sắp xếp
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate({
          path: 'orderId',
          select: 'orderNumber totalAmount userId',
          populate: {
            path: 'userId',
            select: 'name email phone_number'
          }
        })
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(query)
    ]);

    return {
      payments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  // Lấy payment theo ID
  static async getPaymentById(paymentId) {
    const payment = await Payment.findById(paymentId)
      .populate({
        path: 'orderId',
        select: 'orderNumber totalAmount userId items shippingAddress',
        populate: {
          path: 'userId',
          select: 'name email phone_number'
        }
      });
    
    if (!payment) {
      throw new Error('Không tìm thấy payment');
    }
    
    return payment;
  }

  // Cập nhật trạng thái payment (cho COD, bank transfer manual)
  static async updatePaymentStatus(paymentId, updateData) {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error('Không tìm thấy payment');
    }

    // Không cho phép thay đổi trạng thái của payment gateway tự động
    if (['vnpay'].includes(payment.method) && 
        payment.status === 'success') {
      throw new Error('Không thể thay đổi trạng thái payment đã được xử lý tự động');
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        status: updateData.status,
        adminNote: updateData.adminNote,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate({
      path: 'orderId',
      select: 'orderNumber totalAmount userId',
      populate: {
        path: 'userId',
        select: 'name email'
      }
    });

    // Cập nhật trạng thái order tương ứng nếu cần
    if (updateData.status === 'success') {
      await Order.findByIdAndUpdate(payment.orderId, {
        payment_status: 'completed',
        payment_method: payment.method
      });
    } else if (updateData.status === 'failed' || updateData.status === 'cancelled') {
      await Order.findByIdAndUpdate(payment.orderId, {
        payment_status: 'failed'
      });
    }

    return updatedPayment;
  }

  // Thống kê payment
  static async getPaymentStats(startDate, endDate) {
    const matchCondition = {};
    
    if (startDate && endDate) {
      matchCondition.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const [
      totalStats,
      methodStats,
      statusStats,
      dailyStats
    ] = await Promise.all([
      // Tổng quan
      Payment.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
            totalPayments: { $sum: 1 },
            avgAmount: { $avg: "$amount" }
          }
        }
      ]),

      // Thống kê theo phương thức
      Payment.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: "$method",
            count: { $sum: 1 },
            totalAmount: { $sum: "$amount" }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Thống kê theo trạng thái
      Payment.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalAmount: { $sum: "$amount" }
          }
        }
      ]),

      // Thống kê theo ngày
      Payment.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" }
            },
            count: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
            successCount: {
              $sum: {
                $cond: [{ $eq: ["$status", "success"] }, 1, 0]
              }
            }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
      ])
    ]);

    return {
      total: totalStats[0] || { totalAmount: 0, totalPayments: 0, avgAmount: 0 },
      byMethod: methodStats,
      byStatus: statusStats,
      daily: dailyStats
    };
  }
}