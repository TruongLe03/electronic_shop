import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} from "../controllers/cart.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const cartRouter = express.Router();

// Bảo vệ tất cả các routes với middleware xác thực
cartRouter.use(authMiddleware);

// ==== CART MANAGEMENT ====
cartRouter.get("/items", getCart); // Lấy giỏ hàng
cartRouter.post("/items/add", addToCart); // Thêm sản phẩm vào giỏ
cartRouter.put("/update", updateCartItem); // Cập nhật số lượng  
cartRouter.delete("/items/:product_id", removeFromCart); // Xóa sản phẩm

export default cartRouter;
