<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";
import { useAdminUsers } from "@/composables/admin/useAdminUsers.js";
import { useNotification } from "@/composables/admin/useNotification.js";
import AdminLayout from "@/layout/AdminLayout.vue";
import ModernStatsCard from "@/components/admin/ModernStatsCard.vue";

const router = useRouter();
const authStore = useAuthStore();
const { showNotification } = useNotification();

// Composable
const {
  users,
  loading,
  error,
  fetchUsers,
  updateUser,
  toggleUserStatus,
  deleteUser: deleteUserApi,
  filterUsers,
  activeUsers,
  inactiveUsers,
  adminUsers,
} = useAdminUsers();

// Local state
const searchQuery = ref("");
const selectedRole = ref("");
const selectedStatus = ref("");

// Filter options
const roles = [
  { value: "", label: "Tất cả vai trò" },
  { value: "customer", label: "Khách hàng" },
  { value: "admin", label: "Quản trị viên" },
];

const statuses = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "active", label: "Hoạt động" },
  { value: "inactive", label: "Không hoạt động" },
  { value: "banned", label: "Bị khóa" },
];

// Stats
const stats = computed(() => ({
  totalUsers: users.value.length,
  activeUsers: activeUsers.value.length,
  inactiveUsers: inactiveUsers.value.length,
  adminUsers: adminUsers.value.length,
  newUsersThisMonth: users.value.filter(
    (u) => new Date(u.joinDate) >= new Date("2025-10-01")
  ).length,
}));

// Fetch initial
onMounted(async () => {
  if (!authStore.isAuthenticated || authStore.user?.role !== "admin") {
    router.push("/login");
    return;
  }
  await fetchUsers();
});

// Watch filters
watch(
  [searchQuery, selectedRole, selectedStatus],
  ([search, role, status]) => {
    const params = {};
    if (search) params.search = search;
    if (role) params.role = role;
    if (status) params.status = status;
    filterUsers(params);
  },
  { deep: true }
);

// Helpers
const formatDate = (date) =>
  new Date(date).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount
  );

const getStatusColor = (status) => {
  const colors = {
    active:
      "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30",
    inactive:
      "text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30",
    banned: "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30",
  };
  return colors[status] || "text-gray-700 bg-gray-100";
};

const getStatusText = (status) =>
  ({
    active: "Hoạt động",
    inactive: "Không hoạt động",
    banned: "Bị khóa",
  }[status] || status);

const getRoleColor = (role) => {
  const colors = {
    admin:
      "text-purple-700 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30",
    customer:
      "text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30",
  };
  return colors[role] || "text-gray-700 bg-gray-100";
};

const getRoleText = (role) =>
  ({
    admin: "Quản trị",
    customer: "Khách hàng",
  }[role] || role);

// Actions
const addUser = () => {
  alert("Chức năng thêm người dùng sẽ được phát triển sau!");
};

const viewUserDetails = (user) => {
  alert(`Chi tiết "${user.name}":
- Email: ${user.email}
- SĐT: ${user.phone || "Chưa cập nhật"}
- Đơn hàng: ${user.totalOrders || 0}
- Tổng chi tiêu: ${formatCurrency(user.totalSpent || 0)}
- Tham gia: ${formatDate(user.createdAt || user.joinDate)}
- Đăng nhập cuối: ${formatDate(user.lastLogin || user.updatedAt)}`);
};

const resetPassword = (user) => {
  if (confirm(`Reset mật khẩu cho "${user.name}"?`)) {
    alert(`Đã gửi email reset mật khẩu cho "${user.name}"!`);
  }
};

const deleteUser = async (user) => {
  if (!confirm(`Bạn có chắc muốn xóa "${user.name}"?`)) return;
  try {
    await deleteUserApi(user._id);
    showNotification("Xóa người dùng thành công!", "success");
  } catch (err) {
    showNotification(err.message || "Có lỗi xảy ra!", "error");
  }
};

const banUser = (user) => {
  if (confirm(`Khóa tài khoản "${user.name}"?`)) {
    user.status = "banned";
    showNotification("Đã khóa tài khoản thành công!", "success");
  }
};

const unbanUser = (user) => {
  if (confirm(`Mở khóa tài khoản "${user.name}"?`)) {
    user.status = "active";
    showNotification("Đã mở khóa tài khoản thành công!", "success");
  }
};
</script>

