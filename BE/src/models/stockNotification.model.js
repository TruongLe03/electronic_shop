import mongoose from "mongoose";

const stockNotificationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", 
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  quantity_needed: {
    type: Number,
    default: 1,
    min: 1
  },
  status: {
    type: String,
    enum: ["active", "notified", "cancelled"],
    default: "active"
  },
  notified_at: {
    type: Date
  },
  expires_at: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  }
}, {
  timestamps: true,
  collection: "stock_notifications"
});

// Index for efficient queries
stockNotificationSchema.index({ product_id: 1, status: 1 });
stockNotificationSchema.index({ user_id: 1, status: 1 });
stockNotificationSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

// Prevent duplicate active notifications for same user+product
stockNotificationSchema.index({ 
  user_id: 1, 
  product_id: 1, 
  status: 1 
}, { 
  unique: true,
  partialFilterExpression: { status: "active" }
});

export default mongoose.model("StockNotification", stockNotificationSchema);