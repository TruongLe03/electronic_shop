import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} from "../controllers/cart.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Bảo vệ tất cả các routes với middleware xác thực
router.use(authMiddleware);

// Lấy giỏ hàng của user hiện tại
router.get("/", getCart);

// Thêm sản phẩm vào giỏ
router.post("/add", addToCart);

// Cập nhật số lượng sản phẩm trong giỏ
router.put("/update", updateCartItem);

// Xóa sản phẩm khỏi giỏ
router.delete("/remove/:product_id", removeFromCart);

export default router;
