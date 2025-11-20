import Product from "../models/products.model.js";
import Inventory from "../models/inventory.model.js";
import { ValidationUtil } from "../utils/validation.util.js";

export class ProductService {
  // Lấy sản phẩm có discount lớn hơn hoặc bằng threshold
  static async getDiscountedProducts(threshold = 0, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const query = { discount_percent: { $gte: threshold } };

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ discount_percent: -1 })
        .skip(skip)
        .limit(limit)
        .populate("category_id", "name slug description"),
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
      category_id,
      minPrice,
      maxPrice,
      inStock,
      onSale,
      search,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters;

    const { page = 1, limit = 20 } = pagination;

    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    if (categoryId || category_id) {
      query.category_id = categoryId || category_id;
    }

    if (
      (minPrice !== null && minPrice !== undefined) ||
      (maxPrice !== null && maxPrice !== undefined)
    ) {
      query.price = {};
      if (minPrice !== null && minPrice !== undefined)
        query.price.$gte = minPrice;
      if (maxPrice !== null && maxPrice !== undefined)
        query.price.$lte = maxPrice;
    }

    if (inStock) {
      query.stock_quantity = { $gt: 0 };
    }

    if (onSale) {
      query.discount_percent = { $gt: 0 };
    }

    if (status && status.trim() !== "") {
      query.status = status;
    }

    if (search && search.trim() !== "") {
      const searchRegex = { $regex: search, $options: "i" };
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { description_detail: searchRegex },
        { tags: searchRegex },
        { sku: searchRegex }
      ];
    }

    // Build sort
    let sort = {};
    if (sortBy === "price") {
      sort.price = sortOrder === "asc" ? 1 : -1;
    } else if (sortBy === "name") {
      sort.name = sortOrder === "asc" ? 1 : -1;
    } else if (sortBy === "sold") {
      sort.sold = sortOrder === "asc" ? 1 : -1;
    } else if (sortBy === "rating") {
      sort.rating = sortOrder === "asc" ? 1 : -1;
    } else {
      sort.createdAt = sortOrder === "asc" ? 1 : -1;
    }

    // Add timeout protection
    const queryOptions = {
      maxTimeMS: 5000, // 5 seconds timeout
    };

    const [products, total] = await Promise.all([
      Product.find(query, null, queryOptions)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("category_id", "name slug description")
        .lean(), // Use lean() for better performance
      Product.countDocuments(query, queryOptions),
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
    const queryOptions = {
      maxTimeMS: 5000, // 5 seconds timeout
    };

    const product = await Product.findById(productId, null, queryOptions)
      .populate("category_id", "name slug description")
      .lean();

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
        .populate("category_id", "name slug description"),
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
      .populate("category_id", "name slug description");
  }

  // Lấy sản phẩm mới nhất
  static async getLatestProducts(limit = 10) {
    return await Product.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("category_id", "name slug description");
  }

  // Tạo sản phẩm mới
  static async createProduct(productData) {
    const product = new Product(productData);
    return await product.save();
  }

  // Cập nhật sản phẩm
  static async updateProduct(productId, updateData) {
    const product = await Product.findByIdAndUpdate(productId, updateData, {
      new: true,
      runValidators: true,
    }).populate("category_id", "name slug description");

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

  // Lấy thông tin tồn kho chi tiết
  static async getProductStock(productId) {
    const product = await Product.findById(productId);
    if (!product) {
      return null;
    }

    // Kiểm tra stock từ product model hoặc inventory model
    const Inventory = (await import("../models/inventory.model.js")).default;
    const inventory = await Inventory.findOne({ productId: productId });
    
    if (inventory) {
      return {
        quantity: inventory.quantity - (inventory.reservedQuantity || 0),
        totalQuantity: inventory.quantity,
        reservedQuantity: inventory.reservedQuantity || 0
      };
    }
    
    // Fallback to product stock field
    return {
      quantity: product.stock_quantity || product.stock || 0,
      totalQuantity: product.stock_quantity || product.stock || 0,
      reservedQuantity: 0
    };
  }

  // Kiểm tra stock
  static async checkProductStock(productId, quantity) {
    const stockInfo = await this.getProductStock(productId);
    return stockInfo && stockInfo.quantity >= quantity;
  }

  // Cập nhật stock
  static async updateProductStock(productId, quantity, operation = "decrease") {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Không tìm thấy sản phẩm");
    }

    const oldStock = product.stock_quantity || product.stock || 0;

    if (operation === "decrease") {
      if (oldStock < quantity) {
        throw new Error("Không đủ hàng trong kho");
      }
      if (product.stock_quantity !== undefined) {
        product.stock_quantity -= quantity;
      } else {
        product.stock -= quantity;
      }
      product.sold = (product.sold || 0) + quantity;
    } else if (operation === "increase") {
      if (product.stock_quantity !== undefined) {
        product.stock_quantity += quantity;
      } else {
        product.stock += quantity;
      }
    }

    const updatedProduct = await product.save();
    
    // Kiểm tra và gửi thông báo khi có hàng (chỉ khi increase stock)
    if (operation === "increase") {
      const newStock = updatedProduct.stock_quantity || updatedProduct.stock || 0;
      if (oldStock === 0 && newStock > 0) {
        // Import StockNotificationService dynamically to avoid circular dependency
        try {
          const { StockNotificationService } = await import("./stockNotificationService.js");
          await StockNotificationService.checkAndNotifyStockAvailable(productId, newStock);
        } catch (error) {
          console.error("Error sending stock notifications:", error);
        }
      }
    }

    return updatedProduct;
  }

  // Lấy sản phẩm theo category
  static async getProductsByCategory(categoryId, options = {}) {
    const { page = 1, limit = 20, excludeId } = options;

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
        .populate("category_id", "name slug description")
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
      _id: { $ne: productId },
    })
      .sort({ sold: -1, createdAt: -1 })
      .limit(limit)
      .populate("category_id", "name slug description");

    return relatedProducts;
  }
}
