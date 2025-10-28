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
import { requireAdminAuth } from "../middleware/authMiddleware.js";

const productRouter = express.Router();

// ==== PRODUCT DISCOVERY - Public Routes ====
productRouter.get("/discovery/all", getProducts); // Lấy tất cả sản phẩm với filters
productRouter.get("/discovery/search", searchProducts); // Tìm kiếm sản phẩm
productRouter.get("/discovery/featured", getFeaturedProducts); // Sản phẩm nổi bật

// ==== PRODUCT COLLECTIONS - Public Routes ====
productRouter.get("/collections/new-arrivals", getNewestProducts); // Sản phẩm mới nhất
productRouter.get("/collections/best-sellers", getBestSellingProducts); // Bán chạy
productRouter.get("/collections/on-sale", getDiscountedProducts); // Giảm giá

// ==== PRODUCT ANALYTICS - Public Routes ====
productRouter.get("/analytics/stats", getProductStats); // Thống kê sản phẩm
productRouter.get("/analytics/related/:productId", getRelatedProducts); // Sản phẩm liên quan

// ==== PRODUCT CATEGORIES - Public Routes ====
productRouter.get("/collections/categories/:categoryId", getProductsByCategory); // Theo danh mục

// ==== INDIVIDUAL PRODUCTS - Public Routes ====
productRouter.get("/:id/details", getProductById); // Chi tiết sản phẩm

// ==== PRODUCT MANAGEMENT - Admin Only ====
productRouter.post("/management/create", requireAdminAuth, createProduct); // Tạo sản phẩm mới
productRouter.put("/management/:id", requireAdminAuth, updateProduct); // Cập nhật sản phẩm
productRouter.delete("/management/:id", requireAdminAuth, deleteProduct); // Xóa sản phẩm

export default productRouter;
