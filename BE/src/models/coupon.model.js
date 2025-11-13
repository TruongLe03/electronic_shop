import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Mã giảm giá là bắt buộc"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Tiêu đề giảm giá là bắt buộc"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    // Loại giảm giá: percent (phần trăm) hoặc amount (số tiền cố định)
    discount_type: {
      type: String,
      enum: ["percent", "amount"],
      required: true,
      default: "percent",
    },
    // Giá trị giảm (% hoặc số tiền)
    discount_value: {
      type: Number,
      required: [true, "Giá trị giảm giá là bắt buộc"],
      min: [0, "Giá trị giảm giá phải lớn hơn 0"],
    },
    // Giá trị đơn hàng tối thiểu để áp dụng
    min_order_value: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Giảm giá tối đa (cho loại percent)
    max_discount_amount: {
      type: Number,
      default: null,
      min: 0,
    },
    // Số lượng sử dụng tối đa (null = không giới hạn)
    max_uses: {
      type: Number,
      default: null,
      min: 0,
    },
    // Số lần đã sử dụng
    used_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Ngày hết hạn
    expiry_date: {
      type: Date,
      required: [true, "Ngày hết hạn là bắt buộc"],
    },
    // Trạng thái
    status: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "active",
    },
    
    // ===== ĐIỀU KIỆN ÁP DỤNG =====
    // Giới hạn theo user (null = áp dụng cho tất cả user)
    applicable_users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Loại áp dụng user: "all" (tất cả) hoặc "specific" (chỉ một số user)
    user_type: {
      type: String,
      enum: ["all", "specific"],
      default: "all",
    },
    
    // Giới hạn theo sản phẩm (null/empty = áp dụng cho tất cả sản phẩm)
    applicable_products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    // Giới hạn theo danh mục (null/empty = áp dụng cho tất cả danh mục)
    applicable_categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    // Loại áp dụng sản phẩm: "all" (tất cả), "specific_products", "specific_categories"
    product_type: {
      type: String,
      enum: ["all", "specific_products", "specific_categories"],
      default: "all",
    },
    
    // Giới hạn số lần sử dụng mỗi user
    usage_limit_per_user: {
      type: Number,
      default: 1,
      min: 1,
    },
    
    // Danh sách user đã sử dụng coupon (để tracking)
    used_by: [
      {
        user_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        used_count: {
          type: Number,
          default: 1,
        },
        used_at: {
          type: Date,
          default: Date.now,
        },
        orders: [
          {
            order_id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Order",
            },
            used_at: {
              type: Date,
              default: Date.now,
            },
          },
        ],
      },
    ],
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes để tối ưu query
couponSchema.index({ code: 1 });
couponSchema.index({ status: 1, expiry_date: 1 });
couponSchema.index({ status: 1, expiry_date: 1, used_count: 1 });

// Virtual để kiểm tra coupon còn hiệu lực
couponSchema.virtual("isValid").get(function () {
  const now = new Date();
  return (
    this.status === "active" &&
    this.expiry_date > now &&
    (this.max_uses === null || this.used_count < this.max_uses)
  );
});

// Virtual để tính số lượng còn lại
couponSchema.virtual("remaining_uses").get(function () {
  if (this.max_uses === null) return "Không giới hạn";
  return Math.max(0, this.max_uses - this.used_count);
});

