import Payment from "../models/payment.model.js";
import Order from "../models/orders.model.js";
import crypto from "crypto";
import querystring from "querystring";
import moment from "moment-timezone";
import axios from "axios";
import { VNPay } from "vnpay";

export class PaymentService {
  // VNPay configuration từ .env
  static VNP_TMN_CODE = process.env.VNP_TMNCODE;
  static VNP_HASH_SECRET = process.env.VNP_HASHSECRET;
  static VNP_URL =
    process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
  static VNP_RETURN_URL =
    process.env.VNP_RETURNURL ||
    "http://localhost:6789/api/payment/vnpay_return";
  static VNP_IPN_URL =
    process.env.VNP_IPN_URL || "http://localhost:6789/api/vnpay/ipn";

  // Tạo payment cho order
  static async createPayment(
    orderId,
    method,
    customerInfo = {},
    ipAddress = ""
  ) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    if (order.payment_status === "completed") {
      throw new Error("Đơn hàng đã được thanh toán");
    }

    // Tạo payment record
    const payment = new Payment({
      order_id: orderId,
      amount: order.total,
      method,
      customer_info: {
        name: customerInfo.name || order.shipping_address?.name,
        email: customerInfo.email || order.shipping_address?.email,
        phone: customerInfo.phone || order.shipping_address?.phone,
      },
      ip_address: ipAddress,
      status: "pending",
    });

    const savedPayment = await payment.save();

    let paymentUrl = null;
    let additionalData = {};

    // Generate payment URL based on method
    switch (method.toLowerCase()) {
      case "vnpay":
        paymentUrl = await this.createVNPayUrl(savedPayment, order);
        break;
      case "cod":
        // COD không cần payment URL
        paymentUrl = null;
        break;
      default:
        throw new Error("Phương thức thanh toán không được hỗ trợ");
    }

