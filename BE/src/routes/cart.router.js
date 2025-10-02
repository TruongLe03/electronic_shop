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

// Lấy giỏ hàng của user hiện tại
cartRouter.get("/", getCart);

// Thêm sản phẩm vào giỏ
cartRouter.post("/add", addToCart);

// Cập nhật số lượng sản phẩm trong giỏ
cartRouter.put("/update", updateCartItem);

// Xóa sản phẩm khỏi giỏ
cartRouter.delete("/remove/:product_id", removeFromCart);

export default cartRouter;
