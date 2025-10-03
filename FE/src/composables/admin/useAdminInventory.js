import { ref, reactive, computed } from "vue";
import * as adminService from "@/api/adminService";

export function useAdminInventory() {
  const inventoryItems = ref([]);
  const lowStockProducts = ref([]);
  const totalItems = ref(0);
  const loading = ref(false);
  const error = ref(null);

  // Pagination
  const pagination = reactive({
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Filters
  const filters = reactive({
    search: "",
    category: "",
    status: "",
    stockLevel: "",
  });

  // Computed
  const hasFilters = computed(() => {
    return (
      filters.search || filters.category || filters.status || filters.stockLevel
    );
  });

  // Lấy danh sách inventory
  const fetchInventory = async (params = {}) => {
    try {
      loading.value = true;
      error.value = null;

      const queryParams = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        ...params,
      };

      const response = await adminService.getInventory(queryParams);
      inventoryItems.value = response.data.items;
      totalItems.value = response.data.total;
      pagination.totalPages = Math.ceil(response.data.total / pagination.limit);
    } catch (err) {
      error.value = err.message || "Lỗi khi lấy danh sách inventory";
      console.error("Fetch inventory error:", err);
    } finally {
      loading.value = false;
    }
  };

  // Cập nhật stock
  const updateStock = async (productId, stockData) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await adminService.updateStock(productId, stockData);

      // Cập nhật item trong danh sách
      const index = inventoryItems.value.findIndex(
        (item) => item.productId._id === productId
      );
      if (index !== -1) {
        inventoryItems.value[index] = response.data;
      }

      return response.data;
    } catch (err) {
      error.value = err.message || "Lỗi khi cập nhật stock";
      console.error("Update stock error:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Lấy cảnh báo hàng sắp hết
  const fetchLowStockAlert = async (threshold = 10) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await adminService.getLowStockAlert(threshold);
      lowStockProducts.value = response.data;
    } catch (err) {
      error.value = err.message || "Lỗi khi lấy cảnh báo hàng sắp hết";
      console.error("Low stock alert error:", err);
    } finally {
      loading.value = false;
    }
  };

  // Tạo stock movement
  const createStockMovement = async (movementData) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await adminService.createStockMovement(movementData);

      // Refresh inventory để cập nhật số lượng
      await fetchInventory();

      return response.data;
    } catch (err) {
      error.value = err.message || "Lỗi khi tạo stock movement";
      console.error("Create stock movement error:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Pagination methods
  const goToPage = (page) => {
    pagination.page = page;
    fetchInventory();
  };

  const nextPage = () => {
    if (pagination.page < pagination.totalPages) {
      pagination.page++;
      fetchInventory();
    }
  };

  const prevPage = () => {
    if (pagination.page > 1) {
      pagination.page--;
      fetchInventory();
    }
  };

  // Filter methods
  const applyFilters = () => {
    pagination.page = 1;
    fetchInventory();
  };

  const clearFilters = () => {
    Object.keys(filters).forEach((key) => {
      filters[key] = "";
    });
    pagination.page = 1;
    fetchInventory();
  };

  // Search
  const search = (searchTerm) => {
    filters.search = searchTerm;
    pagination.page = 1;
    fetchInventory();
  };

  // Stock level utilities
  const getStockStatus = (quantity, reorderLevel = 10) => {
    if (quantity === 0) return "out-of-stock";
    if (quantity <= reorderLevel) return "low-stock";
    return "in-stock";
  };

  const getStockStatusColor = (status) => {
    switch (status) {
      case "out-of-stock":
        return "text-red-600 bg-red-50";
      case "low-stock":
        return "text-yellow-600 bg-yellow-50";
      case "in-stock":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStockStatusText = (status) => {
    switch (status) {
      case "out-of-stock":
        return "Hết hàng";
      case "low-stock":
        return "Sắp hết";
      case "in-stock":
        return "Còn hàng";
      default:
        return "Không xác định";
    }
  };

  // Format functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return {
    // State
    inventoryItems,
    lowStockProducts,
    totalItems,
    loading,
    error,
    pagination,
    filters,

    // Computed
    hasFilters,

    // Methods
    fetchInventory,
    updateStock,
    fetchLowStockAlert,
    createStockMovement,

    // Pagination
    goToPage,
    nextPage,
    prevPage,

    // Filters
    applyFilters,
    clearFilters,
    search,

    // Utilities
    getStockStatus,
    getStockStatusColor,
    getStockStatusText,
    formatCurrency,
    formatNumber,
    formatDate,
  };
}
