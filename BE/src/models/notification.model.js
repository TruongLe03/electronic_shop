import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "order_created",
        "order_confirmed",
        "order_processing",
        "order_shipping",
        "order_delivered",
        "order_cancelled",
        "payment_success",
        "payment_failed",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    is_read: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
notificationSchema.index({ user_id: 1, createdAt: -1 });
notificationSchema.index({ user_id: 1, is_read: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
