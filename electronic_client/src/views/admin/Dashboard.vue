<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@stores/auth.js";
import {
  getDashboardStats,
  getRecentOrders,
  getRecentUsers,
} from "@api/adminService.js";
import AdminLayout from "@components/admin/AdminLayout.vue";

const router = useRouter();
const authStore = useAuthStore();

// Dashboard stats
const stats = ref({
  totalProducts: 0,
  totalUsers: 0,
  totalOrders: 0,
  totalRevenue: 0,
  loading: true,
});

const recentOrders = ref([]);
const recentUsers = ref([]);

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
    stats.value.loading = true;

    const [dashboardStats, ordersData, usersData] = await Promise.all([
      getDashboardStats(),
      getRecentOrders(5),
      getRecentUsers(5),
    ]);

    if (dashboardStats?.success) {
      stats.value = {
        ...stats.value,
        ...dashboardStats.data,
        loading: false,
      };
    } else {
      stats.value.loading = false;
    }

    if (ordersData?.success) {
      recentOrders.value = ordersData.data || [];
    }

    if (usersData?.success) {
      recentUsers.value = (usersData.data || []).map((user) => ({
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        joinDate: user.createdAt?.slice(0, 10),
        status: user.status || "active",
      }));
    }
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    stats.value = {
      totalProducts: 0,
      totalUsers: 0,
      totalOrders: 0,
      totalRevenue: 0,
      loading: false,
    };
    recentOrders.value = [];
    recentUsers.value = [];
  }
};

