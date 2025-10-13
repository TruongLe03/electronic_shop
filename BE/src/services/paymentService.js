import Payment from "../models/payment.model.js";
import Order from "../models/orders.model.js";
import crypto from "crypto";
import querystring from "querystring";
import axios from "axios";

export class PaymentService {
  // VNPay configuration
  static VNP_TMN_CODE = process.env.VNP_TMN_CODE;
  static VNP_HASH_SECRET = process.env.VNP_HASH_SECRET;
  static VNP_URL = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  static VNP_RETURN_URL = process.env.VNP_RETURN_URL || 'http://localhost:3000/payment/vnpay/return';

  // MoMo configuration
  static MOMO_PARTNER_CODE = process.env.MOMO_PARTNER_CODE;
  static MOMO_ACCESS_KEY = process.env.MOMO_ACCESS_KEY;
  static MOMO_SECRET_KEY = process.env.MOMO_SECRET_KEY;
  static MOMO_ENDPOINT = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn';

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
      case 'momo':
        const momoResult = await this.createMoMoPayment(savedPayment, order);
        paymentUrl = momoResult.payUrl;
        additionalData = momoResult;
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
    if (!this.VNP_TMN_CODE || !this.VNP_HASH_SECRET) {
      throw new Error('VNPay chưa được cấu hình');
    }

    const createDate = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const orderId = payment._id.toString();

    const vnpParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.VNP_TMN_CODE,
      vnp_Amount: payment.amount * 100, // VNPay requires amount in cents
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toan don hang ${order._id}`,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: this.VNP_RETURN_URL,
      vnp_IpAddr: payment.ip_address,
      vnp_CreateDate: createDate
    };

    // Sort parameters
    const sortedParams = this.sortObject(vnpParams);
    const signData = querystring.stringify(sortedParams);
    const hmac = crypto.createHmac('sha512', this.VNP_HASH_SECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    
    sortedParams.vnp_SecureHash = signed;

    return this.VNP_URL + '?' + querystring.stringify(sortedParams);
  }

  // Tạo MoMo payment
  static async createMoMoPayment(payment, order) {
    if (!this.MOMO_PARTNER_CODE || !this.MOMO_ACCESS_KEY || !this.MOMO_SECRET_KEY) {
      throw new Error('MoMo chưa được cấu hình');
    }

    const orderId = payment._id.toString();
    const requestId = orderId;
    const amount = payment.amount.toString();
    const orderInfo = `Thanh toan don hang ${order._id}`;
    const redirectUrl = process.env.MOMO_RETURN_URL || 'http://localhost:3000/payment/momo/return';
    const ipnUrl = process.env.MOMO_IPN_URL || 'http://localhost:3000/api/payment/momo/ipn';
    const extraData = '';

    const rawSignature = `accessKey=${this.MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.MOMO_PARTNER_CODE}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=captureWallet`;
    
    const signature = crypto
      .createHmac('sha256', this.MOMO_SECRET_KEY)
      .update(rawSignature)
      .digest('hex');

    const requestBody = {
      partnerCode: this.MOMO_PARTNER_CODE,
      accessKey: this.MOMO_ACCESS_KEY,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType: 'captureWallet',
      signature,
      lang: 'en'
    };

    try {
      const response = await axios.post(`${this.MOMO_ENDPOINT}/v2/gateway/api/create`, requestBody, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data.resultCode === 0) {
        return {
          payUrl: response.data.payUrl,
          shortLink: response.data.shortLink,
          deeplink: response.data.deeplink,
          qrCodeUrl: response.data.qrCodeUrl
        };
      } else {
        throw new Error(`MoMo Error: ${response.data.message}`);
      }
    } catch (error) {
      throw new Error(`Lỗi kết nối MoMo: ${error.message}`);
    }
  }

  // Verify VNPay return
  static async verifyVNPayReturn(vnpParams) {
    const secureHash = vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHashType;

    const sortedParams = this.sortObject(vnpParams);
    const signData = querystring.stringify(sortedParams);
    const hmac = crypto.createHmac('sha512', this.VNP_HASH_SECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
      const payment = await Payment.findById(vnpParams.vnp_TxnRef);
      if (payment) {
        const status = vnpParams.vnp_ResponseCode === '00' ? 'completed' : 'failed';
        return await this.updatePaymentStatus(payment._id, status, {
          gateway_transaction_id: vnpParams.vnp_TransactionNo,
          gateway_response: vnpParams
        });
      }
    }
    
    throw new Error('Chữ ký không hợp lệ');
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
      sorted[key] = obj[key];
    });
    return sorted;
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
    if (['vnpay', 'momo', 'zalopay'].includes(payment.method) && 
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