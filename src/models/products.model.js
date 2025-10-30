import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên sản phẩm là bắt buộc"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    sku: {
      type: String,
      required: [true, "SKU là bắt buộc"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category là bắt buộc"],
    },
    manufacturer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Manufacturer",
      default: null,
    },
    price: {
      type: Number,
      required: [true, "Giá sản phẩm là bắt buộc"],
      min: [0, "Giá không được âm"],
    },
    discount_price: {
      type: Number,
      default: null,
      min: [0, "Giá khuyến mãi không được âm"],
      validate: {
        validator: function (value) {
          return !value || value < this.price;
        },
        message: "Giá khuyến mãi phải nhỏ hơn giá gốc",
      },
    },
    discount_percent: {
      type: Number,
      default: 0,
      min: [0, "Phần trăm giảm giá không được âm"],
      max: [100, "Phần trăm giảm giá không được vượt quá 100%"],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Số lượng tồn kho không được âm"],
    },
    sold: {
      type: Number,
      default: 0,
      min: [0, "Số lượng đã bán không được âm"],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "out_of_stock", "Còn hàng", "Ngừng bán", "Hết hàng"],
      default: "active",
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating không được âm"],
      max: [5, "Rating không được vượt quá 5"],
    },
    review_count: {
      type: Number,
      default: 0,
      min: [0, "Số lượt đánh giá không được âm"],
    },
    images: [
      {
        type: String,
        validate: {
          validator: function (v) {
            return /^https?:\/\/.+/.test(v) || /^\//.test(v);
          },
          message: "URL hình ảnh không hợp lệ",
        },
      },
    ],
    description: {
      type: String,
      maxlength: [1000, "Mô tả ngắn không được vượt quá 1000 ký tự"],
    },
    description_detail: {
      type: String,
      maxlength: [5000, "Mô tả chi tiết không được vượt quá 5000 ký tự"],
    },
    specifications: {
      type: Map,
      of: String,
      default: new Map(),
    },
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    warranty: {
      type: String,
      default: "6 tháng",
    },
    views: {
      type: Number,
      default: 0,
      min: [0, "Lượt xem không được âm"],
    },
    weight: {
      type: Number,
      min: [0, "Trọng lượng không được âm"],
    },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    metaTitle: {
      type: String,
      maxlength: [60, "Meta title không được vượt quá 60 ký tự"],
    },
    metaDescription: {
      type: String,
      maxlength: [160, "Meta description không được vượt quá 160 ký tự"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ category_id: 1 });
productSchema.index({ price: 1 });
productSchema.index({ sold: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ slug: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ isActive: 1 });

// Virtual for final price (after discount)
productSchema.virtual("finalPrice").get(function () {
  return this.discount_price || this.price;
});

// Virtual for savings amount
productSchema.virtual("savings").get(function () {
  if (this.discount_price) {
    return this.price - this.discount_price;
  }
  return 0;
});

// Virtual for is in stock
productSchema.virtual("inStock").get(function () {
  return this.stock > 0;
});

// Pre-save middleware to generate slug
productSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .trim();
  }

  // Auto calculate discount percentage if discount_price is set
  if (this.discount_price && this.price) {
    this.discount_percent = Math.round(
      ((this.price - this.discount_price) / this.price) * 100
    );
  }

  // Update status based on stock
  if (this.stock === 0) {
    this.status = "out_of_stock";
  } else if (this.stock > 0 && this.status === "out_of_stock") {
    this.status = "active";
  }

  next();
});

// Static method to get featured products
productSchema.statics.getFeatured = function (limit = 8) {
  return this.find({
    isFeatured: true,
    isActive: true,
    stock: { $gt: 0 },
  })
    .limit(limit)
    .populate("category_id");
};

// Static method to get best sellers
productSchema.statics.getBestSellers = function (limit = 8) {
  return this.find({
    isActive: true,
    sold: { $gt: 0 },
  })
    .sort({ sold: -1 })
    .limit(limit)
    .populate("category_id");
};

// Instance method to increment views
productSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

const Product = mongoose.model("Product", productSchema);

export default Product;
