import express from "express";
import { getUserOrders, getOrderDetail, cancelOrder } from "../controllers/order.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(authMiddleware);

router.get("/", getUserOrders);
router.get("/:orderId", getOrderDetail);
router.put("/:orderId/cancel", cancelOrder);

export default router;
