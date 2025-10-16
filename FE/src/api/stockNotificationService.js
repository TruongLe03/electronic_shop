import axiosInstance from "../utils/axiosConfig";

// Đăng ký thông báo khi có hàng
export const subscribeStockNotification = async (productId, email, phone = null, quantity = 1) => {
  try {
    const response = await axiosInstance.post("/stock-notifications/subscribe", {
      productId,
      email, 
      phone,
      quantity
    });
    return response.data;
  } catch (error) {
    console.error("Error subscribing to stock notification:", error);
    throw error;
  }
};

// Hủy đăng ký thông báo
export const unsubscribeStockNotification = async (productId) => {
  try {
    const response = await axiosInstance.delete(`/stock-notifications/unsubscribe/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Error unsubscribing from stock notification:", error);
    throw error;
  }
};

// Lấy danh sách đăng ký thông báo của user
export const getUserStockNotifications = async (page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get("/stock-notifications/my-notifications", {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user stock notifications:", error);
    throw error;
  }
};

// Admin: Trigger manual stock notification check
export const triggerStockNotificationCheck = async (productId, newQuantity) => {
  try {
    const response = await axiosInstance.post(`/stock-notifications/trigger/${productId}`, {
      newQuantity
    });
    return response.data;
  } catch (error) {
    console.error("Error triggering stock notification check:", error);
    throw error;
  }
};