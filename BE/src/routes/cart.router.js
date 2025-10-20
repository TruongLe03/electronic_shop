import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} from "../controllers/cart.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const cartRouter = express.Router();

// ==== CART MANAGEMENT - Cần authentication ====
cartRouter.get("/items", authMiddleware, getCart); // Lấy giỏ hàng
cartRouter.post("/items/add", authMiddleware, addToCart); // Thêm sản phẩm vào giỏ
cartRouter.put("/update", authMiddleware, updateCartItem); // Cập nhật số lượng  
cartRouter.delete("/items/:product_id", authMiddleware, removeFromCart); // Xóa sản phẩm

export default cartRouter;
