import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    unique: true,
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  amount: {
    type: Number,
    required: true
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
    enum: ['pending', 'processing', 'success', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  // Gateway specific fields
  gatewayProvider: String, // vnpay, momo, etc.
  transactionId: String, // Gateway transaction ID
  gatewayResponseCode: String,
  gatewayResponseMessage: String,
  
  // VNPay specific
  vnp_TxnRef: String,
  vnp_TransactionNo: String,
  vnp_ResponseCode: String,
  vnp_SecureHash: String,
  
  // MoMo specific
  partnerCode: String,
  momoTransId: String,
  momoSignature: String,
  
  // ZaloPay specific
  app_trans_id: String,
  zp_trans_id: String,
  
  // Bank Transfer specific
  bankCode: String,
  bankTransactionId: String,
  
  // Callback verification
  callbackVerified: {
    type: Boolean,
    default: false
  },
  callbackData: mongoose.Schema.Types.Mixed,
  
  // Timing
  initiatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  expiredAt: Date,
  
  // Refund information
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: String,
  refundedAt: Date,
  refundTransactionId: String,
  
  // Additional data
  customerInfo: {
    name: String,
    email: String,
    phone: String
  },
  ipAddress: String,
  userAgent: String,
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

// Generate payment ID
paymentSchema.pre('save', async function(next) {
  if (!this.paymentId) {
    this.paymentId = 'PAY' + Date.now().toString() + Math.random().toString(36).substring(2, 5).toUpperCase();
  }
  this.updatedAt = new Date();
  next();
});

// Index for better query performance
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ method: 1 });
paymentSchema.index({ createdAt: -1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;