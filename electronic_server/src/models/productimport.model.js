import mongoose from "mongoose";

const productsImportSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: [true, "Sản phẩm là bắt buộc"],
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: [true, "Nhà cung cấp là bắt buộc"],
  },
  quantity: {
    type: Number,
    required: [true, "Số lượng nhập là bắt buộc"],
    min: [1, "Số lượng phải lớn hơn 0"],
    validate: {
      validator: Number.isInteger,
      message: "Số lượng phải là số nguyên",
    },
  },
  importPrice: {
    type: Number,
    required: [true, "Giá nhập là bắt buộc"],
    min: [0, "Giá nhập không được âm"],
  },
  note: {
    type: String,
    trim: true,
    maxlength: [500, "Ghi chú không vượt quá 500 ký tự"],
    default: "",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Người nhập là bắt buộc"],
  },
  importDate: {
    type: Date,
    default: Date.now,
  },
});

const ProductsImport = mongoose.model("ProductsImport", productsImportSchema);
export default ProductsImport;
