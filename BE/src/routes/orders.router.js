import express from "express";
import {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  getAllOrders,
  getOrderStats,
  cancelOrder,
  createOrderFromCart,
  createDirectOrder,
  updateOrderInfo,
  confirmPayment,
  getOrderStatistics
} from "../controllers/orders.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const ordersRouter = express.Router();

// ==== ORDER CREATION ====
ordersRouter.post("/create", createOrder); // Tạo đơn hàng mới
ordersRouter.post("/from-cart", authMiddleware, createOrderFromCart); // Từ giỏ hàng
ordersRouter.post("/direct", authMiddleware, createDirectOrder); // Mua ngay

// ==== USER ORDERS ====
ordersRouter.get("/my-orders", authMiddleware, getUserOrders); // Đơn hàng của tôi
ordersRouter.get("/my-orders/:orderId/details", getOrderById); // Chi tiết đơn hàng

// ==== ORDER MANAGEMENT ====
ordersRouter.put("/:id/info", authMiddleware, updateOrderInfo); // Cập nhật thông tin
ordersRouter.put("/:id/payment", authMiddleware, confirmPayment); // Xác nhận thanh toán
ordersRouter.patch("/my-orders/:orderId/cancel", authMiddleware, cancelOrder); // Hủy đơn hàng

// ==== ADMIN MANAGEMENT ====
ordersRouter.get("/management/all", authMiddleware, getAllOrders); // Tất cả đơn hàng (admin)
ordersRouter.patch("/management/:orderId/status", authMiddleware, updateOrderStatus); // Cập nhật trạng thái
ordersRouter.get("/admin/statistics", authMiddleware, getOrderStatistics); // Thống kê
ordersRouter.get("/admin/daily-stats", authMiddleware, getOrderStats); // Thống kê ngày

// ==== API TESTING ====
ordersRouter.get("/system/test", authMiddleware, (req, res) => {
  res.json({ success: true, message: "Orders API working", user: req.user });
});

export default ordersRouter;
