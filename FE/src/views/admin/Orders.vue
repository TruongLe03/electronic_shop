<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";
import { useAdminOrders } from "@/composables/admin/useAdminOrders.js";
import AdminLayout from "@/components/admin/AdminLayout.vue";
import ModernStatsCard from "@/components/admin/ModernStatsCard.vue";

// --- STORE & ROUTER ---
const router = useRouter();
const authStore = useAuthStore();

// --- COMPOSABLE ---
const {
  orders,
  loading,
  error,
  pagination,
  filters,
  orderStatuses,
  fetchOrders,
  updateOrderStatus,
  goToPage,
  nextPage,
  prevPage,
  applyFilters,
  clearFilters,
  getStatusColor,
  getStatusText,
  formatCurrency,
  formatDate,
} = useAdminOrders();

// --- STATE ---
const searchQuery = ref("");
const selectedStatus = ref("");
const showStatusModal = ref(false);
const orderToUpdate = ref(null);
const newStatus = ref("");
const statusNote = ref("");

// --- FILTER ORDERS LOCALLY ---
const filteredOrders = computed(() => {
  let filtered = orders.value || [];

  // Filter by status
  if (selectedStatus.value && selectedStatus.value !== "") {
    filtered = filtered.filter(
      (order) => order.status === selectedStatus.value
    );
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter(
      (order) =>
        order._id?.toLowerCase().includes(query) ||
        order.orderId?.toLowerCase().includes(query) ||
        order.user_id?.name?.toLowerCase().includes(query) ||
        order.user_id?.email?.toLowerCase().includes(query)
    );
  }

  return filtered;
});

// --- STATS ---
const stats = computed(() => {
  const all = orders.value || [];
  return {
    totalOrders: all.length,
    pendingOrders: all.filter(
      (o) => o.status === "pending" || o.status === "Chờ xác nhận"
    ).length,
    completedOrders: all.filter(
      (o) => o.status === "delivered" || o.status === "Đã giao"
    ).length,
    totalRevenue: all
      .filter((o) => o.status === "delivered" || o.status === "Đã giao")
      .reduce((sum, o) => sum + (o.total_amount || o.total || 0), 0),
  };
});

// --- METHODS ---
const handleStatusChange = (order) => {
  orderToUpdate.value = order;
  newStatus.value = order.status;
  showStatusModal.value = true;
};

const confirmStatusUpdate = async () => {
  try {
    await updateOrderStatus(
      orderToUpdate.value._id,
      newStatus.value,
      statusNote.value
    );
    showStatusModal.value = false;
    orderToUpdate.value = null;
    newStatus.value = "";
    statusNote.value = "";
  } catch (err) {
    console.error("Error updating order status:", err);
    alert("Có lỗi xảy ra khi cập nhật trạng thái đơn hàng");
  }
};

const cancelStatusUpdate = () => {
  showStatusModal.value = false;
  orderToUpdate.value = null;
  newStatus.value = "";
  statusNote.value = "";
};

const handleStatusFilter = () => {
  filters.status = selectedStatus.value;
  applyFilters();
};

const handleSearch = () => {
  // local filtering only
};

const viewOrderDetail = (order) => {
  router.push(`/admin/orders/${order._id}`);
};

const printOrder = (order) => {
  console.log("Print order:", order._id);
  // TODO: Implement print logic
};

const deleteOrder = (order) => {
  if (
    confirm(
      `Bạn có chắc muốn xóa đơn hàng #${order._id.slice(-8).toUpperCase()}?`
    )
  ) {
    console.log("Delete order:", order._id);
    // TODO: call API delete order
  }
};

// --- LIFECYCLE ---
onMounted(async () => {
  if (!authStore.isAuthenticated || authStore.user?.role !== "admin") {
    router.push("/login");
    return;
  }
  await fetchOrders();
});
</script>

