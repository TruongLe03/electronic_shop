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
import authMiddleware, { requireAdminAuth, requireOwner } from "../middleware/authMiddleware.js";

const ordersRouter = express.Router();

// ==== ORDER CREATION ====
ordersRouter.post("/create", createOrder); // Tạo đơn hàng mới (public - guest order)
ordersRouter.post("/from-cart", authMiddleware, createOrderFromCart); // Từ giỏ hàng
ordersRouter.post("/direct", authMiddleware, createDirectOrder); // Mua ngay

// ==== USER ORDERS ====
ordersRouter.get("/my-orders", authMiddleware, getUserOrders); // Đơn hàng của tôi
ordersRouter.get("/my-orders/:orderId/details", authMiddleware, getOrderById); // Chi tiết đơn hàng

// ==== ORDER MANAGEMENT ====
ordersRouter.put("/:id/info", authMiddleware, updateOrderInfo); // Cập nhật thông tin
ordersRouter.put("/:id/payment", authMiddleware, confirmPayment); // Xác nhận thanh toán
ordersRouter.patch("/my-orders/:orderId/cancel", authMiddleware, cancelOrder); // Hủy đơn hàng

// ==== ADMIN MANAGEMENT ====
ordersRouter.get("/management/all", requireAdminAuth, getAllOrders); // Tất cả đơn hàng (admin)
ordersRouter.get("/management/:orderId", requireAdminAuth, getOrderById); // Chi tiết đơn hàng (admin)
ordersRouter.patch("/management/:orderId/status", requireAdminAuth, updateOrderStatus); // Cập nhật trạng thái
ordersRouter.get("/admin/statistics", requireAdminAuth, getOrderStatistics); // Thống kê
ordersRouter.get("/admin/daily-stats", requireAdminAuth, getOrderStats); // Thống kê ngày

// ==== API TESTING ====
ordersRouter.get("/system/test", authMiddleware, (req, res) => {
  res.json({ success: true, message: "Orders API working", user: req.user });
});

export default ordersRouter;
