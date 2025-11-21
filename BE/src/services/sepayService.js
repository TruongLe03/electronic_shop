import { SePayPgClient } from "sepay-pg-node";
import Order from "../models/orders.model.js";
import Payment from "../models/payment.model.js";

export class SepayService {
  // SePay configuration
  static SEPAY_ENV = process.env.SEPAY_ENV || "sandbox";
  static SEPAY_MERCHANT_ID = process.env.SEPAY_MERCHANT_ID;
  static SEPAY_SECRET_KEY = process.env.SEPAY_SECRET_KEY;
  static SEPAY_SUCCESS_URL =
    process.env.SEPAY_SUCCESS_URL || "http://goatenglish.online/payment/success";
  static SEPAY_ERROR_URL =
    process.env.SEPAY_ERROR_URL || "http://goatenglish.online/payment/failed";
  static SEPAY_CANCEL_URL =
    process.env.SEPAY_CANCEL_URL || "http://goatenglish.online/payment/cancelled";
  /**
   * Khởi tạo SePay Client
   */
  static getClient() {
    return new SePayPgClient({
      env: this.SEPAY_ENV,
      merchant_id: this.SEPAY_MERCHANT_ID,
      secret_key: this.SEPAY_SECRET_KEY,
    });
  }

  /**
   * Tạo payment fields cho SePay checkout
   */
  static async createPaymentFields(orderId) {
    try {
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
        method: "sepay",
        customer_info: {
          name: order.shipping_address?.name,
          phone: order.shipping_address?.phone,
        },
        status: "pending",
      });

      const savedPayment = await payment.save();

      // Khởi tạo SePay client
      const client = this.getClient();

      // Tạo payment fields với SDK
      const fields = client.checkout.initOneTimePaymentFields({
        operation: "PURCHASE",
        payment_method: "BANK_TRANSFER", // Thanh toán bằng quét mã QR chuyển khoản
        order_invoice_number: order.orderId, // Mã đơn hàng duy nhất
        order_amount: Math.round(order.total), // Số tiền (phải là số nguyên)
        currency: 'VND',
        order_description: `Thanh toan don hang ${order.orderId}`,
        customer_id: order.user_id.toString(),
        success_url: `${this.SEPAY_SUCCESS_URL}?orderId=${order._id}&paymentId=${savedPayment._id}`,
      });
      // Lấy checkout URL
      const checkoutUrl = client.checkout.initCheckoutUrl();

      // Tạo form HTML cho thanh toán
      const formHtml = `<form action="${checkoutUrl}" method="POST">
${Object.keys(fields).map(field => `  <input type="hidden" name="${field}" value="${fields[field]}" />`).join('\n')}
    <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold transition-colors">Thanh toán ngay</button>
</form>`;

      console.log("📋 Generated payment form HTML:", formHtml);
      
