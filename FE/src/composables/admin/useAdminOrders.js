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

  // Order statuses based on actual BE model (updated for VNPay integration)
  const orderStatuses = [
    "pending",          // Vừa tạo đơn, chờ thanh toán
    "payment_pending",  // Đang chờ thanh toán (VNPay)
    "payment_failed",   // Thanh toán thất bại
    "confirmed",        // Đã thanh toán, chờ xử lý
    "processing",       // Đang chuẩn bị hàng
    "ready_to_ship",    // Sẵn sàng giao hàng
    "shipping",         // Đang giao hàng
    "delivered",        // Đã giao thành công
    "cancelled",        // Đã hủy
    "returned",         // Đã trả hàng
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

  const deleteBulkOrders = async (orderIds) => {
    try {
      loading.value = true;
      error.value = null;

      const deletePromises = orderIds.map(orderId => deleteOrderAdmin(orderId));
      const responses = await Promise.allSettled(deletePromises);

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < responses.length; i++) {
        const response = responses[i];
        const orderId = orderIds[i];

        if (response.status === 'fulfilled' && response.value.success) {
          // Remove from local data
          const orderIndex = orders.value.findIndex(order => order._id === orderId);
          if (orderIndex !== -1) {
            orders.value.splice(orderIndex, 1);
          }
          successCount++;
        } else {
          errorCount++;
          console.error(`Error deleting order ${orderId}:`, response.reason || response.value?.message);
        }
      }

      // Update pagination
      pagination.total = Math.max(0, pagination.total - successCount);

      if (errorCount > 0) {
        throw new Error(`Xóa thành công ${successCount}/${orderIds.length} đơn hàng. ${errorCount} đơn hàng xóa thất bại.`);
      }

      return { success: true, message: `Xóa thành công ${successCount} đơn hàng` };
    } catch (err) {
      error.value = err.message || "Lỗi khi xóa đơn hàng";
      console.error("Error bulk deleting orders:", err);
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
      pending: "bg-yellow-100 text-yellow-800",           // Chờ xác nhận
      payment_pending: "bg-orange-100 text-orange-800",   // Chờ thanh toán
      payment_failed: "bg-red-100 text-red-800",          // Thanh toán thất bại
      confirmed: "bg-blue-100 text-blue-800",             // Đã xác nhận
      processing: "bg-purple-100 text-purple-800",        // Đang xử lý
      ready_to_ship: "bg-cyan-100 text-cyan-800",         // Sẵn sàng giao hàng
      shipping: "bg-indigo-100 text-indigo-800",          // Đang giao
      delivered: "bg-green-100 text-green-800",           // Đã giao
      cancelled: "bg-red-100 text-red-800",               // Đã hủy
      returned: "bg-gray-100 text-gray-800",              // Đã trả hàng
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status) => {
    const statusLabels = {
      pending: "Chờ thanh toán",
      payment_pending: "Đang chờ thanh toán",
      payment_failed: "Thanh toán thất bại",
      confirmed: "Đã xác nhận",
      processing: "Đang chuẩn bị hàng",
      ready_to_ship: "Sẵn sàng giao hàng",
      shipping: "Đang giao hàng",
      delivered: "Đã giao thành công",
      cancelled: "Đã hủy",
      returned: "Đã trả hàng",
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

  // Payment status utilities
  const getPaymentStatusColor = (paymentStatus) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",       // Chờ thanh toán
      completed: "bg-green-100 text-green-800",       // Đã thanh toán
      failed: "bg-red-100 text-red-800",              // Thanh toán thất bại
      refunded: "bg-purple-100 text-purple-800",      // Đã hoàn tiền
    };
    return colors[paymentStatus] || "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusText = (paymentStatus) => {
    const statusLabels = {
      pending: "Chờ thanh toán",
      completed: "Đã thanh toán",
      failed: "Thanh toán thất bại",
      refunded: "Đã hoàn tiền",
    };
    return statusLabels[paymentStatus] || "Không xác định";
  };

  const getPaymentMethodText = (paymentMethod) => {
    const methodLabels = {
      COD: "Thanh toán khi nhận hàng",
      cod: "Thanh toán khi nhận hàng",
      VNPay: "VNPay",
      vnpay: "VNPay",
    };
    return methodLabels[paymentMethod] || paymentMethod;
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
    deleteBulkOrders,
    goToPage,
    nextPage,
    prevPage,
    applyFilters,
    clearFilters,
    getStatusColor,
    getStatusText,
    getStatusLabel,
    getPaymentStatusColor,
    getPaymentStatusText,
    getPaymentMethodText,
    formatCurrency,
    formatDate,
  };
}