<template>
  <AdminLayout>
    <div class="p-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Quản lý đơn hàng</h1>
        <p class="text-gray-600">Theo dõi và xử lý tất cả đơn hàng</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <ModernStatsCard
          title="Tổng đơn hàng"
          :value="stats.totalOrders"
          icon="📊"
          color="blue"
        />
        <ModernStatsCard
          title="Đang xử lý"
          :value="stats.pendingOrders"
          icon="⏳"
          color="yellow"
        />
        <ModernStatsCard
          title="Hoàn thành"
          :value="stats.completedOrders"
          icon="✅"
          color="green"
        />
        <ModernStatsCard
          title="Doanh thu"
          :value="formatCurrency(stats.totalRevenue)"
          icon="💰"
          color="purple"
        />
      </div>

      <!-- Filters -->
      <div
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
      >
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Search -->
          <div>
            <label
              for="search"
              class="block text-sm font-medium text-gray-700 mb-2"
              >Tìm kiếm</label
            >
            <input
              id="search"
              v-model="searchQuery"
              type="text"
              placeholder="Tìm theo mã đơn, tên khách hàng..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              @input="handleSearch"
            />
          </div>

          <!-- Status Filter -->
          <div>
            <label
              for="status"
              class="block text-sm font-medium text-gray-700 mb-2"
              >Trạng thái</label
            >
            <select
              id="status"
              v-model="selectedStatus"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              @change="handleStatusFilter"
            >
              <option value="">Tất cả trạng thái</option>
              <option
                v-for="status in orderStatuses"
                :key="status.value"
                :value="status.value"
              >
                {{ status.label }}
              </option>
            </select>
          </div>

          <!-- Clear Filters -->
          <div class="flex items-end">
            <button
              @click="clearFilters"
              class="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      <!-- Orders Table -->
      <div
        class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        <div v-if="loading" class="p-8 text-center">
          <div
            class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
          ></div>
          <p class="mt-2 text-gray-600">Đang tải đơn hàng...</p>
        </div>

        <div v-else-if="error" class="p-8 text-center text-red-600">
          <p>❌ {{ error }}</p>
          <button
            @click="fetchOrders"
            class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>

        <div v-else>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Mã đơn hàng
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Khách hàng
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Ngày đặt
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Tổng tiền
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Trạng thái
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="order in filteredOrders"
                  :key="order._id"
                  class="hover:bg-gray-50"
                >
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                  >
                    #{{ order._id.slice(-8).toUpperCase() }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {{ order.user_id?.name || "N/A" }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ order.user_id?.email || "N/A" }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(order.createdAt) }}
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                  >
                    {{ formatCurrency(order.total_amount || 0) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="getStatusColor(order.status)"
                      class="px-2 py-1 text-xs font-medium rounded-full"
                    >
                      {{ getStatusText(order.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <button
                        @click="viewOrderDetail(order)"
                        class="text-blue-600 hover:text-blue-900"
                        title="Xem chi tiết"
                      >
                        👁️
                      </button>
                      <button
                        @click="handleStatusChange(order)"
                        class="text-green-600 hover:text-green-900"
                        title="Thay đổi trạng thái"
                      >
                        ✏️
                      </button>
                      <button
                        @click="printOrder(order)"
                        class="text-purple-600 hover:text-purple-900"
                        title="In đơn hàng"
                      >
                        🖨️
                      </button>
                      <button
                        @click="deleteOrder(order)"
                        class="text-red-600 hover:text-red-900"
                        title="Xóa đơn hàng"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div
            v-if="filteredOrders.length === 0"
            class="p-8 text-center text-gray-500"
          >
            📦 Không tìm thấy đơn hàng nào
          </div>

          <!-- Pagination -->
          <div
            v-if="pagination.totalPages > 1"
            class="bg-gray-50 px-6 py-3 flex items-center justify-between text-sm text-gray-700"
          >
            <div>
              Hiển thị
              {{ (pagination.currentPage - 1) * pagination.limit + 1 }}
              –
              {{
                Math.min(
                  pagination.currentPage * pagination.limit,
                  pagination.total
                )
              }}
              trong tổng số {{ pagination.total }} đơn hàng
            </div>

            <div class="flex space-x-2">
              <button
                @click="prevPage"
                :disabled="pagination.currentPage === 1"
                class="px-3 py-1 border rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Trước
              </button>

              <button
                v-for="page in Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                )"
                :key="page"
                @click="goToPage(page)"
                :class="[
                  'px-3 py-1 border rounded-md',
                  pagination.currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-white hover:bg-gray-50',
                ]"
              >
                {{ page }}
              </button>

              <button
                @click="nextPage"
                :disabled="pagination.currentPage === pagination.totalPages"
                class="px-3 py-1 border rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal cập nhật trạng thái -->
    <Teleport to="body">
      <div
        v-if="showStatusModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Cập nhật trạng thái đơn hàng
          </h3>

          <div class="space-y-4">
            <p class="text-sm text-gray-700">
              Đơn hàng: #{{ orderToUpdate?._id?.slice(-8).toUpperCase() }}
            </p>

            <div>
              <label
                for="newStatus"
                class="block text-sm font-medium text-gray-700 mb-2"
                >Trạng thái mới</label
              >
              <select
                id="newStatus"
                v-model="newStatus"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option
                  v-for="status in orderStatuses"
                  :key="status.value"
                  :value="status.value"
                >
                  {{ status.label }}
                </option>
              </select>
            </div>

            <div>
              <label
                for="statusNote"
                class="block text-sm font-medium text-gray-700 mb-2"
                >Ghi chú (tùy chọn)</label
              >
              <textarea
                id="statusNote"
                v-model="statusNote"
                rows="3"
                placeholder="Nhập ghi chú về việc thay đổi trạng thái..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button
              @click="cancelStatusUpdate"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Hủy
            </button>
            <button
              @click="confirmStatusUpdate"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Cập nhật
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </AdminLayout>
</template>
