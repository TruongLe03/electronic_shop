import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Lấy danh sách coupon công khai (còn hiệu lực)
// Yêu cầu đăng nhập để filter coupon theo user
export const getPublicCoupons = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/coupons/public`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching public coupons:", error);
    throw error.response?.data || error;
  }
};

// Validate coupon code
export const validateCoupon = async (code, orderAmount) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/coupons/validate`,
      { code, order_value: orderAmount },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error validating coupon:", error);
    throw error.response?.data || error;
  }
};

// ============= ADMIN APIs =============

// Tạo coupon mới (Admin)
export const createCoupon = async (couponData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${API_URL}/coupons`, couponData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating coupon:", error);
    throw error.response?.data || error;
  }
};

// Lấy tất cả coupons (Admin)
export const getAllCoupons = async (page = 1, limit = 10, filters = {}) => {
  try {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    const response = await axios.get(`${API_URL}/coupons?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all coupons:", error);
    throw error.response?.data || error;
  }
};

// Lấy chi tiết coupon (Admin)
export const getCouponById = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/coupons/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching coupon:", error);
    throw error.response?.data || error;
  }
};

// Cập nhật coupon (Admin)
export const updateCoupon = async (id, couponData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.put(`${API_URL}/coupons/${id}`, couponData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating coupon:", error);
    throw error.response?.data || error;
  }
};

// Xóa coupon (Admin)
export const deleteCoupon = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.delete(`${API_URL}/coupons/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting coupon:", error);
    throw error.response?.data || error;
  }
};

// Vô hiệu hóa coupon (Admin)
export const deactivateCoupon = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.patch(
      `${API_URL}/coupons/${id}/deactivate`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deactivating coupon:", error);
    throw error.response?.data || error;
  }
};

// Kích hoạt coupon (Admin)
export const activateCoupon = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.patch(
      `${API_URL}/coupons/${id}/activate`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error activating coupon:", error);
    throw error.response?.data || error;
  }
};

// Lấy thống kê coupon (Admin)
export const getCouponStats = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/coupons/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching coupon stats:", error);
    throw error.response?.data || error;
  }
};
