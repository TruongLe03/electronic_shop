import { ProductService } from "../services/productService.js";
import { ResponseUtil, asyncHandler } from "../utils/response.util.js";
import { ValidationUtil } from "../utils/validation.util.js";
import Product from "../models/products.model.js";
import mongoose from "mongoose";

// Lấy sản phẩm có discount (có thể điều chỉnh threshold)
export const getDiscountedProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const minDiscount = parseInt(req.query.minDiscount) || 0; // Cho phép điều chỉnh ngưỡng giảm giá

  const result = await ProductService.getDiscountedProducts(
    minDiscount,
    page,
    limit
  );
  return ResponseUtil.success(
    res,
    result,
    "Lấy sản phẩm khuyến mãi thành công"
  );
});

// Lấy tất cả sản phẩm (có phân trang và filtering)
export const getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  // Filtering parameters
  const options = {
    page,
    limit,
    categoryId: req.query.categoryId,
    minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : null,
    maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : null,
    inStock: req.query.inStock === "true",
    onSale: req.query.onSale === "true",
    search: req.query.search,
    sortBy: req.query.sortBy || "createdAt",
    sortOrder: req.query.sortOrder || "desc",
  };

  const result = await ProductService.getProducts(options, {
    page: options.page,
    limit: options.limit,
  });
  return ResponseUtil.success(res, result, "Lấy danh sách sản phẩm thành công");
});

// Lấy sản phẩm theo category (có phân trang)
export const getProductsByCategory = asyncHandler(async (req, res) => {
  const categoryId = req.params.categoryId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const excludeId = req.query.exclude; // ID sản phẩm cần loại trừ (cho related products)

  // Validate categoryId
  if (!categoryId || !ValidationUtil.isValidObjectId(categoryId)) {
    return ResponseUtil.validationError(res, ["Category ID không hợp lệ"]);
  }

  // Prepare options for ProductService
  const options = {
    page,
    limit,
    categoryId,
    excludeId,
  };

  const result = await ProductService.getProductsByCategory(
    categoryId,
    options
  );

  return ResponseUtil.success(
    res,
    result,
    "Lấy sản phẩm theo danh mục thành công"
  );
});

// Lấy sản phẩm theo ID
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ID
  if (!ValidationUtil.isValidObjectId(id)) {
    return ResponseUtil.validationError(res, ["ID sản phẩm không hợp lệ"]);
  }

  const product = await ProductService.getProductById(id);
  return ResponseUtil.success(
    res,
    product,
    "Lấy thông tin sản phẩm thành công"
  );
});

// Thêm sản phẩm
export const createProduct = asyncHandler(async (req, res) => {
  // Validate required fields
  const requiredFields = ["name", "sku", "category_id", "price"];
  const errors = [];

  for (const field of requiredFields) {
    if (!req.body[field]) {
      errors.push(`${field} là bắt buộc`);
    }
  }

  // Validate category_id
  if (
    req.body.category_id &&
    !ValidationUtil.isValidObjectId(req.body.category_id)
  ) {
    errors.push("Category ID không hợp lệ");
  }

  // Validate price
  if (req.body.price && (isNaN(req.body.price) || req.body.price < 0)) {
    errors.push("Giá sản phẩm phải là số dương");
  }

  // Validate stock
  if (req.body.stock && (isNaN(req.body.stock) || req.body.stock < 0)) {
    errors.push("Số lượng tồn kho phải là số không âm");
  }

  if (errors.length > 0) {
    return ResponseUtil.validationError(res, errors);
  }

  const newProduct = new Product(req.body);
  const savedProduct = await newProduct.save();

  return ResponseUtil.success(
    res,
    savedProduct,
    "Tạo sản phẩm thành công",
    201
  );
});

// Cập nhật sản phẩm
export const updateProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const updateData = req.body;

  // Validate ID
  if (!ValidationUtil.isValidObjectId(productId)) {
    return ResponseUtil.validationError(res, ["ID sản phẩm không hợp lệ"]);
  }

  // Validate data
  const errors = [];

  if (
    updateData.category_id &&
    !ValidationUtil.isValidObjectId(updateData.category_id)
  ) {
    errors.push("Category ID không hợp lệ");
  }

  if (updateData.price && (isNaN(updateData.price) || updateData.price < 0)) {
    errors.push("Giá sản phẩm phải là số dương");
  }

  if (updateData.stock && (isNaN(updateData.stock) || updateData.stock < 0)) {
    errors.push("Số lượng tồn kho phải là số không âm");
  }

  if (errors.length > 0) {
    return ResponseUtil.validationError(res, errors);
  }

  // Get current product to check if stock is being updated
  const currentProduct = await Product.findById(productId);
  if (!currentProduct) {
    return ResponseUtil.notFound(res, "Không tìm thấy sản phẩm");
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    updateData,
    { new: true, runValidators: true }
  );

  return ResponseUtil.success(
    res,
    updatedProduct,
    "Cập nhật sản phẩm thành công"
  );
});

