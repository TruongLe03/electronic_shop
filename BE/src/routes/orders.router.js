import express from "express";
import {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  cancelOrder,
  getOrderStatistics,
  createOrderFromCart,
  createDirectOrder,
  updateOrderInfo,
  confirmPayment,
} from "../controllers/orders.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const ordersRouter = express.Router();

// Protected routes (require authentication) - PUT THESE FIRST
ordersRouter.get("/test", authMiddleware, (req, res) => {
  res.json({ success: true, message: "Orders API working", user: req.user });
});
ordersRouter.get("/user", authMiddleware, getUserOrders);
ordersRouter.put("/:id/update-info", authMiddleware, updateOrderInfo);
ordersRouter.put("/:id/confirm-payment", authMiddleware, confirmPayment);
ordersRouter.patch("/:orderId/cancel", authMiddleware, cancelOrder);

// Public routes - PUT DYNAMIC ROUTES LAST
ordersRouter.post("/", createOrder);
ordersRouter.post("/from-cart", authMiddleware, createOrderFromCart);
ordersRouter.post("/direct", authMiddleware, createDirectOrder);
ordersRouter.get("/:orderId", getOrderById); // This should be LAST among GET routes

// Admin routes
ordersRouter.put("/:orderId/status", authMiddleware, updateOrderStatus);
ordersRouter.get("/admin/statistics", authMiddleware, getOrderStatistics);

export default ordersRouter;
