import axiosInstance from "../../utils/axiosConfig";

// ============= REPORT & ANALYTICS =============

// Lấy thống kê doanh thu
export const getRevenueStats = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/admin/reports/revenue", { params });
    return response.data;
  } catch (error) {
    console.error("Get revenue stats error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Lấy báo cáo doanh thu theo tháng
export const getMonthlyRevenue = async (year) => {
  try {
    const response = await axiosInstance.get(`/admin/reports/monthly-revenue`, {
      params: { year }
    });
    return response.data;
  } catch (error) {
    console.error("Get monthly revenue error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Lấy sản phẩm bán chạy
export const getTopProducts = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/admin/reports/top-products", { params });
    return response.data;
  } catch (error) {
    console.error("Get top products error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Lấy báo cáo khách hàng
export const getCustomerReports = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/admin/reports/customers", { params });
    return response.data;
  } catch (error) {
    console.error("Get customer reports error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Xuất báo cáo
export const exportReport = async (type, params = {}) => {
  try {
    const response = await axiosInstance.get(`/admin/reports/export/${type}`, {
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error("Export report error:", error);
    throw error.response ? error.response.data : error;
  }
};