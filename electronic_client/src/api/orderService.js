import apiClient from "@/utils/axiosConfig";

export const orderService = {
  // Tạo đơn hàng mới
  async createOrder(orderData) {
    try {
      const response = await apiClient.post("/orders", orderData);
      return response.data;
    } catch (error) {
      console.error("Create order error:", error);
      throw error;
    }
  },

  // Lấy danh sách đơn hàng của user
  async getUserOrders() {
    try {
      const response = await apiClient.get("/orders/user");
      return response.data;
    } catch (error) {
      console.error("Get user orders error:", error);
      throw error;
    }
  },

  // Lấy chi tiết một đơn hàng
  async getOrderById(orderId) {
    try {
      const response = await apiClient.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error("Get order by ID error:", error);
      throw error;
    }
  },

  // Cập nhật trạng thái đơn hàng
  async updateOrderStatus(orderId, status) {
    try {
      const response = await apiClient.patch(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error("Update order status error:", error);
      throw error;
    }
  },

  // Hủy đơn hàng
  async cancelOrder(orderId) {
    try {
      const response = await apiClient.patch(`/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      console.error("Cancel order error:", error);
      throw error;
    }
  },

  // Tạo đơn hàng từ giỏ hàng
  async createOrderFromCart() {
    try {
      const response = await apiClient.post("/orders/from-cart");
      return response.data;
    } catch (error) {
      console.error("Create order from cart error:", error);
      throw error;
    }
  },

  // Tạo đơn hàng trực tiếp (mua ngay)
  async createDirectOrder(productId, quantity = 1) {
    try {
      console.log("Creating direct order:", { productId, quantity });
      const response = await apiClient.post("/orders/direct", {
        productId,
        quantity
      });
      console.log("Direct order response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Create direct order error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      throw error;
    }
  }
};

export default orderService;