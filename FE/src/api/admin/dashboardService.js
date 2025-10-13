import axiosInstance from "../../utils/axiosConfig";

// ============= DASHBOARD ANALYTICS =============

// Lấy thống kê tổng quan cho dashboard
export const getDashboardStats = async () => {
  try {
    const response = await axiosInstance.get("/admin/dashboard/stats");
    return response.data;
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Lấy hoạt động gần đây
export const getRecentActivities = async (limit = 10) => {
  try {
    const response = await axiosInstance.get("/admin/dashboard/activities", {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error("Get recent activities error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Lấy dữ liệu biểu đồ doanh thu
export const getRevenueChartData = async (period = "month") => {
  try {
    const response = await axiosInstance.get("/admin/dashboard/revenue-chart", {
      params: { period },
    });
    return response.data;
  } catch (error) {
    console.error("Get revenue chart data error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Lấy sản phẩm bán chạy cho dashboard
export const getDashboardTopProducts = async (limit = 5) => {
  try {
    const response = await axiosInstance.get("/admin/dashboard/top-products", {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error("Get top products error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Lấy thống kê tăng trưởng
export const getGrowthAnalytics = async () => {
  try {
    const response = await axiosInstance.get("/admin/dashboard/growth");
    return response.data;
  } catch (error) {
    console.error("Get growth analytics error:", error);
    throw error.response ? error.response.data : error;
  }
};