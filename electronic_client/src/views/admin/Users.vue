<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth.js";
import {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from "../../api/adminService.js";
import AdminLayout from "../../components/admin/AdminLayout.vue";

// Router and Store
const router = useRouter();
const authStore = useAuthStore();

// State
const users = ref([]);
const loading = ref(false);
const searchTerm = ref("");
const selectedRole = ref("");
const selectedStatus = ref("");
const currentPage = ref(1);
const itemsPerPage = 10;
const totalPages = ref(0);
const totalItems = ref(0);

// Modal states
const showUserModal = ref(false);
const showDeleteModal = ref(false);
const selectedUser = ref(null);

// Constants
const userRoles = [
  {
    value: "user",
    label: "Khách hàng",
    color: "bg-blue-100 text-blue-800",
    icon: "fas fa-user",
  },
  {
    value: "admin",
    label: "Quản trị viên",
    color: "bg-purple-100 text-purple-800",
    icon: "fas fa-user-shield",
  },
];

const userStatuses = [
  {
    value: "active",
    label: "Hoạt động",
    color: "bg-green-100 text-green-800",
    icon: "fas fa-check-circle",
  },
  {
    value: "inactive",
    label: "Không hoạt động",
    color: "bg-gray-100 text-gray-800",
    icon: "fas fa-pause-circle",
  },
  {
    value: "suspended",
    label: "Tạm khóa",
    color: "bg-red-100 text-red-800",
    icon: "fas fa-ban",
  },
];

// Lifecycle
onMounted(async () => {
  if (!authStore.isAuthenticated || authStore.user?.role !== "admin") {
    router.push("/login");
    return;
  }
  await loadUsers();
});

// Methods
const loadUsers = async () => {
  try {
    loading.value = true;
    const params = {
      page: currentPage.value,
      limit: itemsPerPage,
      search: searchTerm.value || undefined,
      role: selectedRole.value || undefined,
      status: selectedStatus.value || undefined,
    };

    const res = await getAllUsers(params);
    if (res.success) {
      users.value = res.data.users || [];
      totalPages.value = res.data.pagination?.totalPages || 0;
      totalItems.value = res.data.pagination?.totalItems || 0;
    }
  } catch (e) {
    console.error("Load users failed:", e);
    users.value = [];
    totalPages.value = 0;
    totalItems.value = 0;
  } finally {
    loading.value = false;
  }
};

// Search and Filter handlers
const handleSearch = () => {
  currentPage.value = 1;
  loadUsers();
};

const handleRoleFilter = () => {
  currentPage.value = 1;
  loadUsers();
};

const handleStatusFilter = () => {
  currentPage.value = 1;
  loadUsers();
};

const handlePageChange = (page) => {
  currentPage.value = page;
  loadUsers();
};

// User actions
const viewUser = (user) => {
  selectedUser.value = user;
  showUserModal.value = true;
};

const confirmDelete = (user) => {
  selectedUser.value = user;
  showDeleteModal.value = true;
};

const handleDeleteUser = async () => {
  try {
    if (!selectedUser.value) return;

    const res = await deleteUser(selectedUser.value._id);
    if (res.success) {
      showDeleteModal.value = false;
      selectedUser.value = null;
      await loadUsers();
    }
  } catch (error) {
    console.error("Delete user failed:", error);
  }
};

const handleUpdateRole = async (userId, newRole) => {
  try {
    const res = await updateUserRole(userId, { role: newRole });
    if (res.success) {
      await loadUsers();
    }
  } catch (error) {
    console.error("Update role failed:", error);
  }
};

const handleUpdateStatus = async (userId, newStatus) => {
  try {
    const res = await updateUserStatus(userId, { status: newStatus });
    if (res.success) {
      await loadUsers();
    }
  } catch (error) {
    console.error("Update status failed:", error);
  }
};

// Utility functions
const getRoleInfo = (role) => {
  return userRoles.find((r) => r.value === role) || userRoles[0];
};

const getStatusInfo = (status) => {
  return userStatuses.find((s) => s.value === status) || userStatuses[0];
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("vi-VN");
};

const closeModal = () => {
  showUserModal.value = false;
  showDeleteModal.value = false;
  selectedUser.value = null;
};

const clearFilters = () => {
  searchTerm.value = "";
  selectedRole.value = "";
  selectedStatus.value = "";
  currentPage.value = 1;
  loadUsers();
};
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
  >
    <AdminLayout>
      <!-- Modern Header -->
      <header
        class="backdrop-blur-md bg-white/80 border-b border-white/20 sticky top-0 z-10"
      >
        <div class="max-w-7xl mx-auto px-6">
          <div class="flex justify-between items-center py-4">
            <div class="flex items-center space-x-3">
              <div
                class="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center"
              >
                <i class="fas fa-users text-white text-lg"></i>
              </div>
              <div>
                <h1
                  class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                >
                  Quản lý Người dùng
                </h1>
                <p class="text-sm text-gray-500">{{ totalItems }} người dùng</p>
              </div>
            </div>

            <div class="flex items-center space-x-3">
              <router-link
                to="/admin"
                class="px-4 py-2 bg-white/60 hover:bg-white/80 rounded-xl text-gray-600 hover:text-indigo-600 transition-all"
              >
                <i class="fas fa-arrow-left mr-2"></i>
                Quay lại Dashboard
              </router-link>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-6 py-8">
        <!-- Search and Filters -->
        <div
          class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8"
        >
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Search -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <i class="fas fa-search mr-1"></i>
                Tìm kiếm
              </label>
              <div class="relative">
                <input
                  v-model="searchTerm"
                  @keyup.enter="handleSearch"
                  type="text"
                  placeholder="Tìm theo tên hoặc email..."
                  class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <i
                  class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                ></i>
              </div>
            </div>

            <!-- Role Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <i class="fas fa-user-tag mr-1"></i>
                Vai trò
              </label>
              <select
                v-model="selectedRole"
                @change="handleRoleFilter"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Tất cả vai trò</option>
                <option
                  v-for="role in userRoles"
                  :key="role.value"
                  :value="role.value"
                >
                  {{ role.label }}
                </option>
              </select>
            </div>

            <!-- Status Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <i class="fas fa-toggle-on mr-1"></i>
                Trạng thái
              </label>
              <select
                v-model="selectedStatus"
                @change="handleStatusFilter"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Tất cả trạng thái</option>
                <option
                  v-for="status in userStatuses"
                  :key="status.value"
                  :value="status.value"
                >
                  {{ status.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-between items-center mt-4">
            <button
              @click="clearFilters"
              class="px-4 py-2 text-gray-600 hover:text-indigo-600 transition-all"
            >
              <i class="fas fa-times mr-1"></i>
              Xóa bộ lọc
            </button>
            <button
              @click="loadUsers"
              :disabled="loading"
              class="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50"
            >
              <i
                class="fas fa-sync-alt mr-2"
                :class="{ 'animate-spin': loading }"
              ></i>
              Làm mới
            </button>
          </div>
        </div>

        <!-- Users Grid -->
        <div
          v-if="loading"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <div
            v-for="i in 6"
            :key="i"
            class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse"
          >
            <div class="flex items-center space-x-4">
              <div class="w-16 h-16 bg-gray-200 rounded-full"></div>
              <div class="flex-1">
                <div class="h-4 bg-gray-200 rounded mb-2"></div>
                <div class="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else-if="users.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          <div
            v-for="user in users"
            :key="user._id"
            class="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
          >
            <!-- User Card -->
            <div class="p-6">
              <!-- User Avatar and Basic Info -->
              <div class="flex items-center space-x-4 mb-4">
                <div class="relative">
                  <div
                    class="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center"
                  >
                    <i class="fas fa-user text-white text-xl"></i>
                  </div>
                  <div
                    class="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center"
                  >
                    <i
                      :class="`${getStatusInfo(user.status).icon} text-xs ${
                        user.status === 'active'
                          ? 'text-green-500'
                          : user.status === 'suspended'
                          ? 'text-red-500'
                          : 'text-gray-500'
                      }`"
                    ></i>
                  </div>
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-900 text-lg">
                    {{ user.username || user.name }}
                  </h3>
                  <p class="text-gray-500 text-sm">{{ user.email }}</p>
                </div>
              </div>

              <!-- User Details -->
              <div class="space-y-3 mb-6">
                <!-- Role -->
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Vai trò:</span>
                  <span
                    :class="`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getRoleInfo(user.role).color
                    }`"
                  >
                    <i :class="`${getRoleInfo(user.role).icon} mr-1`"></i>
                    {{ getRoleInfo(user.role).label }}
                  </span>
                </div>

                <!-- Status -->
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Trạng thái:</span>
                  <span
                    :class="`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getStatusInfo(user.status).color
                    }`"
                  >
                    <i :class="`${getStatusInfo(user.status).icon} mr-1`"></i>
                    {{ getStatusInfo(user.status).label }}
                  </span>
                </div>

                <!-- Join Date -->
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Ngày tham gia:</span>
                  <span class="text-sm font-medium text-gray-900">{{
                    formatDate(user.createdAt)
                  }}</span>
                </div>

                <!-- Total Orders -->
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Đơn hàng:</span>
                  <span class="text-sm font-medium text-gray-900">{{
                    user.totalOrders || 0
                  }}</span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex space-x-2">
                <button
                  @click="viewUser(user)"
                  class="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <i class="fas fa-eye"></i>
                  <span>Xem</span>
                </button>

                <div class="relative group">
                  <button
                    class="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-2 rounded-xl transition-all duration-200"
                  >
                    <i class="fas fa-ellipsis-v"></i>
                  </button>

                  <!-- Dropdown Menu -->
                  <div
                    class="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10"
                  >
                    <div class="py-2">
                      <!-- Update Role -->
                      <div class="px-4 py-2 hover:bg-gray-50">
                        <span
                          class="text-xs font-medium text-gray-500 uppercase"
                          >Đổi vai trò</span
                        >
                        <div class="mt-1 space-y-1">
                          <button
                            v-for="role in userRoles"
                            :key="role.value"
                            @click="handleUpdateRole(user._id, role.value)"
                            :class="`w-full text-left px-2 py-1 rounded text-sm ${
                              user.role === role.value
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'hover:bg-gray-100'
                            }`"
                          >
                            <i :class="`${role.icon} mr-2`"></i>
                            {{ role.label }}
                          </button>
                        </div>
                      </div>

                      <hr class="my-2" />

                      <!-- Update Status -->
                      <div class="px-4 py-2 hover:bg-gray-50">
                        <span
                          class="text-xs font-medium text-gray-500 uppercase"
                          >Đổi trạng thái</span
                        >
                        <div class="mt-1 space-y-1">
                          <button
                            v-for="status in userStatuses"
                            :key="status.value"
                            @click="handleUpdateStatus(user._id, status.value)"
                            :class="`w-full text-left px-2 py-1 rounded text-sm ${
                              user.status === status.value
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'hover:bg-gray-100'
                            }`"
                          >
                            <i :class="`${status.icon} mr-2`"></i>
                            {{ status.label }}
                          </button>
                        </div>
                      </div>

                      <hr class="my-2" />

                      <!-- Delete -->
                      <button
                        v-if="user._id !== authStore.user?._id"
                        @click="confirmDelete(user)"
                        class="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <i class="fas fa-trash"></i>
                        <span>Xóa người dùng</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-16">
          <div
            class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <i class="fas fa-users text-gray-400 text-3xl"></i>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">
            Không tìm thấy người dùng
          </h3>
          <p class="text-gray-500 mb-6">
            Không có người dùng nào khớp với bộ lọc của bạn.
          </p>
          <button
            @click="clearFilters"
            class="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all"
          >
            Xóa bộ lọc
          </button>
        </div>

        <!-- Pagination -->
        <div
          v-if="totalPages > 1"
          class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-600">
              Hiển thị {{ (currentPage - 1) * itemsPerPage + 1 }} -
              {{ Math.min(currentPage * itemsPerPage, totalItems) }} trong tổng
              số {{ totalItems }} người dùng
            </div>

            <div class="flex space-x-2">
              <button
                @click="handlePageChange(currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 rounded-xl transition-all"
              >
                <i class="fas fa-chevron-left"></i>
              </button>

              <button
                v-for="page in Math.min(totalPages, 5)"
                :key="page"
                @click="handlePageChange(page)"
                :class="`px-4 py-2 rounded-xl transition-all ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`"
              >
                {{ page }}
              </button>

              <button
                @click="handlePageChange(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 rounded-xl transition-all"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </main>
    </AdminLayout>

    <!-- User Detail Modal -->
    <div
      v-if="showUserModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click="closeModal"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4"
        @click.stop
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-900 flex items-center">
              <i class="fas fa-user-circle text-blue-500 mr-2"></i>
              Chi tiết người dùng
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600"
            >
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>

          <div v-if="selectedUser" class="space-y-4">
            <div class="text-center">
              <div
                class="w-20 h-20 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <i class="fas fa-user text-white text-2xl"></i>
              </div>
              <h4 class="text-lg font-semibold text-gray-900">
                {{ selectedUser.username || selectedUser.name }}
              </h4>
              <p class="text-gray-500">{{ selectedUser.email }}</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-xl p-4 text-center">
                <i class="fas fa-user-tag text-blue-500 text-xl mb-2"></i>
                <div class="text-sm text-gray-600">Vai trò</div>
                <div class="font-semibold">
                  {{ getRoleInfo(selectedUser.role).label }}
                </div>
              </div>

              <div class="bg-gray-50 rounded-xl p-4 text-center">
                <i class="fas fa-toggle-on text-green-500 text-xl mb-2"></i>
                <div class="text-sm text-gray-600">Trạng thái</div>
                <div class="font-semibold">
                  {{ getStatusInfo(selectedUser.status).label }}
                </div>
              </div>

              <div class="bg-gray-50 rounded-xl p-4 text-center">
                <i class="fas fa-calendar text-purple-500 text-xl mb-2"></i>
                <div class="text-sm text-gray-600">Ngày tham gia</div>
                <div class="font-semibold">
                  {{ formatDate(selectedUser.createdAt) }}
                </div>
              </div>

              <div class="bg-gray-50 rounded-xl p-4 text-center">
                <i
                  class="fas fa-shopping-cart text-orange-500 text-xl mb-2"
                ></i>
                <div class="text-sm text-gray-600">Đơn hàng</div>
                <div class="font-semibold">
                  {{ selectedUser.totalOrders || 0 }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click="closeModal"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4"
        @click.stop
      >
        <div class="p-6">
          <div class="text-center">
            <div
              class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <i class="fas fa-exclamation-triangle text-red-500 text-xl"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa</h3>
            <p class="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa người dùng
              <strong>{{ selectedUser?.username || selectedUser?.name }}</strong
              >? Hành động này không thể hoàn tác.
            </p>

            <div class="flex space-x-3">
              <button
                @click="closeModal"
                class="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all"
              >
                Hủy
              </button>
              <button
                @click="handleDeleteUser"
                class="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
