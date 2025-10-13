import axiosInstance from "../../utils/axiosConfig";

// ============= ORDER MANAGEMENT =============

// Lấy danh sách đơn hàng cho admin
export const getAllOrdersAdmin = async (params = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = "",
      startDate = "",
      endDate = "",
      userId = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const response = await axiosInstance.get("/admin/orders", {
      params: {
        page,
        limit,
        status,
        startDate,
        endDate,
        userId,
        sortBy,
        sortOrder,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Get all orders admin error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (orderId, statusData) => {
  try {
    const response = await axiosInstance.patch(
      `/admin/orders/${orderId}/status`,
      statusData
    );
    return response.data;
  } catch (error) {
    console.error("Update order status error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Lấy thống kê đơn hàng theo ngày trong tuần
export const getOrdersByDayStats = async () => {
  try {
    const response = await axiosInstance.get("/admin/orders/day-stats");
    return response.data;
  } catch (error) {
    console.error("Get orders by day stats error:", error);
    throw error.response ? error.response.data : error;
  }
};