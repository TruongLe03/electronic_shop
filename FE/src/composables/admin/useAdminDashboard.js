import { ref, reactive, computed } from "vue";
import * as adminService from "@/api/adminService";

export function useAdminDashboard() {
  const dashboardStats = ref(null);
  const growthStats = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Lấy thống kê dashboard
  const fetchDashboardStats = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await adminService.getDashboardStats();
      dashboardStats.value = response.data;
    } catch (err) {
      error.value = err.message || "Lỗi khi lấy thống kê dashboard";
      console.error("Dashboard stats error:", err);
    } finally {
      loading.value = false;
    }
  };

  // Lấy thống kê tăng trưởng
  const fetchGrowthStats = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await adminService.getGrowthAnalytics();
      growthStats.value = response.data;
    } catch (err) {
      error.value = err.message || "Lỗi khi lấy thống kê tăng trưởng";
      console.error("Growth stats error:", err);
    } finally {
      loading.value = false;
    }
  };

  // Computed properties
  const totalRevenue = computed(() => {
    return dashboardStats.value?.overview?.totalRevenue || 0;
  });

  const totalOrders = computed(() => {
    return dashboardStats.value?.overview?.totalOrders || 0;
  });

  const totalUsers = computed(() => {
    return dashboardStats.value?.overview?.totalUsers || 0;
  });

  const totalProducts = computed(() => {
    return dashboardStats.value?.overview?.totalProducts || 0;
  });

  return {
    dashboardStats,
    growthStats,
    loading,
    error,
    fetchDashboardStats,
    fetchGrowthStats,
    totalRevenue,
    totalOrders,
    totalUsers,
    totalProducts,
  };
}
