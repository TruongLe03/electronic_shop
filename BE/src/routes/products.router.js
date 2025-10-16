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

// ==== PRODUCT DISCOVERY ====
productRouter.get("/discovery/all", getProducts); // Lấy tất cả sản phẩm với filters
productRouter.get("/discovery/search", searchProducts); // Tìm kiếm sản phẩm
productRouter.get("/discovery/featured", getFeaturedProducts); // Sản phẩm nổi bật

// ==== PRODUCT COLLECTIONS ====
productRouter.get("/collections/new-arrivals", getNewestProducts); // Sản phẩm mới nhất
productRouter.get("/collections/best-sellers", getBestSellingProducts); // Bán chạy
productRouter.get("/collections/on-sale", getDiscountedProducts); // Giảm giá

// ==== PRODUCT ANALYTICS ====
productRouter.get("/analytics/stats", getProductStats); // Thống kê sản phẩm
productRouter.get("/analytics/related/:productId", getRelatedProducts); // Sản phẩm liên quan

// ==== PRODUCT CATEGORIES ====
productRouter.get("/collections/categories/:categoryId", getProductsByCategory); // Theo danh mục

// ==== INDIVIDUAL PRODUCTS ====
productRouter.get("/:id/details", getProductById); // Chi tiết sản phẩm

// ==== PRODUCT MANAGEMENT ====
productRouter.post("/management/create", createProduct); // Tạo sản phẩm mới
productRouter.put("/management/:id", updateProduct); // Cập nhật sản phẩm
productRouter.delete("/management/:id", deleteProduct); // Xóa sản phẩm

export default productRouter;
