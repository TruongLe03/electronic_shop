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
  static async getUserNotifications(userId, page = 1, limit = 20, userRole = null) {
    const skip = (page - 1) * limit;

    // Admin lấy tất cả thông báo, user thường chỉ lấy của mình
    let query = {};
    if (userRole === "admin") {
      // Admin: Lấy tất cả thông báo
      query = {};
    } else {
      // User thường: Chỉ lấy thông báo của mình
      query = { user_id: userId };
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("order_id", "orderId status total")
        .populate("user_id", "username email") // Populate để hiển thị tên user
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ ...query, is_read: false }),
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
  static async getUnreadCount(userId, userRole = null) {
    let query = { is_read: false };
    
    if (userRole !== "admin") {
      // User thường chỉ đếm thông báo của mình
      query.user_id = userId;
    }
    // Admin: Đếm tất cả thông báo chưa đọc
    
    const count = await Notification.countDocuments(query);
    return count;
  }

  // Helper: Tạo thông báo cho đơn hàng
  static async createOrderNotification(userId, orderId, type, orderData = {}) {
    // Kiểm tra xem đã có thông báo tương tự chưa (trong vòng 1 phút gần đây)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const existingNotification = await Notification.findOne({
      user_id: userId,
      order_id: orderId,
      type,
      createdAt: { $gte: oneMinuteAgo },
    });

    if (existingNotification) {
      console.log(
        `⚠️ Notification already exists for user ${userId}, order ${orderId}, type ${type}`
      );
      return existingNotification;
    }

    const notificationConfigs = {
      order_created: {
        title: "🎉 Đặt hàng thành công",
        message: `Bạn vừa đặt đơn hàng #${
          orderData.orderId
        } thành công. Tổng giá trị: ${this.formatPrice(
          orderData.total
        )}. Chúng tôi sẽ xác nhận và xử lý đơn hàng của bạn trong thời gian sớm nhất.`,
      },
      order_confirmed: {
        title: "✅ Đơn hàng đã xác nhận",
        message: `Đơn hàng #${orderData.orderId} của bạn đã được xác nhận và đang trong quá trình chuẩn bị hàng`,
      },
      order_processing: {
        title: "📦 Đang chuẩn bị hàng",
        message: `Đơn hàng #${orderData.orderId} của bạn đang được đóng gói và chuẩn bị giao đến bạn`,
      },
      order_shipping: {
        title: "🚚 Đơn hàng đang giao",
        message: `Đơn hàng #${orderData.orderId} của bạn đang trên đường giao đến địa chỉ của bạn`,
      },
      order_delivered: {
        title: "🎊 Giao hàng thành công",
        message: `Đơn hàng #${orderData.orderId} đã được giao thành công đến bạn. Cảm ơn bạn đã tin tưởng và mua hàng!`,
      },
      order_cancelled: {
        title: "❌ Đơn hàng đã hủy",
        message: `Đơn hàng #${orderData.orderId} của bạn đã bị hủy. ${
          orderData.cancelReason ? `Lý do: ${orderData.cancelReason}` : ""
        }`,
      },
      payment_success: {
        title: "💳 Thanh toán thành công",
        message: `Bạn đã thanh toán thành công đơn hàng #${orderData.orderId}. Chúng tôi đang xử lý đơn hàng của bạn.`,
      },
      payment_failed: {
        title: "⚠️ Thanh toán thất bại",
        message: `Thanh toán cho đơn hàng #${orderData.orderId} không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.`,
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

    if (adminUsers.length === 0) {
      console.log("⚠️ No admin users found to send notification");
      return [];
    }

    const notificationConfigs = {
      order_created: {
        title: "🔔 Đơn hàng mới từ khách",
        message: `Khách hàng "${
          orderData.customerName || "Ẩn danh"
        }" vừa đặt đơn hàng #${orderData.orderId}. Giá trị: ${this.formatPrice(
          orderData.total
        )}. Vui lòng xác nhận và xử lý đơn hàng.`,
      },
      order_confirmed: {
        title: "✅ Đã xác nhận đơn hàng",
        message: `Đơn hàng #${orderData.orderId} của khách hàng "${
          orderData.customerName || "Ẩn danh"
        }" đã được xác nhận thành công`,
      },
      order_cancelled: {
        title: "❌ Đơn hàng bị hủy",
        message: `Đơn hàng #${orderData.orderId} của khách hàng "${
          orderData.customerName || "Ẩn danh"
        }" đã bị hủy ${
          orderData.cancelledBy ? `bởi ${orderData.cancelledBy}` : ""
        }`,
      },
      payment_success: {
        title: "💰 Thanh toán mới",
        message: `Khách hàng "${
          orderData.customerName || "Ẩn danh"
        }" đã thanh toán thành công đơn hàng #${
          orderData.orderId
        }. Số tiền: ${this.formatPrice(orderData.total)}`,
      },
    };

    const config = notificationConfigs[type];
    if (!config) {
      return []; // Không tạo thông báo admin cho các loại khác
    }

    // Kiểm tra xem đã có thông báo cho admin chưa (trong vòng 1 phút gần đây)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    
    // Tạo thông báo cho từng admin
    const notifications = [];
    for (const admin of adminUsers) {
      // Kiểm tra thông báo đã tồn tại
      const existingNotification = await Notification.findOne({
        user_id: admin._id,
        order_id: orderId,
        type,
        createdAt: { $gte: oneMinuteAgo },
      });

      if (existingNotification) {
        console.log(
          `⚠️ Admin notification already exists for admin ${admin._id}, order ${orderId}, type ${type}`
        );
        notifications.push(existingNotification);
      } else {
        const notification = await this.createNotification({
          userId: admin._id,
          type,
          title: config.title,
          message: config.message,
          orderId,
          metadata: orderData,
        });
        notifications.push(notification);
      }
    }

    return notifications;
  }
}

export default NotificationService;
