import NotificationService from "../services/notificationService.js";
import { ResponseUtil } from "../utils/response.util.js";
import { ValidationUtil } from "../utils/validation.util.js";
import asyncHandler from "express-async-handler";

// Lấy danh sách thông báo
export const getUserNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const result = await NotificationService.getUserNotifications(
    userId,
    page,
    limit,
    userRole
  );

  return ResponseUtil.success(
    res,
    result,
    "Lấy danh sách thông báo thành công"
  );
});

// Đánh dấu đã đọc một thông báo
export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!ValidationUtil.isValidObjectId(id)) {
    return ResponseUtil.validationError(res, ["ID thông báo không hợp lệ"]);
  }

  const notification = await NotificationService.markAsRead(id, userId);

  return ResponseUtil.success(
    res,
    notification,
    "Đã đánh dấu thông báo là đã đọc"
  );
});

// Đánh dấu đã đọc tất cả thông báo
export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await NotificationService.markAllAsRead(userId);

  return ResponseUtil.success(
    res,
    { modifiedCount: result.modifiedCount },
    "Đã đánh dấu tất cả thông báo là đã đọc"
  );
});

// Xóa thông báo
export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!ValidationUtil.isValidObjectId(id)) {
    return ResponseUtil.validationError(res, ["ID thông báo không hợp lệ"]);
  }

  await NotificationService.deleteNotification(id, userId);

  return ResponseUtil.success(res, null, "Xóa thông báo thành công");
});

// Lấy số lượng thông báo chưa đọc
export const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  const count = await NotificationService.getUnreadCount(userId, userRole);

  return ResponseUtil.success(
    res,
    { unreadCount: count },
    "Lấy số lượng thông báo chưa đọc thành công"
  );
});