// Method để kiểm tra có thể sử dụng coupon
couponSchema.methods.canUse = function (orderValue = 0, userId = null, productIds = []) {
  const now = new Date();
  
  // Kiểm tra trạng thái
  if (this.status !== "active") {
    return { valid: false, message: "Mã giảm giá không còn hoạt động" };
  }
  
  // Kiểm tra hết hạn
  if (this.expiry_date <= now) {
    return { valid: false, message: "Mã giảm giá đã hết hạn" };
  }
  
  // Kiểm tra số lần sử dụng tổng
  if (this.max_uses !== null && this.used_count >= this.max_uses) {
    return { valid: false, message: "Mã giảm giá đã hết lượt sử dụng" };
  }
  
  // Kiểm tra giới hạn theo user
  if (userId) {
    // Nếu là user type specific, kiểm tra user có trong danh sách không
    if (this.user_type === "specific") {
      if (!this.applicable_users || this.applicable_users.length === 0) {
        return { valid: false, message: "Mã giảm giá chỉ dành cho một số user nhất định" };
      }
      
      const isApplicableUser = this.applicable_users.some(
        (id) => id.toString() === userId.toString()
      );
      
      if (!isApplicableUser) {
        return { valid: false, message: "Mã giảm giá không áp dụng cho tài khoản của bạn" };
      }
    }
    
    // Kiểm tra số lần sử dụng của user này (áp dụng cho tất cả user)
    const userUsage = this.used_by.find(
      (item) => item.user_id.toString() === userId.toString()
    );
    
    if (userUsage && userUsage.used_count >= this.usage_limit_per_user) {
      return { valid: false, message: "Bạn đã sử dụng hết lượt cho mã giảm giá này" };
    }
  }
  
  // Kiểm tra giới hạn theo sản phẩm
  if (this.product_type === "specific_products" && productIds && productIds.length > 0) {
    if (!this.applicable_products || this.applicable_products.length === 0) {
      return { valid: false, message: "Mã giảm giá chỉ áp dụng cho một số sản phẩm nhất định" };
    }
    
    // Kiểm tra ít nhất 1 sản phẩm trong đơn hàng có trong danh sách áp dụng
    const hasApplicableProduct = productIds.some((productId) =>
      this.applicable_products.some((id) => id.toString() === productId.toString())
    );
    
    if (!hasApplicableProduct) {
      return { valid: false, message: "Mã giảm giá không áp dụng cho sản phẩm này" };
    }
  }
  
  // Kiểm tra giá trị đơn hàng tối thiểu
  if (orderValue < this.min_order_value) {
    return { 
      valid: false, 
      message: `Đơn hàng tối thiểu ${this.min_order_value.toLocaleString('vi-VN')}đ để sử dụng mã này` 
    };
  }
  
  return { valid: true, message: "Mã giảm giá hợp lệ" };
};

// Method để tính số tiền giảm
couponSchema.methods.calculateDiscount = function (orderValue) {
  let discountAmount = 0;
  
  if (this.discount_type === "percent") {
    discountAmount = (orderValue * this.discount_value) / 100;
    
    // Áp dụng giảm tối đa nếu có
    if (this.max_discount_amount && discountAmount > this.max_discount_amount) {
      discountAmount = this.max_discount_amount;
    }
  } else if (this.discount_type === "amount") {
    discountAmount = this.discount_value;
  }
  
  // Đảm bảo không giảm quá giá trị đơn hàng
  return Math.min(discountAmount, orderValue);
};

// Method để tăng used_count và tracking user
couponSchema.methods.markAsUsed = async function (userId, orderId) {
  this.used_count += 1;
  
  // Tìm user đã sử dụng coupon này chưa
  const existingUser = this.used_by.find(
    (item) => item.user_id.toString() === userId.toString()
  );
  
  if (existingUser) {
    // User đã dùng rồi, tăng count
    existingUser.used_count += 1;
    existingUser.used_at = new Date();
    // Thêm order vào danh sách
    existingUser.orders.push({
      order_id: orderId,
      used_at: new Date(),
    });
  } else {
    // User dùng lần đầu
    this.used_by.push({
      user_id: userId,
      used_count: 1,
      used_at: new Date(),
      orders: [
        {
          order_id: orderId,
          used_at: new Date(),
        },
      ],
    });
  }
  
  // Tự động chuyển sang expired nếu đã dùng hết
  if (this.max_uses !== null && this.used_count >= this.max_uses) {
    this.status = "expired";
  }
  
  return await this.save();
};

// Static method để tìm coupon hợp lệ theo code
couponSchema.statics.findValidByCode = async function (code) {
  const coupon = await this.findOne({ 
    code: code.toUpperCase(),
    status: "active",
    expiry_date: { $gt: new Date() },
  });
  
  return coupon;
};

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
