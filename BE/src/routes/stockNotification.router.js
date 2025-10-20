import express from "express";
import { 
  subscribeStockNotification,
  unsubscribeStockNotification, 
  getUserStockNotifications,
  triggerStockNotificationCheck
} from "../controllers/stockNotification.controller.js";
import { authMiddleware, requireAdminAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// ============= USER STOCK NOTIFICATIONS =============
// Đăng ký thông báo khi có hàng
router.post("/subscribe", authMiddleware, subscribeStockNotification);

// Hủy đăng ký thông báo 
router.delete("/unsubscribe/:productId", authMiddleware, unsubscribeStockNotification);

// Lấy danh sách đăng ký thông báo của user
router.get("/my-notifications", authMiddleware, getUserStockNotifications);

// ============= ADMIN STOCK NOTIFICATIONS =============
// Trigger manual check for stock notifications
router.post("/trigger/:productId", requireAdminAuth, triggerStockNotificationCheck);

export default router;