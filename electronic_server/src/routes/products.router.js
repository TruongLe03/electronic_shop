import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getDiscountedProducts,
} from "../controllers/products.controller.js";

const productRouter = express.Router();

productRouter.get("/", getProducts); // Lấy tất cả sản phẩm
productRouter.get("/discounted", getDiscountedProducts); // Lấy sản phẩm giảm giá > 40%
productRouter.get("/category/:categoryId", getProductsByCategory); // Lấy sản phẩm theo category
productRouter.get("/:id", getProductById); // Lấy 1 sản phẩm theo ID
productRouter.post("/", createProduct); // Thêm sản phẩm
productRouter.put("/:id", updateProduct); // Cập nhật sản phẩm
productRouter.delete("/:id", deleteProduct); // Xóa sản phẩm

export default productRouter;
