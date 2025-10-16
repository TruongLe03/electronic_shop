import apiClient from "@/utils/axiosConfig";

export const orderService = {
  // Tạo đơn hàng mới
  async createOrder(orderData) {
    try {
      const response = await apiClient.post("/orders/create", orderData);
      return response.data;
    } catch (error) {
      console.error("Create order error:", error);
      throw error;
    }
  },

  // Test API connection
  async testAPI() {
    try {
      const response = await apiClient.get("/orders/test");
      return response.data;
    } catch (error) {
      console.error("Test API error:", error);
      throw error;
    }
  },

  // Lấy danh sách đơn hàng của user
  async getUserOrders() {
    try {
      console.log('Calling getUserOrders API...');
      const response = await apiClient.get("/orders/my-orders");
      console.log('getUserOrders response:', response);
      return response.data;
    } catch (error) {
      console.error("Get user orders error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      throw error;
    }
  },

  // Lấy chi tiết một đơn hàng
  async getOrderById(orderId) {
    try {
      const response = await apiClient.get(`/orders/my-orders/${orderId}/details`);
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
  async cancelOrder(orderId, reason = '') {
    try {
      const response = await apiClient.patch(`/orders/my-orders/${orderId}/cancel`, {
        reason: reason
      });
      return response.data;
    } catch (error) {
      console.error("Cancel order error:", error);
      throw error;
    }
  },

  // Tạo đơn hàng từ giỏ hàng
  async createOrderFromCart(orderData) {
    try {
      const response = await apiClient.post("/orders/from-cart", orderData);
      return response.data;
    } catch (error) {
      console.error("Create order from cart error:", error);
      // Cải thiện error handling - trả về thông tin chi tiết hơn
      if (error.response) {
        // Server responded with error status
        const errorData = error.response.data;
        throw {
          success: false,
          message: errorData.message || 'Có lỗi xảy ra khi tạo đơn hàng',
          status: error.response.status,
          data: errorData
        };
      } else if (error.request) {
        // Request was made but no response received
        throw {
          success: false,
          message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
          status: 0
        };
      } else {
        // Something else happened
        throw {
          success: false,
          message: error.message || 'Có lỗi không xác định xảy ra',
          status: 0
        };
      }
    }
  },

  // Cập nhật thông tin shipping và payment cho order
  async updateOrderInfo(orderId, updateData) {
    try {
      const response = await apiClient.put(`/orders/${orderId}/update-info`, updateData);
      return response.data;
    } catch (error) {
      console.error("Update order info error:", error);
      throw error;
    }
  },

  // Xác nhận thanh toán order
  async confirmPayment(orderId, paymentMethod) {
    try {
      const response = await apiClient.put(`/orders/${orderId}/confirm-payment`, {
        payment_method: paymentMethod
      });
      return response.data;
    } catch (error) {
      console.error("Confirm payment error:", error);
      throw error;
    }
  },

  // Tạo đơn hàng trực tiếp (mua ngay)
  async createDirectOrder(productInfo) {
    try {
      console.log("Creating direct order:", productInfo);
      const response = await apiClient.post("/orders/direct", productInfo);
      console.log("Direct order response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Create direct order error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      // Cải thiện error handling
      if (error.response) {
        const errorData = error.response.data;
        throw {
          success: false,
          message: errorData.message || 'Có lỗi xảy ra khi tạo đơn hàng',
          status: error.response.status,
          data: errorData
        };
      } else if (error.request) {
        throw {
          success: false,
          message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
          status: 0
        };
      } else {
        throw {
          success: false,
          message: error.message || 'Có lỗi không xác định xảy ra',
          status: 0
        };
      }
    }
  },

  // Kiểm tra trạng thái đơn hàng gần đây của user (để verify order creation)
  async getRecentOrdersByUser() {
    try {
      const response = await apiClient.get("/orders/my-orders?limit=5");
      return response.data;
    } catch (error) {
      console.error("Get recent orders error:", error);
      throw error;
    }
  }
};

export default orderService;