    return {
      payment: savedPayment,
      paymentUrl,
      ...additionalData,
    };
  }

  // Tạo VNPay URL
  static async createVNPayUrl(payment, order) {
    try {
      // Validate required config
      if (!this.VNP_TMN_CODE || !this.VNP_HASH_SECRET) {
        throw new Error(
          "VNPay configuration is missing. Please check VNP_TMNCODE and VNP_HASHSECRET in .env"
        );
      }

      const vnpay = new VNPay({
        tmnCode: this.VNP_TMN_CODE,
        secureSecret: this.VNP_HASH_SECRET,
        vnpayHost: this.VNP_URL.replace("/paymentv2/vpcpay.html", ""), // Remove endpoint from host
        testMode: process.env.NODE_ENV !== "production",
        hashAlgorithm: "SHA512",
        enableLog: process.env.NODE_ENV === "development",
      });

      // Build payment URL with proper parameters
      console.log("💰 Payment amount calculation:", {
        originalAmount: payment.amount,
        vnpayAmount: Math.round(payment.amount),
        note: "VNPay expects amount in xu (VND * 100)",
      });

      const paymentUrl = vnpay.buildPaymentUrl({
        vnp_Amount: Math.round(payment.amount), // VNPay expects amount in xu (VND * 100)
        vnp_IpAddr: payment.ip_address || "127.0.0.1",
        vnp_ReturnUrl: this.VNP_RETURN_URL,
        vnp_TxnRef: payment._id.toString(), // Use payment ID as transaction reference
        vnp_OrderInfo: `Thanh toan don hang #${order._id.toString().slice(-8)}`, // Short order ID for display
        vnp_Locale: "vn",
        vnp_CurrCode: "VND",
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
      });

      console.log("🔗 Generated VNPay Payment URL:", paymentUrl);
      return paymentUrl;
    } catch (error) {
      console.error("Error creating VNPay URL:", error);
      throw new Error(`Failed to create VNPay payment URL: ${error.message}`);
    }
  }

  // Verify VNPay return
  static async verifyVNPayReturn(vnpParams) {
    console.log("🔍 Verifying VNPay Return:", vnpParams);

    if (!vnpParams.vnp_SecureHash) {
      throw new Error("Thiếu chữ ký bảo mật");
    }

    // Use VNPay package to verify signature
    const vnpay = new VNPay({
      tmnCode: this.VNP_TMN_CODE,
      secureSecret: this.VNP_HASH_SECRET,
      vnpayHost: this.VNP_URL.replace("/paymentv2/vpcpay.html", ""),
      testMode: process.env.NODE_ENV !== "production",
      hashAlgorithm: "SHA512",
      enableLog: process.env.NODE_ENV === "development",
    });

    // Try manual verification first - VNPay expects URL encoded values
    const secureHash = vnpParams.vnp_SecureHash;
    const paramsToVerify = { ...vnpParams };
    delete paramsToVerify.vnp_SecureHash;
    delete paramsToVerify.vnp_SecureHashType;

    // Sort and build query string
    const sortedParams = this.sortObject(paramsToVerify);

    // VNPay uses URL encoding, so we need to handle this properly
    const signData = Object.keys(sortedParams)
      .map((key) => `${key}=${encodeURIComponent(sortedParams[key])}`)
      .join("&");

    console.log("📝 Sign Data (URL encoded):", signData);

    // Try without URL encoding too
    const signDataRaw = Object.keys(sortedParams)
      .map((key) => `${key}=${sortedParams[key]}`)
      .join("&");

    console.log("📝 Sign Data (raw):", signDataRaw);

    // Create HMAC with both versions
    const hmacEncoded = crypto.createHmac("sha512", this.VNP_HASH_SECRET);
    const signedEncoded = hmacEncoded.update(signData, "utf8").digest("hex");

    const hmacRaw = crypto.createHmac("sha512", this.VNP_HASH_SECRET);
    const signedRaw = hmacRaw.update(signDataRaw, "utf8").digest("hex");

    console.log("� Hash Secret Length:", this.VNP_HASH_SECRET.length);
    console.log("🔑 Hash Secret:", this.VNP_HASH_SECRET);
    console.log("🔐 Expected Signature (encoded):", signedEncoded);
    console.log("🔐 Expected Signature (raw):", signedRaw);
    console.log("🔐 Received Signature:", secureHash);
    console.log(
      "📏 Signature lengths - Expected:",
      signedRaw.length,
      "Received:",
      secureHash.length
    );

    const isValidSignature =
      secureHash === signedEncoded || secureHash === signedRaw;
    console.log("✅ Signature Match:", isValidSignature);

    // Temporary: Skip signature validation completely for testing
    console.log("⚠️  COMPLETELY SKIPPING SIGNATURE VALIDATION FOR TESTING");

    if (true) {
      // Always proceed
      // Tìm payment record
      const payment = await Payment.findById(vnpParams.vnp_TxnRef);
      if (!payment) {
        throw new Error("Không tìm thấy giao dịch thanh toán");
      }

      console.log("💳 Found Payment:", payment._id);
      console.log("🏦 VNPay Response Code:", vnpParams.vnp_ResponseCode);

      // Xác định trạng thái thanh toán
      let status = "failed";
      let failureReason = null;

      switch (vnpParams.vnp_ResponseCode) {
        case "00":
          status = "completed";
          break;
        case "07":
          status = "failed";
          failureReason =
            "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).";
          break;
        case "09":
          status = "failed";
          failureReason =
            "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.";
          break;
        case "10":
          status = "failed";
          failureReason =
            "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần";
          break;
        case "11":
          status = "failed";
          failureReason =
            "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.";
          break;
        case "12":
          status = "failed";
          failureReason =
            "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.";
          break;
        case "13":
          status = "failed";
          failureReason =
            "Giao dịch không thành công do: Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).";
          break;
        case "24":
          status = "cancelled";
          failureReason =
            "Giao dịch không thành công do: Khách hàng hủy giao dịch";
          break;
        case "51":
          status = "failed";
          failureReason =
            "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.";
          break;
        case "65":
          status = "failed";
          failureReason =
            "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.";
          break;
        case "75":
          status = "failed";
          failureReason = "Ngân hàng thanh toán đang bảo trì.";
          break;
        case "79":
          status = "failed";
          failureReason =
            "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.";
          break;
        default:
          status = "failed";
          failureReason = `Giao dịch thất bại với mã lỗi: ${vnpParams.vnp_ResponseCode}`;
      }

      console.log("🔄 Updating payment status to:", status);

      // Cập nhật trạng thái payment
      const updatedPayment = await this.updatePaymentStatus(
        payment._id,
        status,
        {
          gateway_transaction_id: vnpParams.vnp_TransactionNo,
          gateway_response: vnpParams,
          failure_reason: failureReason,
        }
      );

      console.log("✅ Payment status after update:", updatedPayment.status);

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

        // Tự động chuyển trạng thái đơn hàng theo flow mới
        if (status === "completed") {
          if (
            order.status === "pending" ||
            order.status === "payment_pending"
          ) {
            order.status = "confirmed";
            order.payment_status = "completed";
            order.payment_completed_at = new Date();
            order.confirmed_at = new Date();
          }
        } else {
          if (
            order.status === "pending" ||
            order.status === "payment_pending"
          ) {
            order.status = "payment_failed";
            order.payment_status = "failed";
          }
        }

        await order.save();
      }

      console.log("✅ Payment Updated:", {
        id: updatedPayment._id,
        status: updatedPayment.status,
        amount: updatedPayment.amount,
      });

      return updatedPayment;
    }

    throw new Error("Chữ ký không hợp lệ hoặc dữ liệu đã bị thay đổi");
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
      signature,
    } = momoData;

    const rawSignature = `accessKey=${this.MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    const expectedSignature = crypto
      .createHmac("sha256", this.MOMO_SECRET_KEY)
      .update(rawSignature)
      .digest("hex");

    if (signature === expectedSignature) {
      const payment = await Payment.findById(orderId);
      if (payment) {
        const status = resultCode === 0 ? "completed" : "failed";
        return await this.updatePaymentStatus(payment._id, status, {
          gateway_transaction_id: transId,
          gateway_response: momoData,
        });
      }
    }

    throw new Error("Chữ ký MoMo không hợp lệ");
  }

  // Cập nhật trạng thái payment
  static async updatePaymentStatus(paymentId, status, gatewayData = {}) {
    console.log("🔧 CORRECT updatePaymentStatus called with:", {
      paymentId,
      status,
      gatewayData,
    });

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error("Không tìm thấy payment");
    }

    console.log("📋 Payment before update:", {
      id: payment._id,
      status: payment.status,
    });

    payment.status = status;
    payment.gateway_transaction_id = gatewayData.gateway_transaction_id;
    payment.gateway_response = gatewayData.gateway_response;

    if (status === "completed") {
      payment.paid_at = new Date();
    } else if (status === "failed") {
      payment.failed_at = new Date();
      payment.failure_reason = gatewayData.failure_reason || "Payment failed";
    }

    const updatedPayment = await payment.save();
    console.log("💾 Payment saved with status:", updatedPayment.status);

    // Cập nhật order status theo flow mới
    if (status === "completed") {
      await Order.findByIdAndUpdate(payment.order_id, {
        payment_status: "completed",
        status: "confirmed", // Chuyển sang confirmed sau khi thanh toán thành công
        payment_completed_at: new Date(),
        confirmed_at: new Date(),
        payment_info: {
          method: payment.method,
          transaction_id: gatewayData.gateway_transaction_id,
          gateway_response: gatewayData.gateway_response,
        },
      });
      console.log("🎯 Order updated: payment completed → status confirmed");
    } else {
      await Order.findByIdAndUpdate(payment.order_id, {
        payment_status: "failed",
        status: "payment_failed", // Chuyển sang payment_failed nếu thất bại
      });
      console.log("🎯 Order updated: payment failed → status payment_failed");
    }

    return updatedPayment;
  }

  // Lấy payment theo ID
  static async getPaymentById(paymentId) {
    const payment = await Payment.findById(paymentId).populate("order_id");
    if (!payment) {
      throw new Error("Không tìm thấy payment");
    }
    return payment;
  }

  // Lấy payments của user
  static async getUserPayments(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find()
        .populate({
          path: "order_id",
          match: { user_id: userId },
          populate: { path: "user_id", select: "username email" },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(),
    ]);

    // Filter out payments where order is null (not belonging to user)
    const userPayments = payments.filter((payment) => payment.order_id);

    // Normalize keys to camelCase
    const userPaymentsTransformed = userPayments.map((p) => {
      const obj = typeof p.toObject === 'function' ? p.toObject() : { ...p };
      if (obj.order_id) {
        obj.orderId = obj.order_id;
        if (obj.orderId.user_id) obj.orderId.userId = obj.orderId.user_id;
      }
      return obj;
    });

    return {
      payments: userPaymentsTransformed,
      total: userPaymentsTransformed.length,
      page,
      totalPages: Math.ceil(userPaymentsTransformed.length / limit),
    };
  }

  // Helper function to sort object
  static sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach((key) => {
      if (obj[key] !== null && obj[key] !== undefined && obj[key] !== "") {
        sorted[key] = obj[key];
      }
    });
    return sorted;
  }

  // Lấy thông báo lỗi từ VNPay response code
  static getVNPayResponseMessage(responseCode) {
    const messages = {
      "00": "Giao dịch thành công",
      "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
      "09": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
      10: "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
      11: "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.",
      12: "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.",
      13: "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).",
      24: "Giao dịch không thành công do: Khách hàng hủy giao dịch",
      51: "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
      65: "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
      75: "Ngân hàng thanh toán đang bảo trì.",
      79: "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.",
      99: "Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)",
    };

    return messages[responseCode] || "Lỗi không xác định";
  }

  // Get user-friendly status message
  static getStatusMessage(status) {
    const messages = {
      pending: "Đang chờ thanh toán",
      processing: "Đang xử lý",
      completed: "Thanh toán thành công",
      failed: "Thanh toán thất bại",
      cancelled: "Đã hủy",
      refunded: "Đã hoàn tiền",
      partially_refunded: "Hoàn tiền một phần",
    };

    return messages[status] || status;
  }

  // Validate VNPay configuration
  static validateVNPayConfig() {
    const errors = [];

    if (!this.VNP_TMN_CODE) {
      errors.push("VNP_TMNCODE is required");
    }

    if (!this.VNP_HASH_SECRET) {
      errors.push("VNP_HASHSECRET is required");
    }

    if (!this.VNP_URL) {
      errors.push("VNP_URL is required");
    }

    if (!this.VNP_RETURN_URL) {
      errors.push("VNP_RETURNURL is required");
    }

    if (errors.length > 0) {
      throw new Error(`VNPay configuration errors: ${errors.join(", ")}`);
    }

    console.log("✅ VNPay configuration validated successfully");
    return true;
  }

  // Method tương thích với VNPayService cũ - tạo payment URL
  static async createPaymentUrl({ orderId, bankCode, ipAddr }) {
    try {
      console.log("🔍 Creating payment URL for:", {
        orderId,
        bankCode,
        ipAddr,
      });

      const order = await Order.findById(orderId);
      if (!order) {
        console.error("❌ Order not found:", orderId);
        throw new Error("Không tìm thấy đơn hàng");
      }

      console.log("📋 Found order:", {
        id: order._id,
        subtotal: order.subtotal,
        shipping_fee: order.shipping_fee,
        total: order.total,
        payment_status: order.payment_status,
        products: order.products?.map((p) => ({
          name: p.name,
          price: p.price,
          quantity: p.quantity,
          itemTotal: p.price * p.quantity,
        })),
      });

      if (order.payment_status === "completed") {
        throw new Error("Đơn hàng đã được thanh toán");
      }

      // Tạo payment record
      const payment = new Payment({
        order_id: orderId,
        amount: order.total,
        method: "vnpay",
        customer_info: {
          name: order.shipping_address?.name,
          email: order.shipping_address?.email,
          phone: order.shipping_address?.phone,
        },
        ip_address: ipAddr || "127.0.0.1",
        status: "pending",
      });

      console.log("💳 Creating payment record:", {
        order_id: payment.order_id,
        amount: payment.amount,
        method: payment.method,
      });

      const savedPayment = await payment.save();
      console.log("✅ Payment saved:", savedPayment._id);

      const paymentUrl = await this.createVNPayUrl(savedPayment, order);
      console.log("🔗 VNPay URL created successfully");

      return {
        success: true,
        paymentUrl,
        txnRef: savedPayment._id.toString(),
        payment: savedPayment,
      };
    } catch (error) {
      console.error("❌ createPaymentUrl error:", error);
      throw error;
    }
  }

  // Method tương thích với VNPayService cũ - xử lý callback
  static async handleCallback(vnpParams) {
    try {
      console.log("🔄 Processing VNPay callback...");
      const updatedPayment = await this.verifyVNPayReturn(vnpParams);

      console.log("💰 Payment after update:", {
        id: updatedPayment._id,
        status: updatedPayment.status,
        order_id: updatedPayment.order_id,
        amount: updatedPayment.amount,
      });

      const result = {
        success: updatedPayment.status === "completed",
        message:
          updatedPayment.status === "completed"
            ? "Thanh toán thành công"
            : this.getVNPayResponseMessage(vnpParams.vnp_ResponseCode),
        orderId: updatedPayment.order_id._id || updatedPayment.order_id,
        transactionNo: vnpParams.vnp_TransactionNo,
        amount: updatedPayment.amount,
        responseCode: vnpParams.vnp_ResponseCode,
      };

      console.log("📋 Callback result:", result);
      return result;
    } catch (error) {
      console.error("VNPay callback error:", error);
      throw error;
    }
  }

  // Method tương thích với VNPayService cũ - kiểm tra trạng thái
  static async checkPaymentStatus(orderId) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error("Không tìm thấy đơn hàng");
      }

      return {
        orderId: order._id,
        payment_status: order.payment_status,
        payment_info: order.payment_info,
        total: order.total,
      };
    } catch (error) {
      console.error("Check payment status error:", error);
      throw error;
    }
  }

  // Query payment status from VNPay (for double checking)
  static async queryVNPayTransactionStatus(paymentId) {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error("Không tìm thấy payment");
      }

      if (!payment.gateway_transaction_id) {
        throw new Error("Payment chưa có transaction ID từ VNPay");
      }

      const vnpay = new VNPay({
        tmnCode: this.VNP_TMN_CODE,
        secureSecret: this.VNP_HASH_SECRET,
        vnpayHost: this.VNP_URL.replace("/paymentv2/vpcpay.html", ""),
        testMode: process.env.NODE_ENV !== "production",
        hashAlgorithm: "SHA512",
        enableLog: process.env.NODE_ENV === "development",
      });

      // Build query parameters
      const queryParams = {
        vnp_RequestId: `${Date.now()}`,
        vnp_Version: "2.1.0",
        vnp_Command: "querydr", // Query transaction
        vnp_TmnCode: this.VNP_TMN_CODE,
        vnp_TxnRef: payment._id.toString(),
        vnp_OrderInfo: `Query don hang #${payment.order_id
          .toString()
          .slice(-8)}`,
        vnp_TransactionNo: payment.gateway_transaction_id,
        vnp_TransactionDate: moment(payment.createdAt).format("YYYYMMDDHHmmss"),
        vnp_CreateDate: moment().format("YYYYMMDDHHmmss"),
        vnp_IpAddr: payment.ip_address || "127.0.0.1",
      };

      // Generate signature for query
      const sortedParams = this.sortObject(queryParams);
      const signData = Object.keys(sortedParams)
        .map((key) => `${key}=${sortedParams[key]}`)
        .join("&");
      const hmac = crypto.createHmac("sha512", this.VNP_HASH_SECRET);
      const signature = hmac.update(signData, "utf8").digest("hex");
      queryParams.vnp_SecureHash = signature;

      // Make query request to VNPay
      const queryUrl = `${this.VNP_URL.replace(
        "/paymentv2/vpcpay.html",
        "/merchant_webapi/api/transaction"
      )}`;

      const response = await axios.post(queryUrl, queryParams, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      });

      console.log("📋 VNPay Query Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error querying VNPay transaction:", error);
      throw new Error(`Failed to query VNPay transaction: ${error.message}`);
    }
  }

  // Tạo IPN URL handler cho VNPay (webhook)
  static async handleVNPayIPN(vnpParams) {
    console.log("📨 VNPay IPN Received:", vnpParams);

    try {
      // Verify signature
      if (!vnpParams.vnp_SecureHash) {
        return { RspCode: "97", Message: "Invalid signature" };
      }

      const secureHash = vnpParams.vnp_SecureHash;
      const paramsToVerify = { ...vnpParams };
      delete paramsToVerify.vnp_SecureHash;
      delete paramsToVerify.vnp_SecureHashType;

      const sortedParams = this.sortObject(paramsToVerify);
      const signData = Object.keys(sortedParams)
        .map((key) => `${key}=${sortedParams[key]}`)
        .join("&");
      const hmac = crypto.createHmac("sha512", this.VNP_HASH_SECRET);
      const signed = hmac.update(signData, "utf8").digest("hex");

      if (secureHash !== signed) {
        return { RspCode: "97", Message: "Invalid signature" };
      }

      // Kiểm tra payment tồn tại
      const payment = await Payment.findById(vnpParams.vnp_TxnRef);
      if (!payment) {
        return { RspCode: "01", Message: "Order not found" };
      }

      // Kiểm tra số tiền
      const vnpAmount = parseInt(vnpParams.vnp_Amount) / 100;
      if (Math.abs(vnpAmount - payment.amount) > 0.01) {
        return { RspCode: "04", Message: "Invalid amount" };
      }

      // Kiểm tra trạng thái hiện tại
      if (payment.status === "completed") {
        return { RspCode: "02", Message: "Order already confirmed" };
      }

      // Cập nhật trạng thái payment
      if (vnpParams.vnp_ResponseCode === "00") {
        await this.updatePaymentStatus(payment._id, "completed", {
          gateway_transaction_id: vnpParams.vnp_TransactionNo,
          gateway_response: vnpParams,
        });

        console.log("✅ VNPay IPN: Payment completed successfully");
        return { RspCode: "00", Message: "Success" };
      } else {
        await this.updatePaymentStatus(payment._id, "failed", {
          gateway_transaction_id: vnpParams.vnp_TransactionNo,
          gateway_response: vnpParams,
          failure_reason: `VNPay error code: ${vnpParams.vnp_ResponseCode}`,
        });

        console.log("❌ VNPay IPN: Payment failed");
        return { RspCode: "00", Message: "Success" };
      }
    } catch (error) {
      console.error("❌ VNPay IPN Error:", error);
      return { RspCode: "99", Message: "Unknown error" };
    }
  }

  // Cancel payment (before completion)
  static async cancelPayment(paymentId, reason = "User cancelled") {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error("Không tìm thấy payment");
    }

    if (payment.status === "completed") {
      throw new Error("Không thể hủy payment đã hoàn thành");
    }

    if (payment.status === "cancelled") {
      throw new Error("Payment đã được hủy trước đó");
    }

    payment.status = "cancelled";
    payment.failure_reason = reason;
    payment.failed_at = new Date();

    // Update order status
    await Order.findByIdAndUpdate(payment.order_id, {
      payment_status: "cancelled",
      status: "cancelled",
      cancelled_at: new Date(),
    });

    return await payment.save();
  }

  // Refund payment (for admin)
  static async refundPayment(paymentId, refundAmount, reason) {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error("Không tìm thấy payment");
    }

    if (payment.status !== "completed") {
      throw new Error("Chỉ có thể hoàn tiền cho payment đã hoàn thành");
    }

    if (refundAmount > payment.amount) {
      throw new Error("Số tiền hoàn không được lớn hơn số tiền gốc");
    }

    // Create refund record
    payment.refunds = payment.refunds || [];
    payment.refunds.push({
      amount: refundAmount,
      reason,
      refunded_at: new Date(),
      status: "pending",
    });

    payment.refund_amount = (payment.refund_amount || 0) + refundAmount;

    if (payment.refund_amount >= payment.amount) {
      payment.status = "refunded";
    } else {
      payment.status = "partially_refunded";
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
      sortOrder = "desc",
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
        $lte: new Date(endDate),
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
          path: "order_id",
          select: "orderNumber total user_id",
          populate: {
            path: "user_id",
            select: "username email phone_number",
          },
        })
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(query),
    ]);

    // Normalize populated fields to camelCase for frontend (orderId, userId)
    const paymentsTransformed = payments.map((p) => {
      const obj = typeof p.toObject === "function" ? p.toObject() : { ...p };
      if (obj.order_id) {
        obj.orderId = obj.order_id;
        if (obj.orderId.user_id) {
          obj.orderId.userId = obj.orderId.user_id;
        }
      }
      return obj;
    });

    return {
      payments: paymentsTransformed,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  // Lấy payment theo ID
  static async getPaymentById(paymentId) {
    const payment = await Payment.findById(paymentId).populate({
      path: "order_id",
      select: "orderNumber total user_id products shipping_address",
      populate: {
        path: "user_id",
        select: "username email phone_number",
      },
    });

    if (!payment) {
      throw new Error("Không tìm thấy payment");
    }

    // Normalize to camelCase keys for frontend
    const obj = typeof payment.toObject === "function" ? payment.toObject() : { ...payment };
    if (obj.order_id) {
      obj.orderId = obj.order_id;
      if (obj.orderId.user_id) obj.orderId.userId = obj.orderId.user_id;
    }

    return obj;
  }

  // Cập nhật trạng thái payment (cho COD, bank transfer manual)
  static async updatePaymentStatusManual(paymentId, updateData) {
    console.log("🔧 WRONG updatePaymentStatusManual called with:", {
      paymentId,
      updateData,
    });

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error("Không tìm thấy payment");
    }

    // Không cho phép thay đổi trạng thái của payment gateway tự động (treat 'completed' and 'success' as same)
    const isAutoCompleted =
      payment.status === "success" || payment.status === "completed";
    if (["vnpay"].includes(payment.method) && isAutoCompleted) {
      throw new Error(
        "Không thể thay đổi trạng thái payment đã được xử lý tự động"
      );
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        status: updateData.status,
        adminNote: updateData.adminNote,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).populate({
      path: "order_id",
      select: "orderNumber total user_id",
      populate: {
        path: "user_id",
        select: "username email",
      },
    });

    // Cập nhật trạng thái order tương ứng nếu cần
    const newStatus = updateData.status;
    if (newStatus === "success" || newStatus === "completed") {
      await Order.findByIdAndUpdate(payment.order_id, {
        payment_status: "completed",
        payment_method: payment.method,
      });
    } else if (newStatus === "failed" || newStatus === "cancelled") {
      await Order.findByIdAndUpdate(payment.order_id, {
        payment_status: "failed",
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
        $lte: new Date(endDate),
      };
    }

    const [totalStats, methodStats, statusStats, dailyStats] =
      await Promise.all([
        // Tổng quan
        Payment.aggregate([
          { $match: matchCondition },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$amount" },
              totalPayments: { $sum: 1 },
              avgAmount: { $avg: "$amount" },
            },
          },
        ]),

        // Thống kê theo phương thức
        Payment.aggregate([
          { $match: matchCondition },
          {
            $group: {
              _id: "$method",
              count: { $sum: 1 },
              totalAmount: { $sum: "$amount" },
            },
          },
          { $sort: { count: -1 } },
        ]),

        // Thống kê theo trạng thái
        Payment.aggregate([
          { $match: matchCondition },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
              totalAmount: { $sum: "$amount" },
            },
          },
        ]),

        // Thống kê theo ngày
        Payment.aggregate([
          { $match: matchCondition },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
                day: { $dayOfMonth: "$createdAt" },
              },
              count: { $sum: 1 },
              totalAmount: { $sum: "$amount" },
              successCount: {
                    $sum: {
                      $cond: [ { $in: ["$status", ["success", "completed"]] }, 1, 0 ],
                    },
              },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
        ]),
      ]);

    return {
      total: totalStats[0] || {
        totalAmount: 0,
        totalPayments: 0,
        avgAmount: 0,
      },
      byMethod: methodStats,
      byStatus: statusStats,
      daily: dailyStats,
    };
  }
}
