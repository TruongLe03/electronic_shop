import StockNotification from "../models/stockNotification.model.js";
import Product from "../models/products.model.js";
import User from "../models/user.model.js";

export class StockNotificationService {
  // Đăng ký thông báo khi có hàng
  static async subscribeToStockNotification(userId, productId, email, phone = null, quantityNeeded = 1) {
    // Kiểm tra product có tồn tại không
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Sản phẩm không tồn tại");
    }

    // Kiểm tra user có tồn tại không
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Người dùng không tồn tại");
    }

    // Kiểm tra xem đã đăng ký chưa
    const existingNotification = await StockNotification.findOne({
      user_id: userId,
      product_id: productId,
      status: "active"
    });

    if (existingNotification) {
      // Cập nhật thông tin nếu đã đăng ký
      existingNotification.email = email;
      existingNotification.phone = phone;
      existingNotification.quantity_needed = quantityNeeded;
      existingNotification.expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      return await existingNotification.save();
    }

    // Tạo đăng ký mới
    const notification = new StockNotification({
      user_id: userId,
      product_id: productId,
      email,
      phone,
      quantity_needed: quantityNeeded
    });

    return await notification.save();
  }

  // Hủy đăng ký thông báo
  static async unsubscribeFromStockNotification(userId, productId) {
    const notification = await StockNotification.findOne({
      user_id: userId,
      product_id: productId,
      status: "active"
    });

    if (!notification) {
      throw new Error("Không tìm thấy đăng ký thông báo");
    }

    notification.status = "cancelled";
    return await notification.save();
  }

  // Lấy danh sách đăng ký của user
  static async getUserNotifications(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      StockNotification.find({ user_id: userId })
        .populate("product_id", "name main_image price stock_quantity")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      StockNotification.countDocuments({ user_id: userId })
    ]);

    return {
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Kiểm tra và gửi thông báo khi có hàng (được gọi khi cập nhật stock)
  static async checkAndNotifyStockAvailable(productId, newQuantity) {
    const activeNotifications = await StockNotification.find({
      product_id: productId,
      status: "active"
    })
    .populate("user_id", "name email")
    .populate("product_id", "name main_image price")
    .sort({ createdAt: 1 }); // FIFO

    const notificationsToSend = [];
    let remainingStock = newQuantity;

    for (const notification of activeNotifications) {
      if (remainingStock >= notification.quantity_needed) {
        notificationsToSend.push(notification);
        remainingStock -= notification.quantity_needed;
        
        // Cập nhật trạng thái notification
        notification.status = "notified";
        notification.notified_at = new Date();
        await notification.save();
      }
    }

    // Gửi thông báo (có thể tích hợp email service, SMS, push notification)
    for (const notification of notificationsToSend) {
      await this.sendStockAvailableNotification(notification);
    }

    return notificationsToSend;
  }

  // Gửi thông báo có hàng
  static async sendStockAvailableNotification(notification) {
    const { user_id, product_id, email, phone, quantity_needed } = notification;
    
    console.log(`📧 Gửi thông báo có hàng:
      - Người dùng: ${user_id.name} (${email})
      - Sản phẩm: ${product_id.name}
      - Số lượng: ${quantity_needed}
      - Phone: ${phone || 'N/A'}
    `);

    // TODO: Tích hợp với email service (NodeMailer, SendGrid, etc.)
    // TODO: Tích hợp với SMS service nếu cần
    // TODO: Tích hợp với push notification service

    return true;
  }

  // Cleanup expired notifications
  static async cleanupExpiredNotifications() {
    const result = await StockNotification.deleteMany({
      expires_at: { $lt: new Date() },
      status: "active"
    });

    console.log(`🧹 Cleaned up ${result.deletedCount} expired stock notifications`);
    return result;
  }
}