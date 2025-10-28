import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  otp: {
    type: String,
    required: true,
    length: 6
  },
  purpose: {
    type: String,
    required: true,
    enum: ['reset-password', 'verify-email'],
    default: 'reset-password'
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5 // Giới hạn 5 lần thử
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // OTP tự động xóa sau 10 phút (600 giây)
  }
});

// Index để tìm kiếm nhanh
otpSchema.index({ email: 1, purpose: 1 });
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

// Method để verify OTP
otpSchema.methods.verifyOTP = function(inputOTP) {
  if (this.verified) {
    return { success: false, message: 'OTP đã được sử dụng' };
  }
  
  if (this.attempts >= 5) {
    return { success: false, message: 'Đã vượt quá số lần thử cho phép' };
  }
  
  // Tăng số lần thử
  this.attempts += 1;
  
  if (this.otp !== inputOTP) {
    return { 
      success: false, 
      message: `Mã OTP không đúng. Còn lại ${5 - this.attempts} lần thử` 
    };
  }
  
  // OTP đúng
  this.verified = true;
  return { success: true, message: 'Xác thực OTP thành công' };
};

// Static method để tạo OTP mới
otpSchema.statics.createOTP = async function(email, otp, purpose = 'reset-password') {
  // Xóa các OTP cũ chưa được verify cho email này
  await this.deleteMany({ 
    email: email, 
    purpose: purpose, 
    verified: false 
  });
  
  // Tạo OTP mới
  const newOTP = new this({
    email,
    otp,
    purpose
  });
  
  return await newOTP.save();
};

// Static method để verify OTP
otpSchema.statics.verifyOTPCode = async function(email, inputOTP, purpose = 'reset-password') {
  try {
    const otpRecord = await this.findOne({
      email: email,
      purpose: purpose,
      verified: false
    }).sort({ createdAt: -1 }); // Lấy OTP mới nhất
    
    if (!otpRecord) {
      return { 
        success: false, 
        message: 'Không tìm thấy mã OTP hoặc mã đã hết hạn' 
      };
    }
    
    const result = otpRecord.verifyOTP(inputOTP);
    await otpRecord.save();
    
    return result;
    
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { 
      success: false, 
      message: 'Lỗi hệ thống khi xác thực OTP' 
    };
  }
};

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;