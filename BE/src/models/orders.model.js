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
    shipping_fee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    shipping_address: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
    payment_method: {
      type: String,
      enum: ["COD", "cod", "Bank", "bank", "MoMo", "momo", "VNPay", "vnpay"],
      default: "COD",
    },
    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    tracking_number: { type: String, default: null },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed", 
        "processing",
        "shipping",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    notes: { type: String, default: "" },
    delivery_date: { type: Date, default: null },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
