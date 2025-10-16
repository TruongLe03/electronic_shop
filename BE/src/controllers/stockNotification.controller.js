import { StockNotificationService } from "../services/stockNotificationService.js";
import { ResponseUtil, asyncHandler } from "../utils/response.util.js";
import { ValidationUtil } from "../utils/validation.util.js";

// Đăng ký thông báo khi có hàng
export const subscribeStockNotification = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId, email, phone, quantity } = req.body;

  // Validate required fields
  if (!productId || !email) {
    return ResponseUtil.validationError(res, ["Product ID và email là bắt buộc"]);
  }

  if (!ValidationUtil.isValidObjectId(productId)) {
    return ResponseUtil.validationError(res, ["Product ID không hợp lệ"]);
  }

  if (!ValidationUtil.isValidEmail(email)) {
    return ResponseUtil.validationError(res, ["Email không hợp lệ"]);
  }

  const notification = await StockNotificationService.subscribeToStockNotification(
    userId, 
    productId, 
    email, 
    phone, 
    quantity || 1
  );

  return ResponseUtil.success(
    res, 
    notification, 
    "Đăng ký thông báo thành công. Chúng tôi sẽ thông báo khi sản phẩm có hàng trở lại.",
    201
  );
});

// Hủy đăng ký thông báo
export const unsubscribeStockNotification = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  if (!ValidationUtil.isValidObjectId(productId)) {
    return ResponseUtil.validationError(res, ["Product ID không hợp lệ"]);
  }

  const notification = await StockNotificationService.unsubscribeFromStockNotification(
    userId, 
    productId
  );

  return ResponseUtil.success(res, notification, "Hủy đăng ký thông báo thành công");
});

// Lấy danh sách đăng ký thông báo của user
export const getUserStockNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await StockNotificationService.getUserNotifications(userId, page, limit);

  return ResponseUtil.paginated(
    res,
    result.notifications,
    {
      page: result.page,
      limit,
      total: result.total,
      totalPages: result.totalPages
    },
    "Lấy danh sách đăng ký thông báo thành công"
  );
});

// Admin: Manual trigger stock notification check
export const triggerStockNotificationCheck = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { newQuantity } = req.body;

  if (!ValidationUtil.isValidObjectId(productId)) {
    return ResponseUtil.validationError(res, ["Product ID không hợp lệ"]);
  }

  if (!newQuantity || newQuantity < 0) {
    return ResponseUtil.validationError(res, ["Số lượng không hợp lệ"]);
  }

  const notificationsSent = await StockNotificationService.checkAndNotifyStockAvailable(
    productId, 
    newQuantity
  );

  return ResponseUtil.success(
    res, 
    { notificationsSent: notificationsSent.length, notifications: notificationsSent }, 
    `Đã gửi ${notificationsSent.length} thông báo có hàng`
  );
});