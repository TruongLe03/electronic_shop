import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getDiscountedProducts,
  searchProducts,
  getFeaturedProducts,
  getNewestProducts,
  getBestSellingProducts,
  getRelatedProducts,
  getProductStats,
} from "../controllers/products.controller.js";

const productRouter = express.Router();

// GET routes - specific routes first, general routes last
productRouter.get("/search", searchProducts); // Tìm kiếm sản phẩm
productRouter.get("/discounted", getDiscountedProducts); // Lấy sản phẩm giảm giá > 40%
productRouter.get("/featured", getFeaturedProducts); // Lấy sản phẩm nổi bật
productRouter.get("/newest", getNewestProducts); // Lấy sản phẩm mới nhất
productRouter.get("/best-selling", getBestSellingProducts); // Lấy sản phẩm bán chạy
productRouter.get("/stats", getProductStats); // Thống kê sản phẩm theo category
productRouter.get("/category/:categoryId", getProductsByCategory); // Lấy sản phẩm theo category
productRouter.get("/:id/related", getRelatedProducts); // Lấy sản phẩm liên quan
productRouter.get("/:id", getProductById); // Lấy 1 sản phẩm theo ID
productRouter.get("/", getProducts); // Lấy tất cả sản phẩm với filters

// POST routes
productRouter.post("/", createProduct); // Thêm sản phẩm

// PUT routes
productRouter.put("/:id", updateProduct); // Cập nhật sản phẩm

// DELETE routes
productRouter.delete("/:id", deleteProduct); // Xóa sản phẩm

export default productRouter;
