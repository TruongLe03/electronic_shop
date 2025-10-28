import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cart.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const cartRouter = express.Router();

// ==== CART MANAGEMENT - Cần authentication ====
cartRouter.get("/items", authMiddleware, getCart); // Lấy giỏ hàng
cartRouter.post("/items/add", authMiddleware, addToCart); // Thêm sản phẩm vào giỏ
cartRouter.put("/items/update", authMiddleware, updateCartItem); // Cập nhật số lượng  
cartRouter.delete("/items/:product_id", authMiddleware, removeFromCart); // Xóa sản phẩm
cartRouter.delete("/items/clear", authMiddleware, clearCart); // Xóa toàn bộ giỏ hàng

export default cartRouter;
