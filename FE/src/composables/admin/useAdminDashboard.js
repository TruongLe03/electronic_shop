import { ref, reactive, computed } from "vue";
import { 
  getDashboardStats,
  getRecentActivities,
  getRevenueChartData,
  getDashboardTopProducts,
  getProductCategoryStats
} from "@/api/adminService";

export function useAdminDashboard() {
  const dashboardStats = ref(null);
  const growthStats = ref(null);
  const categoryStats = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Lấy thống kê dashboard
  const fetchDashboardStats = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await getDashboardStats();
      dashboardStats.value = response.data;
    } catch (err) {
      error.value = err.message || "Lỗi khi lấy thống kê dashboard";
      console.error("Dashboard stats error:", err);
    } finally {
      loading.value = false;
    }
  };

  // Lấy thống kê tăng trưởng (tạm thời disabled - chưa có API)
  const fetchGrowthStats = async () => {
    try {
      loading.value = true;
      error.value = null;
      // TODO: Implement getGrowthAnalytics API
      growthStats.value = {
        data: {
          userGrowth: 15.2,
          orderGrowth: 23.5,
          revenueGrowth: 18.7,
          productGrowth: 12.3
        }
      };
    } catch (err) {
      error.value = err.message || "Lỗi khi lấy thống kê tăng trưởng";
      console.error("Growth stats error:", err);
    } finally {
      loading.value = false;
    }
  };

  // Lấy thống kê sản phẩm theo danh mục
  const fetchCategoryStats = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await getProductCategoryStats();
      categoryStats.value = response.data;
    } catch (err) {
      error.value = err.message || "Lỗi khi lấy thống kê danh mục";
      console.error("Category stats error:", err);
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
    categoryStats,
    loading,
    error,
    fetchDashboardStats,
    fetchGrowthStats,
    fetchCategoryStats,
    totalRevenue,
    totalOrders,
    totalUsers,
    totalProducts,
  };
}
