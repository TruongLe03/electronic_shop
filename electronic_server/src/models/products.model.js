import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    sku: { 
      type: String, 
      required: true, 
      unique: true 
    },
    category_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Category" 
    },
    manufacturer_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Manufacturer",
      default: null 
    },
    price: { 
      type: Number, 
      required: true 
    },
    discount_price: { 
      type: Number, 
      default: null 
    },
    discount_percent: { 
      type: String, 
      default: null 
    },
    stock: { 
      type: Number, 
      default: 0 
    },
    sold: { 
      type: Number, 
      default: 0 
    },
    status: { 
      type: String, 
      default: "Còn hàng" 
    },
    rating: { 
      type: String, 
      default: "" 
    },
    images: [{ 
      type: String 
    }],
    description: { 
      type: String 
    },
    description_detail: { 
      type: String 
    },
    specifications: { 
      type: Object 
    },
    tags: [{ 
      type: String 
    }],
    warranty: { 
      type: String,
      default: "6 tháng"
    },
    views: { 
      type: Number, 
      default: 0 
    }
  },
  { 
    timestamps: true 
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
