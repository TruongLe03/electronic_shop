import { ref, reactive, computed } from "vue";
import * as adminService from "@/api/adminService";

export function useAdminOrders() {
  const orders = ref([]);
  const currentOrder = ref(null);
  const orderStats = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Pagination state
  const pagination = reactive({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Filter state
  const filters = reactive({
    status: "",
    startDate: "",
    endDate: "",
    userId: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const orderStatuses = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "pending", label: "Chờ xác nhận", color: "orange" },
    { value: "confirmed", label: "Đã xác nhận", color: "blue" },
    { value: "processing", label: "Đang xử lý", color: "purple" },
    { value: "shipped", label: "Đã gửi hàng", color: "indigo" },
    { value: "delivered", label: "Đã giao hàng", color: "green" },
    { value: "cancelled", label: "Đã hủy", color: "red" },
  ];

  // Lấy danh sách đơn hàng
  const fetchOrders = async (params = {}) => {
    try {
      loading.value = true;
      error.value = null;

      const queryParams = {
        page: pagination.currentPage,
        limit: 10,
        ...filters,
        ...params,
      };

      const response = await adminService.getAllOrdersAdmin(queryParams);
      orders.value = response.data.orders;

      // Update pagination
      Object.assign(pagination, response.data.pagination);
    } catch (err) {
      error.value = err.message || "Lỗi khi lấy danh sách đơn hàng";
      console.error("Fetch orders error:", err);
    } finally {
      loading.value = false;
    }
  };

  // Cập nhật trạng thái đơn hàng
  const updateOrderStatus = async (orderId, statusData) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await adminService.updateOrderStatus(
        orderId,
        statusData
      );

      // Update order in list
      const index = orders.value.findIndex((order) => order._id === orderId);
      if (index !== -1) {
        orders.value[index] = response.data;
      }

      return response;
    } catch (err) {
      error.value = err.message || "Lỗi khi cập nhật trạng thái đơn hàng";
      console.error("Update order status error:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Lấy thống kê đơn hàng theo ngày
  const fetchOrdersByDayStats = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await adminService.getOrdersByDayStats();
      orderStats.value = response.data;
    } catch (err) {
      error.value = err.message || "Lỗi khi lấy thống kê đơn hàng";
      console.error("Fetch orders by day stats error:", err);
    } finally {
      loading.value = false;
    }
  };

  // Filter orders by status
  const filterByStatus = (status) => {
    filters.status = status;
    pagination.currentPage = 1;
    fetchOrders();
  };

  // Filter orders by date range
  const filterByDateRange = (startDate, endDate) => {
    filters.startDate = startDate;
    filters.endDate = endDate;
    pagination.currentPage = 1;
    fetchOrders();
  };

  // Change page
  const changePage = (page) => {
    pagination.currentPage = page;
    fetchOrders();
  };

  // Reset filters
  const resetFilters = () => {
    Object.assign(filters, {
      status: "",
      startDate: "",
      endDate: "",
      userId: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    pagination.currentPage = 1;
    fetchOrders();
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusConfig = orderStatuses.find((s) => s.value === status);
    return statusConfig?.color || "gray";
  };

  // Get status label
  const getStatusLabel = (status) => {
    const statusConfig = orderStatuses.find((s) => s.value === status);
    return statusConfig?.label || status;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Computed properties
  const pendingOrders = computed(() => {
    return orders.value.filter((order) => order.status === "pending");
  });

  const processingOrders = computed(() => {
    return orders.value.filter((order) =>
      ["confirmed", "processing", "shipped"].includes(order.status)
    );
  });

  const completedOrders = computed(() => {
    return orders.value.filter((order) => order.status === "delivered");
  });

  const cancelledOrders = computed(() => {
    return orders.value.filter((order) => order.status === "cancelled");
  });

  const totalRevenue = computed(() => {
    return orders.value
      .filter((order) => order.status === "delivered")
      .reduce((sum, order) => sum + order.totalAmount, 0);
  });

  return {
    orders,
    currentOrder,
    orderStats,
    loading,
    error,
    pagination,
    filters,
    orderStatuses,
    fetchOrders,
    updateOrderStatus,
    fetchOrdersByDayStats,
    filterByStatus,
    filterByDateRange,
    changePage,
    resetFilters,
    getStatusColor,
    getStatusLabel,
    formatCurrency,
    formatDate,
    pendingOrders,
    processingOrders,
    completedOrders,
    cancelledOrders,
    totalRevenue,
  };
}
