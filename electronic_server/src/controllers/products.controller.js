import Product from "../models/products.model.js";
import mongoose from "mongoose";

// Lấy sản phẩm có discount lớn hơn 40%
export const getDiscountedProducts = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 20;
    let skip = (page - 1) * limit;

    const query = { discount_percent: { $gt: 40 } };

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ discount_percent: -1 }) // Sắp xếp giảm dần theo discount_percent
        .skip(skip)
        .limit(limit)
        .populate("category_id"),
      Product.countDocuments(query),
    ]);

    res.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Lấy tất cả sản phẩm (có phân trang)
export const getProducts = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 20;
    let skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find().skip(skip).limit(limit).populate("category_id"),
      Product.countDocuments(),
    ]);

    res.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Lấy sản phẩm theo category (có phân trang)
export const getProductsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 20;
    let skip = (page - 1) * limit;
    const excludeId = req.query.exclude; // ID sản phẩm cần loại trừ (cho related products)

    console.log("Received categoryId:", categoryId);

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      console.log("Invalid ObjectId format");
      return res.status(400).json({
        message: "Category ID không hợp lệ",
        error: "Invalid ObjectId format",
      });
    }

    const query = { category_id: new mongoose.Types.ObjectId(categoryId) };

    // Loại trừ sản phẩm hiện tại nếu có excludeId
    if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
      query._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
    }

    console.log("Query:", JSON.stringify(query));

    const [products, total] = await Promise.all([
      Product.find(query).skip(skip).limit(limit).populate("category_id"),
      Product.countDocuments(query),
    ]);

    console.log(`Found ${products.length} products for category ${categoryId}`); // Debug log

    res.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Lấy sản phẩm theo ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
    }

    const product = await Product.findById(id).populate("category_id");

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Thêm sản phẩm
export const createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Không thêm được sản phẩm", error: err.message });
  }
};

// Cập nhật sản phẩm
export const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProduct)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json(updatedProduct);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Không cập nhật được sản phẩm", error: err.message });
  }
};

// Xóa sản phẩm
export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json({ message: "Xóa sản phẩm thành công" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Không xóa được sản phẩm", error: err.message });
  }
};
