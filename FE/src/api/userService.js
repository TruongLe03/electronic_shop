import axiosInstance from "../utils/axiosConfig";

export const userService = {
  // Lấy thông tin profile
  getProfile: async () => {
    try {
      const response = await axiosInstance.get("/users/profile");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật profile
  updateProfile: async (profileData) => {
    try {
      const response = await axiosInstance.put("/users/profile", profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Đổi mật khẩu
  changePassword: async (passwordData) => {
    try {
      console.log('Sending change password request with data:', passwordData);
      console.log('Token from localStorage:', localStorage.getItem('token') ? 'exists' : 'missing');
      
      const response = await axiosInstance.put("/users/password/change", passwordData);
      return response.data;
    } catch (error) {
      console.error('Change password API error:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  },

  // Upload avatar
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await axiosInstance.post("/users/upload-avatar", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy danh sách đơn hàng
  getOrders: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await axiosInstance.get(`/orders?${params}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy chi tiết đơn hàng
  getOrderDetail: async (orderId) => {
    try {
      const response = await axiosInstance.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Hủy đơn hàng
  cancelOrder: async (orderId) => {
    try {
      const response = await axiosInstance.put(`/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy danh sách địa chỉ
  getAddresses: async () => {
    try {
      const response = await axiosInstance.get("/users/addresses");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Thêm địa chỉ mới
  addAddress: async (addressData) => {
    try {
      const response = await axiosInstance.post("/users/addresses", addressData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật địa chỉ
  updateAddress: async (addressId, addressData) => {
    try {
      const response = await axiosInstance.put(`/users/addresses/${addressId}`, addressData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Xóa địa chỉ
  deleteAddress: async (addressId) => {
    try {
      const response = await axiosInstance.delete(`/users/addresses/${addressId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Đặt địa chỉ làm mặc định
  setDefaultAddress: async (addressId) => {
    try {
      const response = await axiosInstance.patch(`/users/addresses/${addressId}/default`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy thông báo
  getNotifications: async () => {
    try {
      const response = await axiosInstance.get("/users/notifications");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Đánh dấu đã đọc thông báo
  markNotificationAsRead: async (notificationId) => {
    try {
      const response = await axiosInstance.put(`/users/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Xóa thông báo
  deleteNotification: async (notificationId) => {
    try {
      const response = await axiosInstance.delete(`/users/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
