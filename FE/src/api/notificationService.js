import axios from "../utils/axiosConfig";

const notificationService = {
  // Lấy danh sách thông báo
  async getNotifications(page = 1, limit = 20) {
    try {
      const response = await axios.get("/notifications", {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Get notifications error:", error);
      throw error;
    }
  },

  // Lấy số lượng thông báo chưa đọc
  async getUnreadCount() {
    try {
      const response = await axios.get("/notifications/unread-count");
      return response.data;
    } catch (error) {
      console.error("Get unread count error:", error);
      throw error;
    }
  },

  // Đánh dấu đã đọc một thông báo
  async markAsRead(notificationId) {
    try {
      const response = await axios.patch(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error("Mark as read error:", error);
      throw error;
    }
  },

  // Đánh dấu đã đọc tất cả thông báo
  async markAllAsRead() {
    try {
      const response = await axios.patch("/notifications/read-all");
      return response.data;
    } catch (error) {
      console.error("Mark all as read error:", error);
      throw error;
    }
  },

  // Xóa thông báo
  async deleteNotification(notificationId) {
    try {
      const response = await axios.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error("Delete notification error:", error);
      throw error;
    }
  },
};

export default notificationService;
