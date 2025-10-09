import { ProductService } from "../services/productService.js";
import { ResponseUtil, asyncHandler } from "../utils/response.util.js";
import { ValidationUtil } from "../utils/validation.util.js";
import Product from "../models/products.model.js";
import mongoose from "mongoose";

// Lấy sản phẩm có discount lớn hơn 40%
export const getDiscountedProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  
  const result = await ProductService.getDiscountedProducts(40, page, limit);
  return ResponseUtil.success(res, result, 'Lấy sản phẩm khuyến mãi thành công');
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
    inStock: req.query.inStock === 'true',
    onSale: req.query.onSale === 'true',
    search: req.query.search,
    sortBy: req.query.sortBy || 'createdAt',
    sortOrder: req.query.sortOrder || 'desc'
  };

  const result = await ProductService.getProducts(options, { page: options.page, limit: options.limit });
  return ResponseUtil.success(res, result, 'Lấy danh sách sản phẩm thành công');
});

// Lấy sản phẩm theo category (có phân trang)
export const getProductsByCategory = asyncHandler(async (req, res) => {
  const categoryId = req.params.categoryId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const excludeId = req.query.exclude; // ID sản phẩm cần loại trừ (cho related products)

  // Validate categoryId
  if (!categoryId || !ValidationUtil.isValidObjectId(categoryId)) {
    return ResponseUtil.validationError(res, ['Category ID không hợp lệ']);
  }

  // Prepare options for ProductService
  const options = {
    page,
    limit,
    categoryId,
    excludeId
  };

  const result = await ProductService.getProductsByCategory(categoryId, options);
  
  return ResponseUtil.success(res, result, 'Lấy sản phẩm theo danh mục thành công');
});

// Lấy sản phẩm theo ID
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ID
  if (!ValidationUtil.isValidObjectId(id)) {
    return ResponseUtil.validationError(res, ['ID sản phẩm không hợp lệ']);
  }

  const product = await ProductService.getProductById(id);
  return ResponseUtil.success(res, product, 'Lấy thông tin sản phẩm thành công');
});

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
    const productId = req.params.id;
    const updateData = req.body;
    
    // Get current product to check if stock is being updated
    const currentProduct = await Product.findById(productId);
    if (!currentProduct) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true }
    );
    
    // If stock is being updated, sync with inventory
    if (updateData.stock !== undefined && updateData.stock !== currentProduct.stock) {
      try {
        let inventory = await Inventory.findOne({ productId: productId });
        
        if (inventory) {
          // Update existing inventory
          const oldQuantity = inventory.quantity;
          inventory.quantity = updateData.stock;
          
          // Add stock movement to track this change
          inventory.stockMovements.push({
            type: 'ADJUSTMENT',
            quantity: updateData.stock,
            reason: `Stock updated from Product admin panel (was ${oldQuantity})`,
            reference: `PRODUCT_UPDATE_${Date.now()}`,
            createdBy: req.user?.id || null,
            createdAt: new Date()
          });
          
          await inventory.save();
          console.log(`📦 Synced inventory for product ${updatedProduct.name}: ${oldQuantity} → ${updateData.stock}`);
        } else {
          // Create new inventory if doesn't exist
          inventory = new Inventory({
            productId: productId,
            quantity: updateData.stock || 0,
            reservedQuantity: 0,
            minStockLevel: 10,
            maxStockLevel: 1000,
            reorderPoint: 20,
            cost: updatedProduct.price * 0.7, // Assume 70% of selling price
            location: {
              warehouse: 'Main Warehouse',
              zone: 'A',
              shelf: '001'
            },
            stockMovements: [{
              type: 'IN',
              quantity: updateData.stock || 0,
              reason: 'Initial inventory created from Product update',
              reference: `PRODUCT_CREATE_${Date.now()}`,
              createdBy: req.user?.id || null,
              createdAt: new Date()
            }],
            isActive: true
          });
          
          await inventory.save();
          console.log(`🆕 Created inventory for product ${updatedProduct.name}: ${updateData.stock} units`);
        }
      } catch (inventoryError) {
        console.error('⚠️  Failed to sync inventory:', inventoryError);
        // Don't fail the product update if inventory sync fails
      }
    }
    
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

// Tìm kiếm sản phẩm theo tên với filters nâng cao
export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query; // query parameter
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const categoryId = req.query.categoryId;
    const sortBy = req.query.sortBy || 'relevance'; // relevance, price, name, createdAt
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    if (!q) {
      return res.status(400).json({ 
        message: "Query parameter 'q' is required" 
      });
    }

    // Build search query
    let searchQuery = {
      $or: [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { tags: { $in: [new RegExp(q, "i")] } },
        { sku: { $regex: q, $options: "i" } }
      ],
    };

    // Add category filter if specified
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      searchQuery.category_id = new mongoose.Types.ObjectId(categoryId);
    }

    // Build sort object
    let sortObj = {};
    if (sortBy === 'relevance') {
      // Sort by text score for relevance (simplified)
      sortObj = { name: 1 }; // Fallback sort
    } else {
      sortObj[sortBy] = sortOrder;
    }

    const [products, total] = await Promise.all([
      Product.find(searchQuery)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .populate("category_id", "name slug"),
      Product.countDocuments(searchQuery),
    ]);

    res.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      query: q,
      categoryId,
      sortBy,
      sortOrder: sortOrder === 1 ? 'asc' : 'desc'
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
        { discount_percent: { $gte: 20 } } // Products on sale
      ]
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
  const { id } = req.params;
  const limit = parseInt(req.query.limit) || 4;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return ResponseUtil.error(res, "ID sản phẩm không hợp lệ", 400);
  }

  const relatedProducts = await ProductService.getRelatedProducts(id, limit);
  return ResponseUtil.success(res, { products: relatedProducts }, "Lấy sản phẩm liên quan thành công");
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
          minPrice: { $min: "$price" }
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category"
        }
      },
      {
        $unwind: "$category"
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
          minPrice: 1
        }
      },
      {
        $sort: { totalProducts: -1 }
      }
    ]);

    res.json({ stats });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
