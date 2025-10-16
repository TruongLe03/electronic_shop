import { ref, reactive } from "vue";
import {
  getAllOrdersAdmin,
  updateOrderStatus,
  deleteOrderAdmin,
  getOrdersByDayStats,
} from "@/api/adminService.js";

export function useAdminOrders() {
  // State
  const orders = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Pagination
  const pagination = reactive({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });

  // Filters
  const filters = reactive({
    status: "",
    startDate: "",
    endDate: "",
    userId: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Order statuses based on actual BE model
  const orderStatuses = [
    { value: "pending", label: "Chờ xác nhận" },
    { value: "confirmed", label: "Đã xác nhận" },
    { value: "processing", label: "Đang xử lý" },
    { value: "shipping", label: "Đang giao" },
    { value: "delivered", label: "Đã giao" },
    { value: "cancelled", label: "Đã hủy" },
  ];

  // Methods
  const fetchOrders = async () => {
    try {
      loading.value = true;
      error.value = null;

      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
        ...filters,
      };

      const response = await getAllOrdersAdmin(params);

      if (response.success) {
        orders.value = response.data.orders || [];
        pagination.total = response.data.total || 0;
        pagination.totalPages = response.data.totalPages || 1;
      } else {
        throw new Error(response.message || "Lỗi khi tải đơn hàng");
      }
    } catch (err) {
      error.value = err.message || "Lỗi khi tải đơn hàng";
      console.error("Error fetching orders:", err);
    } finally {
      loading.value = false;
    }
  };

  const updateOrderStatusLocal = async (orderId, status, note = "") => {
    try {
      loading.value = true;
      error.value = null;

      const response = await updateOrderStatus(orderId, {
        status,
        note,
      });

      if (response.success) {
        // Update local data
        const orderIndex = orders.value.findIndex(
          (order) => order._id === orderId
        );
        if (orderIndex !== -1) {
          orders.value[orderIndex] = { ...orders.value[orderIndex], status };
        }
        return response.data;
      } else {
        throw new Error(response.message || "Lỗi khi cập nhật trạng thái");
      }
    } catch (err) {
      error.value = err.message || "Lỗi khi cập nhật trạng thái";
      console.error("Error updating order status:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await deleteOrderAdmin(orderId);

      if (response.success) {
        // Remove from local data
        const orderIndex = orders.value.findIndex(
          (order) => order._id === orderId
        );
        if (orderIndex !== -1) {
          orders.value.splice(orderIndex, 1);
        }

        // Update pagination
        pagination.total = Math.max(0, pagination.total - 1);

        return response;
      } else {
        throw new Error(response.message || "Lỗi khi xóa đơn hàng");
      }
    } catch (err) {
      error.value = err.message || "Lỗi khi xóa đơn hàng";
      console.error("Error deleting order:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Pagination methods
  const goToPage = (page) => {
    pagination.currentPage = page;
    fetchOrders();
  };

  const nextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      pagination.currentPage++;
      fetchOrders();
    }
  };

  const prevPage = () => {
    if (pagination.currentPage > 1) {
      pagination.currentPage--;
      fetchOrders();
    }
  };

  // Filter methods
  const applyFilters = () => {
    pagination.currentPage = 1;
    fetchOrders();
  };

  const clearFilters = () => {
    filters.status = "";
    filters.startDate = "";
    filters.endDate = "";
    filters.userId = "";
    filters.sortBy = "createdAt";
    filters.sortOrder = "desc";
    pagination.currentPage = 1;
    fetchOrders();
  };

  // Utility methods
  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      shipping: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status) => {
    const statusLabels = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      processing: "Đang xử lý",
      shipping: "Đang giao",
      delivered: "Đã giao",
      cancelled: "Đã hủy",
    };
    return statusLabels[status] || "Không xác định";
  };

  // Alias function để compatible với Dashboard
  const getStatusLabel = getStatusText;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return {
    // State
    orders,
    loading,
    error,
    pagination,
    filters,
    orderStatuses,

    // Methods
    fetchOrders,
    updateOrderStatus: updateOrderStatusLocal,
    deleteOrder,
    goToPage,
    nextPage,
    prevPage,
    applyFilters,
    clearFilters,
    getStatusColor,
    getStatusText,
    getStatusLabel,
    formatCurrency,
    formatDate,
  };
}
