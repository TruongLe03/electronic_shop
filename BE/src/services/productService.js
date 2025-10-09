import Product from "../models/products.model.js";
import Inventory from "../models/inventory.model.js";
import { ValidationUtil } from "../utils/validation.util.js";

export class ProductService {
  // Lấy sản phẩm có discount lớn hơn threshold
  static async getDiscountedProducts(threshold = 40, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const query = { discount_percent: { $gt: threshold } };

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ discount_percent: -1 })
        .skip(skip)
        .limit(limit)
        .populate("category_id"),
      Product.countDocuments(query),
    ]);

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Lấy danh sách sản phẩm với filtering và pagination
  static async getProducts(filters = {}, pagination = {}) {
    const {
      categoryId,
      minPrice,
      maxPrice,
      inStock,
      onSale,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const {
      page = 1,
      limit = 20
    } = pagination;

    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    if (categoryId) {
      query.category_id = categoryId;
    }

    if (minPrice !== null || maxPrice !== null) {
      query.price = {};
      if (minPrice !== null) query.price.$gte = minPrice;
      if (maxPrice !== null) query.price.$lte = maxPrice;
    }

    if (inStock) {
      query.stock_quantity = { $gt: 0 };
    }

    if (onSale) {
      query.discount_percent = { $gt: 0 };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    let sort = {};
    if (sortBy === 'price') {
      sort.price = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'name') {
      sort.name = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'sold') {
      sort.sold = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'rating') {
      sort.rating = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = sortOrder === 'asc' ? 1 : -1;
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("category_id"),
      Product.countDocuments(query),
    ]);

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Lấy chi tiết sản phẩm
  static async getProductById(productId) {
    const product = await Product.findById(productId).populate("category_id");
    if (!product) {
      throw new Error("Không tìm thấy sản phẩm");
    }
    return product;
  }

  // Lấy sản phẩm theo danh mục
  static async getProductsByCategory(categoryId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const query = { category_id: categoryId };

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("category_id"),
      Product.countDocuments(query),
    ]);

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Lấy sản phẩm best seller
  static async getBestSellingProducts(limit = 10) {
    return await Product.find()
      .sort({ sold: -1 })
      .limit(limit)
      .populate("category_id");
  }

  // Lấy sản phẩm mới nhất
  static async getLatestProducts(limit = 10) {
    return await Product.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("category_id");
  }

  // Tạo sản phẩm mới
  static async createProduct(productData) {
    const product = new Product(productData);
    return await product.save();
  }

  // Cập nhật sản phẩm
  static async updateProduct(productId, updateData) {
    const product = await Product.findByIdAndUpdate(
      productId, 
      updateData, 
      { new: true, runValidators: true }
    ).populate("category_id");
    
    if (!product) {
      throw new Error("Không tìm thấy sản phẩm");
    }
    
    return product;
  }

  // Xóa sản phẩm
  static async deleteProduct(productId) {
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      throw new Error("Không tìm thấy sản phẩm");
    }
    return product;
  }

  // Kiểm tra stock
  static async checkProductStock(productId, quantity) {
    // Import Inventory model to check stock
    const Inventory = (await import("../models/inventory.model.js")).default;
    
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Không tìm thấy sản phẩm");
    }
    
    // Check inventory for stock
    const inventory = await Inventory.findOne({ productId: productId });
    if (!inventory) {
      return false; // No inventory record means no stock
    }
    
    const availableQuantity = inventory.quantity - (inventory.reservedQuantity || 0);
    return availableQuantity >= quantity;
  }

  // Cập nhật stock
  static async updateProductStock(productId, quantity, operation = 'decrease') {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Không tìm thấy sản phẩm");
    }

    if (operation === 'decrease') {
      if (product.stock_quantity < quantity) {
        throw new Error("Không đủ hàng trong kho");
      }
      product.stock_quantity -= quantity;
      product.sold += quantity;
    } else if (operation === 'increase') {
      product.stock_quantity += quantity;
    }

    return await product.save();
  }

  // Lấy sản phẩm theo category
  static async getProductsByCategory(categoryId, options = {}) {
    const {
      page = 1,
      limit = 20,
      excludeId
    } = options;

    const skip = (page - 1) * limit;

    // Build query
    const query = { category_id: categoryId };

    // Loại trừ sản phẩm hiện tại nếu có excludeId
    if (excludeId && ValidationUtil.isValidObjectId(excludeId)) {
      query._id = { $ne: excludeId };
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .skip(skip)
        .limit(limit)
        .populate("category_id")
        .sort({ createdAt: -1 }),
      Product.countDocuments(query),
    ]);

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Lấy sản phẩm liên quan
  static async getRelatedProducts(productId, limit = 4) {
    const currentProduct = await Product.findById(productId);
    if (!currentProduct) {
      throw new Error("Không tìm thấy sản phẩm");
    }

    const relatedProducts = await Product.find({
      category_id: currentProduct.category_id,
      _id: { $ne: productId }
    })
    .sort({ sold: -1, createdAt: -1 })
    .limit(limit)
    .populate("category_id", "name slug");

    return relatedProducts;
  }
}