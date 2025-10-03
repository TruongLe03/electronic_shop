import { ref, reactive, computed } from "vue";
import * as adminService from "@/api/adminService";

export function useAdminAnalytics() {
  const productCategoryStats = ref([]);
  const lowStockProducts = ref([]);
  const revenueReport = ref(null);
  const productReport = ref([]);
  const systemInfo = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Lấy thống kê sản phẩm theo danh mục
  const fetchProductCategoryStats = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await adminService.getProductCategoryStats();
      productCategoryStats.value = response.data;
    } catch (err) {
      error.value =
        err.message || "Lỗi khi lấy thống kê sản phẩm theo danh mục";
      console.error("Product category stats error:", err);
    } finally {
      loading.value = false;
    }
  };

  // Lấy sản phẩm sắp hết hàng
  const fetchLowStockProducts = async (threshold = 10) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await adminService.getLowStockAlert(threshold);
      lowStockProducts.value = response.data;
    } catch (err) {
      error.value = err.message || "Lỗi khi lấy cảnh báo sản phẩm sắp hết hàng";
      console.error("Low stock products error:", err);
    } finally {
      loading.value = false;
    }
  };

  // Tạo báo cáo doanh thu
  const generateRevenueReport = async (startDate, endDate) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await adminService.generateRevenueReport(
        startDate,
        endDate
      );
      revenueReport.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err.message || "Lỗi khi tạo báo cáo doanh thu";
      console.error("Revenue report error:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Tạo báo cáo sản phẩm bán chạy
  const generateProductReport = async (limit = 20) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await adminService.generateProductReport(limit);
      productReport.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err.message || "Lỗi khi tạo báo cáo sản phẩm";
      console.error("Product report error:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Lấy thông tin hệ thống
  const fetchSystemInfo = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await adminService.getSystemInfo();
      systemInfo.value = response.data;
    } catch (err) {
      error.value = err.message || "Lỗi khi lấy thông tin hệ thống";
      console.error("System info error:", err);
    } finally {
      loading.value = false;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format number
  const formatNumber = (num) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  // Format bytes
  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Format uptime
  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return `${days}d ${hours}h ${minutes}m`;
  };

  return {
    productCategoryStats,
    lowStockProducts,
    revenueReport,
    productReport,
    systemInfo,
    loading,
    error,
    fetchProductCategoryStats,
    fetchLowStockProducts,
    generateRevenueReport,
    generateProductReport,
    fetchSystemInfo,
    formatCurrency,
    formatNumber,
    formatBytes,
    formatUptime,
  };
}
