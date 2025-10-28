import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  // Unique payment identifier
  paymentId: {
    type: String,
    unique: true,
    default: function() {
      return 'PAY' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
  },
  // Sử dụng _id của MongoDB làm payment ID chính
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'VND'
  },
  method: {
    type: String,
    enum: ['cod', 'vnpay', 'momo', 'zalopay', 'stripe', 'paypal', 'bank_transfer'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  // Gateway transaction information
  gateway_transaction_id: String, // ID từ gateway (VNPay, MoMo, etc.)
  gateway_response: mongoose.Schema.Types.Mixed, // Raw response từ gateway
  
  // Customer information
  customer_info: {
    name: String,
    email: String,
    phone: String
  },
  
  // Network info
  ip_address: String,
  user_agent: String,
  
  // Payment timing
  paid_at: Date,
  failed_at: Date,
  cancelled_at: Date,
  expires_at: Date,
  
  // Failure information
  failure_reason: String,
  
  // Refund information
  refund_amount: {
    type: Number,
    default: 0
  },
  refunds: [{
    amount: Number,
    reason: String,
    refunded_at: Date,
    refund_transaction_id: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    }
  }],
  
  // Admin notes
  admin_note: String,
  notes: String,
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update timestamps
paymentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual để tương thích với code cũ
paymentSchema.virtual('orderId').get(function() {
  return this.order_id;
});

paymentSchema.virtual('orderId').set(function(value) {
  this.order_id = value;
});

// Index for better query performance
paymentSchema.index({ order_id: 1 });
paymentSchema.index({ gateway_transaction_id: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ method: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ 'customer_info.email': 1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;