<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";
import { useAdminDashboard } from "@/composables/admin/useAdminDashboard.js";
import { useAdminOrders } from "@/composables/admin/useAdminOrders.js";
import { useAdminUsers } from "@/composables/admin/useAdminUsers.js";
import { useAdminAnalytics } from "@/composables/admin/useAdminAnalytics.js";
import AdminLayout from "@/components/admin/AdminLayout.vue";
import ModernStatsCard from "@/components/admin/ModernStatsCard.vue";
import RevenueChart from "@/components/admin/RevenueChart.vue";
import OrdersChart from "@/components/admin/OrdersChart.vue";
import ActivityFeed from "@/components/admin/ActivityFeed.vue";
import QuickActions from "@/components/admin/QuickActions.vue";

const router = useRouter();
const authStore = useAuthStore();

// Composables
const {
  dashboardStats,
  growthStats,
  loading: dashboardLoading,
  error: dashboardError,
  fetchDashboardStats,
  fetchGrowthStats,
  totalRevenue,
  totalOrders,
  totalUsers,
  totalProducts,
} = useAdminDashboard();

const {
  orders: recentOrders,
  fetchOrders,
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusLabel,
} = useAdminOrders();

const { vipCustomers, fetchVIPCustomers } = useAdminUsers();

// Dashboard stats with growth trends
const stats = computed(() => ({
  totalProducts: totalProducts.value,
  totalUsers: totalUsers.value,
  totalOrders: totalOrders.value,
  totalRevenue: totalRevenue.value,
  loading: dashboardLoading.value,
  trends: {
    products: growthStats.value?.products
      ? `${
          growthStats.value.products.growth > 0 ? "+" : ""
        }${growthStats.value.products.growth.toFixed(1)}%`
      : "+0%",
    users: growthStats.value?.users
      ? `${
          growthStats.value.users.growth > 0 ? "+" : ""
        }${growthStats.value.users.growth.toFixed(1)}%`
      : "+0%",
    orders: growthStats.value?.orders
      ? `${
          growthStats.value.orders.growth > 0 ? "+" : ""
        }${growthStats.value.orders.growth.toFixed(1)}%`
      : "+0%",
    revenue: growthStats.value?.revenue
      ? `${
          growthStats.value.revenue.growth > 0 ? "+" : ""
        }${growthStats.value.revenue.growth.toFixed(1)}%`
      : "+0%",
  },
}));

// Chart data
const salesData = computed(() => {
  if (!dashboardStats.value?.monthlyRevenue) return [];

  return dashboardStats.value.monthlyRevenue.map((item) => ({
    month: `${item._id.month}/${item._id.year}`,
    revenue: item.revenue,
    orders: item.orders,
  }));
});

const ordersData = computed(() => {
  if (!dashboardStats.value?.ordersByStatus) return [];

  return dashboardStats.value.ordersByStatus.map((item) => ({
    status: getStatusLabel(item._id),
    count: item.count,
    color: getStatusColor(item._id),
  }));
});

// Recent activities (top products)
const recentActivities = computed(() => {
  if (!dashboardStats.value?.topProducts) return [];

  return dashboardStats.value.topProducts.map((item) => ({
    id: item._id,
    type: "product_sale",
    title: `Bán ${item.totalSold} ${item.product.name}`,
    description: `Doanh thu: ${formatCurrency(item.revenue)}`,
    time: "Hôm nay",
    icon: "📦",
  }));
});

// Check admin permissions
onMounted(async () => {
  if (!authStore.isAuthenticated || authStore.user?.role !== "admin") {
    router.push("/login");
    return;
  }

  await loadDashboardData();
});

const loadDashboardData = async () => {
  try {
    // Load dashboard stats and growth data
    await Promise.all([fetchDashboardStats(), fetchGrowthStats()]);

    // Load recent orders (limit 5)
    await fetchOrders({ limit: 5 });

    // Load VIP customers (limit 5)
    await fetchVIPCustomers(5);
  } catch (error) {
    console.error("Error loading dashboard data:", error);
  }
};

// Refresh dashboard data
const refreshData = async () => {
  await loadDashboardData();
};
</script>

<template>
  <AdminLayout>
    <div class="space-y-8">
      <!-- Stats Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModernStatsCard
          title="Tổng sản phẩm"
          :value="stats.totalProducts"
          icon="fas fa-box"
          gradient="from-blue-500 to-cyan-500"
          :trend="stats.trends.products"
          :loading="stats.loading"
        />

        <ModernStatsCard
          title="Tổng người dùng"
          :value="stats.totalUsers"
          icon="fas fa-users"
          gradient="from-green-500 to-emerald-500"
          :trend="stats.trends.users"
          :loading="stats.loading"
        />

        <ModernStatsCard
          title="Tổng đơn hàng"
          :value="stats.totalOrders"
          icon="fas fa-shopping-cart"
          gradient="from-purple-500 to-pink-500"
          :trend="stats.trends.orders"
          :loading="stats.loading"
        />

        <ModernStatsCard
          title="Doanh thu"
          :value="stats.totalRevenue"
          icon="fas fa-dollar-sign"
          gradient="from-orange-500 to-red-500"
          :trend="stats.trends.revenue"
          :loading="stats.loading"
          :is-currency="true"
        />
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Revenue Chart -->
        <div class="lg:col-span-2">
          <RevenueChart :data="salesData" :loading="stats.loading" />
        </div>

        <!-- Orders Chart -->
        <div class="lg:col-span-1">
          <OrdersChart :data="ordersData" :loading="stats.loading" />
        </div>
      </div>

      <!-- Quick Actions -->
      <QuickActions />

      <!-- Activity and Data Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Activity Feed -->
        <div class="lg:col-span-1">
          <ActivityFeed
            :activities="recentActivities"
            :loading="stats.loading"
          />
        </div>

        <!-- Recent Orders -->
        <div class="lg:col-span-2">
          <div
            class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6"
          >
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center space-x-3">
                <div
                  class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl"
                >
                  🛒
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-800 dark:text-white">
                    Đơn hàng gần đây
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Danh sách đơn hàng mới nhất
                  </p>
                </div>
              </div>
              <router-link
                to="/admin/orders"
                class="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm"
              >
                Xem tất cả
              </router-link>
            </div>

            <div class="overflow-hidden">
              <div class="space-y-3">
                <div
                  v-for="order in recentOrders.slice(0, 5)"
                  :key="order._id"
                  class="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer group"
                >
                  <div class="flex items-center space-x-4">
                    <img
                      class="w-12 h-12 rounded-full ring-2 ring-blue-500/20"
                      :src="`https://ui-avatars.com/api/?name=${
                        order.userId?.name || 'Unknown'
                      }&background=random`"
                      :alt="order.userId?.name || 'Unknown User'"
                    />
                    <div>
                      <p
                        class="font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                      >
                        {{ order.userId?.name || "Unknown User" }}
                      </p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">
                        #{{ order._id.slice(-8) }}
                      </p>
                    </div>
                  </div>

                  <div class="text-right">
                    <p class="font-semibold text-gray-800 dark:text-white">
                      {{ formatCurrency(order.totalAmount) }}
                    </p>
                    <span
                      :class="`inline-flex px-3 py-1 text-xs font-medium rounded-full bg-${getStatusColor(
                        order.status
                      )}-100 text-${getStatusColor(order.status)}-700`"
                    >
                      {{ getStatusLabel(order.status) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