const formatCurrency = (amount) => {
  if (!amount || isNaN(amount)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const getStatusColor = (status) => {
  const colors = {
    completed: "text-green-600 bg-green-100",
    pending: "text-yellow-600 bg-yellow-100",
    processing: "text-blue-600 bg-blue-100",
    cancelled: "text-red-600 bg-red-100",
    active: "text-green-600 bg-green-100",
    inactive: "text-gray-600 bg-gray-100",
  };
  return colors[status] || "text-gray-600 bg-gray-100";
};
</script>

<template>
  <AdminLayout 
    title="Dashboard" 
    subtitle="Tổng quan hệ thống"
    icon="fas fa-chart-line"
  >
    <!-- Welcome Section -->
    <div class="mb-8">
      <div class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white relative overflow-hidden">
        <div class="absolute inset-0 bg-black/10"></div>
        <div class="relative z-10">
          <h2 class="text-2xl font-bold mb-2">
            <i class="fas fa-star mr-2"></i>
            Chào mừng trở lại!
          </h2>
          <p class="text-white/90">Hôm nay là {{ new Date().toLocaleDateString('vi-VN') }}. Hãy cùng xem tổng quan hệ thống nhé!</p>
        </div>
        <!-- Decorative elements -->
        <div class="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
        <div class="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
      </div>
    </div>

    <!-- Stats Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total Users Card -->
      <div class="group">
        <div class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:scale-105">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-1">Tổng Người Dùng</p>
              <p class="text-3xl font-bold text-gray-900">
                {{ stats.loading ? '...' : stats.totalUsers.toLocaleString() }}
              </p>
              <p class="text-sm text-green-600 flex items-center mt-2">
                <i class="fas fa-arrow-up mr-1"></i>
                +12% so với tháng trước
              </p>
            </div>
            <div class="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <i class="fas fa-users text-white text-2xl"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Total Products Card -->
      <div class="group">
        <div class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:scale-105">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-1">Tổng Sản Phẩm</p>
              <p class="text-3xl font-bold text-gray-900">
                {{ stats.loading ? '...' : stats.totalProducts.toLocaleString() }}
              </p>
              <p class="text-sm text-green-600 flex items-center mt-2">
                <i class="fas fa-arrow-up mr-1"></i>
                +8% so với tháng trước
              </p>
            </div>
            <div class="w-16 h-16 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <i class="fas fa-box text-white text-2xl"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Total Orders Card -->
      <div class="group">
        <div class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:scale-105">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-1">Tổng Đơn Hàng</p>
              <p class="text-3xl font-bold text-gray-900">
                {{ stats.loading ? '...' : stats.totalOrders.toLocaleString() }}
              </p>
              <p class="text-sm text-green-600 flex items-center mt-2">
                <i class="fas fa-arrow-up mr-1"></i>
                +15% so với tháng trước
              </p>
            </div>
            <div class="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <i class="fas fa-shopping-cart text-white text-2xl"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Total Revenue Card -->
      <div class="group">
        <div class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:scale-105">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-1">Tổng Doanh Thu</p>
              <p class="text-3xl font-bold text-gray-900">
                {{ stats.loading ? '...' : formatCurrency(stats.totalRevenue) }}
              </p>
              <p class="text-sm text-green-600 flex items-center mt-2">
                <i class="fas fa-arrow-up mr-1"></i>
                +22% so với tháng trước
              </p>
            </div>
            <div class="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <i class="fas fa-dollar-sign text-white text-2xl"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Tables -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Recent Orders -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div class="p-6 border-b border-gray-100">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 flex items-center">
              <i class="fas fa-shopping-cart text-orange-500 mr-2"></i>
              Đơn hàng gần đây
            </h3>
            <router-link to="/admin/orders" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              Xem tất cả <i class="fas fa-arrow-right ml-1"></i>
            </router-link>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã đơn</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="order in recentOrders" :key="order._id || order.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 text-sm font-medium text-gray-900"># {{ order.id || order._id }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ order.customer }}</td>
                <td class="px-6 py-4 text-sm text-gray-900 font-medium">{{ formatCurrency(order.amount) }}</td>
                <td class="px-6 py-4">
                  <span :class="`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`">
                    {{ order.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Users -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div class="p-6 border-b border-gray-100">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 flex items-center">
              <i class="fas fa-users text-blue-500 mr-2"></i>
              Người dùng mới
            </h3>
            <router-link to="/admin/users" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              Xem tất cả <i class="fas fa-arrow-right ml-1"></i>
            </router-link>
          </div>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div v-for="user in recentUsers" :key="user.id" class="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <i class="fas fa-user text-white"></i>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
                  <p class="text-xs text-gray-500">{{ user.email }}</p>
                </div>
              </div>
              <div class="text-right">
                <span :class="`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`">
                  {{ user.status }}
                </span>
                <p class="text-xs text-gray-500 mt-1">{{ user.joinDate }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <i class="fas fa-bolt text-yellow-500 mr-2"></i>
        Thao tác nhanh
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <router-link to="/admin/products/add" class="group p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200">
          <div class="text-center">
            <div class="w-12 h-12 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <i class="fas fa-plus text-white text-xl"></i>
            </div>
            <h4 class="font-medium text-gray-900 mb-1">Thêm sản phẩm</h4>
            <p class="text-sm text-gray-500">Thêm sản phẩm mới vào cửa hàng</p>
          </div>
        </router-link>

        <router-link to="/admin/orders" class="group p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all duration-200">
          <div class="text-center">
            <div class="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <i class="fas fa-clipboard-list text-white text-xl"></i>
            </div>
            <h4 class="font-medium text-gray-900 mb-1">Quản lý đơn hàng</h4>
            <p class="text-sm text-gray-500">Xem và xử lý đơn hàng</p>
          </div>
        </router-link>

        <router-link to="/admin/analytics" class="group p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all duration-200">
          <div class="text-center">
            <div class="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <i class="fas fa-chart-bar text-white text-xl"></i>
            </div>
            <h4 class="font-medium text-gray-900 mb-1">Xem báo cáo</h4>
            <p class="text-sm text-gray-500">Thống kê và phân tích</p>
          </div>
        </router-link>

        <router-link to="/admin/settings" class="group p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200">
          <div class="text-center">
            <div class="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <i class="fas fa-cog text-white text-xl"></i>
            </div>
            <h4 class="font-medium text-gray-900 mb-1">Cài đặt</h4>
            <p class="text-sm text-gray-500">Cấu hình hệ thống</p>
          </div>
        </router-link>
      </div>
    </div>
  </AdminLayout>
</template>