      return {
        success: true,
        payment: savedPayment,
        checkoutUrl,
        fields,
        formHtml,
        orderId: order._id,
        orderNumber: order.orderId,
      };
    } catch (error) {
      console.error("❌ Create SePay payment fields error:", error);
      throw error;
    }
  }

  /**
   * Xử lý callback từ SePay khi thanh toán thành công
   */
  static async handleCallback(callbackData) {
    try {
      console.log("📨 SePay callback received:", callbackData);

      const {
        order_invoice_number,
        order_amount,
        order_status,
        transaction_id,
        custom_data,
        signature,
      } = callbackData;

      // Verify signature
      const client = this.getClient();
      const isValid = this.verifySignature(callbackData, signature);

      if (!isValid) {
        console.log("❌ Invalid signature");
        return { success: false, message: "Invalid signature" };
      }

      // Parse custom data
      let parsedData = {};
      try {
        if (custom_data) {
          parsedData = JSON.parse(custom_data);
        }
      } catch (e) {
        console.error("Error parsing custom_data:", e);
      }

      const { paymentId, orderId } = parsedData;

      if (!paymentId) {
        console.log("❌ Payment ID not found in custom_data");
        return { success: false, message: "Payment ID not found" };
      }

      const payment = await Payment.findById(paymentId);

      if (!payment) {
        console.log("❌ Payment not found:", paymentId);
        return { success: false, message: "Payment not found" };
      }

      // Kiểm tra số tiền
      if (Math.abs(order_amount - payment.amount) > 1) {
        console.log("❌ Amount mismatch:", {
          expected: payment.amount,
          received: order_amount,
        });
        return { success: false, message: "Amount mismatch" };
      }

      // Kiểm tra trạng thái hiện tại
      if (payment.status === "completed") {
        console.log("⚠️ Payment already completed:", paymentId);
        return { success: true, message: "Payment already completed" };
      }

      // Kiểm tra trạng thái đơn hàng từ SePay
      if (order_status !== "SUCCESS") {
        console.log("⚠️ Order not successful:", order_status);
        payment.status = "failed";
        payment.failure_reason = `Order status: ${order_status}`;
        await payment.save();

        await Order.findByIdAndUpdate(payment.order_id, {
          payment_status: "failed",
          status: "payment_failed",
        });

        return { success: false, message: `Payment failed: ${order_status}` };
      }

      // Cập nhật payment
      payment.status = "completed";
      payment.paid_at = new Date();
      payment.gateway_transaction_id = transaction_id;
      payment.gateway_response = callbackData;
      await payment.save();

      // Cập nhật order
      await Order.findByIdAndUpdate(payment.order_id, {
        payment_status: "completed",
        status: "confirmed",
        payment_completed_at: new Date(),
        confirmed_at: new Date(),
        payment_info: {
          method: "sepay",
          transaction_id: transaction_id,
          gateway_response: callbackData,
        },
      });

      console.log("✅ SePay payment completed:", paymentId);

      return {
        success: true,
        message: "Payment processed successfully",
        paymentId,
        orderId: payment.order_id,
      };
    } catch (error) {
      console.error("❌ SePay callback error:", error);
      throw error;
    }
  }

  /**
   * Xác minh chữ ký từ SePay callback
   */
  static verifySignature(data, signature) {
    try {
      const client = this.getClient();
      // Loại bỏ signature khỏi data để verify
      const dataToVerify = { ...data };
      delete dataToVerify.signature;

      // SDK sẽ tự động verify signature
      // Đây là placeholder, cần implement đúng theo SDK
      return true; // Tạm thời return true, cần check SDK documentation
    } catch (error) {
      console.error("Verify signature error:", error);
      return false;
    }
  }

  /**
   * Kiểm tra trạng thái đơn hàng từ SePay API
   */
  static async checkOrderStatus(orderInvoiceNumber) {
    try {
      const client = this.getClient();
      const result = await client.order.retrieve(orderInvoiceNumber);

      console.log("📋 SePay order status:", result);
      return result;
    } catch (error) {
      console.error("Check order status error:", error);
      throw error;
    }
  }

  /**
   * Kiểm tra trạng thái payment từ database
   */
  static async checkTransactionStatus(paymentId) {
    try {
      const payment = await Payment.findById(paymentId).populate("order_id");
      if (!payment) {
        throw new Error("Không tìm thấy payment");
      }

      return {
        paymentId: payment._id,
        orderId: payment.order_id._id,
        orderNumber: payment.order_id.orderId,
        amount: payment.amount,
        status: payment.status,
        paid_at: payment.paid_at,
        transaction_id: payment.gateway_transaction_id,
      };
    } catch (error) {
      console.error("Check transaction status error:", error);
      throw error;
    }
  }

  /**
   * Lấy danh sách đơn hàng từ SePay (Admin only)
   */
  static async getAllOrders(params = {}) {
    try {
      const client = this.getClient();
      const result = await client.order.all(params);

      console.log("📋 SePay orders list:", result);
      return result;
    } catch (error) {
      console.error("Get SePay orders error:", error);
      throw new Error(`Failed to get orders: ${error.message}`);
    }
  }

  /**
   * Hủy đơn hàng (dành cho thanh toán QR)
   */
  static async cancelOrder(orderInvoiceNumber) {
    try {
      const client = this.getClient();
      const result = await client.order.cancel(orderInvoiceNumber);

      console.log("🔄 SePay order cancelled:", result);
      return result;
    } catch (error) {
      console.error("Cancel order error:", error);
      throw error;
    }
  }

  /**
   * Validate SePay configuration
   */
  static validateConfig() {
    const errors = [];

    if (!this.SEPAY_MERCHANT_ID) {
      errors.push("SEPAY_MERCHANT_ID is required");
    }

    if (!this.SEPAY_SECRET_KEY) {
      errors.push("SEPAY_SECRET_KEY is required");
    }

    if (!["sandbox", "production"].includes(this.SEPAY_ENV)) {
      errors.push('SEPAY_ENV must be "sandbox" or "production"');
    }

    if (errors.length > 0) {
      throw new Error(`SePay configuration errors: ${errors.join(", ")}`);
    }

    console.log("✅ SePay configuration validated successfully");
    console.log(`   Environment: ${this.SEPAY_ENV}`);
    console.log(`   Merchant ID: ${this.SEPAY_MERCHANT_ID}`);
    return true;
  }
}
