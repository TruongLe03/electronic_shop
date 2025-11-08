import Notification from "../models/notification.model.js";

class NotificationService {
  // Tạo thông báo mới
  static async createNotification(data) {
    const { userId, type, title, message, orderId, metadata = {} } = data;

    const notification = new Notification({
      user_id: userId,
      type,
      title,
      message,
      order_id: orderId || null,
      metadata,
      is_read: false,
    });

    await notification.save();
    return notification;
  }

  // Lấy danh sách thông báo của user
  static async getUserNotifications(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ user_id: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("order_id", "orderId status total")
        .lean(),
      Notification.countDocuments({ user_id: userId }),
      Notification.countDocuments({ user_id: userId, is_read: false }),
    ]);

    return {
      notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      unreadCount,
    };
  }

  // Đánh dấu đã đọc một thông báo
  static async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user_id: userId },
      { is_read: true },
      { new: true }
    );

    if (!notification) {
      throw new Error("Không tìm thấy thông báo");
    }

    return notification;
  }

  // Đánh dấu đã đọc tất cả thông báo
  static async markAllAsRead(userId) {
    const result = await Notification.updateMany(
      { user_id: userId, is_read: false },
      { is_read: true }
    );

    return result;
  }

  // Xóa thông báo
  static async deleteNotification(notificationId, userId) {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user_id: userId,
    });

    if (!notification) {
      throw new Error("Không tìm thấy thông báo");
    }

    return notification;
  }

  // Lấy số lượng thông báo chưa đọc
  static async getUnreadCount(userId) {
    const count = await Notification.countDocuments({
      user_id: userId,
      is_read: false,
    });
    return count;
  }

  // Helper: Tạo thông báo cho đơn hàng
  static async createOrderNotification(userId, orderId, type, orderData = {}) {
    const notificationConfigs = {
      order_created: {
        title: "Đơn hàng đã được tạo",
        message: `Đơn hàng #${
          orderData.orderId
        } của bạn đã được tạo thành công. Tổng giá trị: ${this.formatPrice(
          orderData.total
        )}`,
      },
      order_confirmed: {
        title: "Đơn hàng đã được xác nhận",
        message: `Đơn hàng #${orderData.orderId} đã được xác nhận và đang được xử lý`,
      },
      order_processing: {
        title: "Đơn hàng đang được chuẩn bị",
        message: `Đơn hàng #${orderData.orderId} đang được chuẩn bị và sẽ sớm được giao`,
      },
      order_shipping: {
        title: "Đơn hàng đang được giao",
        message: `Đơn hàng #${orderData.orderId} đang trên đường giao đến bạn`,
      },
      order_delivered: {
        title: "Đơn hàng đã giao thành công",
        message: `Đơn hàng #${orderData.orderId} đã được giao thành công. Cảm ơn bạn đã mua hàng!`,
      },
      order_cancelled: {
        title: "Đơn hàng đã bị hủy",
        message: `Đơn hàng #${orderData.orderId} đã bị hủy. ${
          orderData.cancelReason || ""
        }`,
      },
      payment_success: {
        title: "Thanh toán thành công",
        message: `Thanh toán cho đơn hàng #${orderData.orderId} đã được xác nhận thành công`,
      },
      payment_failed: {
        title: "Thanh toán thất bại",
        message: `Thanh toán cho đơn hàng #${orderData.orderId} không thành công. Vui lòng thử lại`,
      },
    };

    const config = notificationConfigs[type];
    if (!config) {
      throw new Error(`Invalid notification type: ${type}`);
    }

    return await this.createNotification({
      userId,
      type,
      title: config.title,
      message: config.message,
      orderId,
      metadata: orderData,
    });
  }

  // Helper: Format giá
  static formatPrice(price) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  }

  // Tạo thông báo cho tất cả admin
  static async createAdminNotification(orderId, type, orderData = {}) {
    // Import User model ở đây để tránh circular dependency
    const User = (await import("../models/user.model.js")).default;

    // Lấy tất cả admin users
    const adminUsers = await User.find({ role: "admin" }).select("_id");

    const notificationConfigs = {
      order_created: {
        title: "Đơn hàng mới",
        message: `Khách hàng ${
          orderData.customerName || "Ẩn danh"
        } vừa đặt đơn hàng #${orderData.orderId}. Giá trị: ${this.formatPrice(
          orderData.total
        )}`,
      },
      order_confirmed: {
        title: "Đơn hàng đã xác nhận",
        message: `Đơn hàng #${orderData.orderId} của ${
          orderData.customerName || "khách hàng"
        } đã được xác nhận`,
      },
      order_cancelled: {
        title: "Đơn hàng đã hủy",
        message: `Đơn hàng #${orderData.orderId} của ${
          orderData.customerName || "khách hàng"
        } đã bị hủy ${
          orderData.cancelledBy ? `bởi ${orderData.cancelledBy}` : ""
        }`,
      },
      payment_success: {
        title: "Thanh toán thành công",
        message: `${
          orderData.customerName || "Khách hàng"
        } đã thanh toán thành công đơn hàng #${
          orderData.orderId
        }. Số tiền: ${this.formatPrice(orderData.total)}`,
      },
    };

    const config = notificationConfigs[type];
    if (!config) {
      return; // Không tạo thông báo admin cho các loại khác
    }

    // Tạo thông báo cho từng admin
    const notifications = await Promise.all(
      adminUsers.map((admin) =>
        this.createNotification({
          userId: admin._id,
          type,
          title: config.title,
          message: config.message,
          orderId,
          metadata: orderData,
        })
      )
    );

    return notifications;
  }
}

export default NotificationService;
