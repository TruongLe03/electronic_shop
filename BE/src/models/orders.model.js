import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      default: () =>
        "ORD" +
        Date.now() +
        Math.random().toString(36).substr(2, 5).toUpperCase(),
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String }, // Add image field
      },
    ],
    subtotal: { type: Number, required: true },
    coupon_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
    coupon_code: { type: String, default: null },
    discount_amount: { type: Number, default: 0 },
    shipping_fee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    shipping_address: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
    payment_method: {
      type: String,
      enum: ["COD", "cod", "VNPay", "vnpay"],
      default: "COD",
    },
    payment_status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    tracking_number: { type: String, default: null },
    status: {
      type: String,
      enum: [
        "pending",          // Vừa tạo đơn, chờ thanh toán
        "payment_pending",  // Đang chờ thanh toán (VNPay)
        "payment_failed",   // Thanh toán thất bại
        "confirmed",        // Đã thanh toán, chờ xử lý
        "processing",       // Đang chuẩn bị hàng
        "ready_to_ship",    // Sẵn sàng giao hàng
        "shipping",         // Đang giao hàng
        "delivered",        // Đã giao thành công
        "cancelled",        // Đã hủy
        "returned",         // Đã trả hàng
      ],
      default: "pending",
    },
    notes: { type: String, default: "" },
    delivery_date: { type: Date, default: null },
    
    // Timestamps cho từng giai đoạn
    payment_completed_at: { type: Date, default: null },
    confirmed_at: { type: Date, default: null },
    processing_at: { type: Date, default: null },
    shipped_at: { type: Date, default: null },
    delivered_at: { type: Date, default: null },
    cancelled_at: { type: Date, default: null },
    
    // Thông tin thanh toán chi tiết
    payment_info: {
      method: String,
      transaction_id: String,
      gateway_response: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
