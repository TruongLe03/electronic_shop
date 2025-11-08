import express from "express";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
} from "../controllers/notification.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const notificationRouter = express.Router();

// Tất cả routes đều require authentication
notificationRouter.use(authMiddleware);

// Lấy danh sách thông báo
notificationRouter.get("/", getUserNotifications);

// Lấy số lượng thông báo chưa đọc
notificationRouter.get("/unread-count", getUnreadCount);

// Đánh dấu đã đọc một thông báo
notificationRouter.patch("/:id/read", markNotificationAsRead);

// Đánh dấu đã đọc tất cả
notificationRouter.patch("/read-all", markAllNotificationsAsRead);

// Xóa thông báo
notificationRouter.delete("/:id", deleteNotification);

export default notificationRouter;