// Xóa sản phẩm
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ID
  if (!ValidationUtil.isValidObjectId(id)) {
    return ResponseUtil.validationError(res, ["ID sản phẩm không hợp lệ"]);
  }

  const deletedProduct = await Product.findByIdAndDelete(id);
  if (!deletedProduct) {
    return ResponseUtil.notFound(res, "Không tìm thấy sản phẩm");
  }

  return ResponseUtil.success(res, { id }, "Xóa sản phẩm thành công");
});

// Tìm kiếm sản phẩm theo tên với filters nâng cao
export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query; // query parameter
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const categoryId = req.query.categoryId;
    const sortBy = req.query.sortBy || "relevance"; // relevance, price, name, createdAt
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    if (!q) {
      return res.status(400).json({
        message: "Query parameter 'q' is required",
      });
    }

    // Build search query - chỉ tìm theo tên
    let searchQuery = {
      name: { $regex: q, $options: "i" }
    };

    // Add category filter if specified
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      searchQuery.category_id = new mongoose.Types.ObjectId(categoryId);
    }

    // Build sort object
    let sortObj = {};
    if (sortBy === "relevance") {
      // Sort by name alphabetically for relevance
      sortObj = { name: 1 };
    } else {
      sortObj[sortBy] = sortOrder;
    }

    // Add timeout protection
    const queryOptions = {
      maxTimeMS: 5000, // 5 seconds timeout
    };

    const [products, total] = await Promise.all([
      Product.find(searchQuery, null, queryOptions)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .populate("category_id", "name slug")
        .lean(), // Use lean() for better performance
      Product.countDocuments(searchQuery, queryOptions),
    ]);

    res.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      query: q,
      categoryId,
      sortBy,
      sortOrder: sortOrder === 1 ? "asc" : "desc",
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Lấy sản phẩm nổi bật (featured products)
export const getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    // Featured products: high rating, good sales, or recently added
    const products = await Product.find({
      $or: [
        { sold: { $gte: 10 } }, // Products with good sales
        { rating: { $gte: "4" } }, // High rated products
        { discount_percent: { $gte: 20 } }, // Products on sale
      ],
    })
      .sort({ sold: -1, createdAt: -1 })
      .limit(limit)
      .populate("category_id", "name slug");

    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Lấy sản phẩm mới nhất
export const getNewestProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const products = await Product.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("category_id", "name slug");

    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Lấy sản phẩm bán chạy nhất
export const getBestSellingProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const products = await Product.find({ sold: { $gt: 0 } })
      .sort({ sold: -1 })
      .limit(limit)
      .populate("category_id", "name slug");

    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Lấy sản phẩm liên quan
export const getRelatedProducts = asyncHandler(async (req, res) => {
  const { productId } = req.params; // Sửa từ 'id' thành 'productId'
  const limit = parseInt(req.query.limit) || 4;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return ResponseUtil.error(res, "ID sản phẩm không hợp lệ", 400);
  }

  const relatedProducts = await ProductService.getRelatedProducts(productId, limit);
  return ResponseUtil.success(
    res,
    { products: relatedProducts },
    "Lấy sản phẩm liên quan thành công"
  );
});

// Lấy thống kê sản phẩm theo category
export const getProductStats = async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: "$category_id",
          totalProducts: { $sum: 1 },
          totalStock: { $sum: "$stock" },
          totalSold: { $sum: "$sold" },
          avgPrice: { $avg: "$price" },
          maxPrice: { $max: "$price" },
          minPrice: { $min: "$price" },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $project: {
          categoryName: "$category.name",
          categorySlug: "$category.slug",
          totalProducts: 1,
          totalStock: 1,
          totalSold: 1,
          avgPrice: { $round: ["$avgPrice", 2] },
          maxPrice: 1,
          minPrice: 1,
        },
      },
      {
        $sort: { totalProducts: -1 },
      },
    ]);

    res.json({ stats });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