<template>
  <AdminLayout>
    <div class="space-y-8">
      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModernStatsCard
          title="Tổng người dùng"
          :value="stats.totalUsers"
          icon="fas fa-users"
          gradient="from-blue-500 to-cyan-500"
          :loading="loading"
        />
        <ModernStatsCard
          title="Đang hoạt động"
          :value="stats.activeUsers"
          icon="fas fa-user-check"
          gradient="from-green-500 to-emerald-500"
          :loading="loading"
        />
        <ModernStatsCard
          title="Không hoạt động"
          :value="stats.inactiveUsers"
          icon="fas fa-user-clock"
          gradient="from-yellow-500 to-orange-500"
          :loading="loading"
        />
        <ModernStatsCard
          title="Mới tháng này"
          :value="stats.newUsersThisMonth"
          icon="fas fa-user-plus"
          gradient="from-purple-500 to-pink-500"
          :loading="loading"
        />
      </div>

      <!-- User table -->
      <div
        class="bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50"
      >
        <!-- Header -->
        <div
          class="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
        >
          <div class="flex items-center space-x-3">
            <div
              class="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white text-xl"
            >
              <i class="fas fa-users"></i>
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-800 dark:text-white">
                Quản lý người dùng
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Danh sách tất cả người dùng
              </p>
            </div>
          </div>

          <div
            class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4"
          >
            <button
              @click="addUser"
              class="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 shadow-lg"
            >
              <i class="fas fa-user-plus mr-2"></i> Thêm người dùng
            </button>

            <!-- Search -->
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Tìm kiếm người dùng..."
                class="w-full sm:w-64 pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500"
              />
              <svg
                class="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <!-- Filters -->
            <select
              v-model="selectedRole"
              class="px-4 py-2 bg-gray-50 dark:bg-gray-700 border rounded-xl"
            >
              <option
                v-for="role in roles"
                :key="role.value"
                :value="role.value"
              >
                {{ role.label }}
              </option>
            </select>

            <select
              v-model="selectedStatus"
              class="px-4 py-2 bg-gray-50 dark:bg-gray-700 border rounded-xl"
            >
              <option
                v-for="status in statuses"
                :key="status.value"
                :value="status.value"
              >
                {{ status.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full" v-if="!loading">
            <thead class="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-medium">
                  Người dùng
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium">Liên hệ</th>
                <th class="px-6 py-4 text-left text-xs font-medium">Vai trò</th>
                <th class="px-6 py-4 text-left text-xs font-medium">
                  Trạng thái
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium">
                  Đơn hàng
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium">
                  Tổng chi tiêu
                </th>
                <th class="px-6 py-4 text-right text-xs font-medium">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="user in users"
                :key="user.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td class="px-6 py-4 flex items-center space-x-4">
                  <img
                    class="w-12 h-12 rounded-full"
                    :src="user.avatar"
                    :alt="user.name"
                  />
                  <div>
                    <div class="font-semibold">{{ user.name }}</div>
                    <div class="text-xs text-gray-500">
                      Tham gia: {{ formatDate(user.joinDate) }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div>{{ user.email }}</div>
                  <div class="text-xs text-gray-500">{{ user.phone }}</div>
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(
                      user.role
                    )}`"
                  >
                    {{ getRoleText(user.role) }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      user.status
                    )}`"
                  >
                    {{ getStatusText(user.status) }}
                  </span>
                </td>
                <td class="px-6 py-4">{{ user.totalOrders || 0 }} đơn</td>
                <td class="px-6 py-4">
                  <div>{{ formatCurrency(user.totalSpent || 0) }}</div>
                  <div class="text-xs text-gray-500">
                    Đăng nhập: {{ formatDate(user.lastLogin) }}
                  </div>
                </td>
                <td class="px-6 py-4 text-right space-x-2">
                  <button @click="viewUserDetails(user)" class="text-blue-500">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button @click="resetPassword(user)" class="text-indigo-500">
                    <i class="fas fa-key"></i>
                  </button>
                  <button @click="deleteUser(user)" class="text-red-500">
                    <i class="fas fa-trash"></i>
                  </button>
                  <button
                    v-if="user.status !== 'banned'"
                    @click="banUser(user)"
                    class="text-red-600"
                  >
                    <i class="fas fa-ban"></i>
                  </button>
                  <button
                    v-else
                    @click="unbanUser(user)"
                    class="text-green-600"
                  >
                    <i class="fas fa-unlock"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Loading -->
          <div v-else class="p-8 text-center">Đang tải dữ liệu...</div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
