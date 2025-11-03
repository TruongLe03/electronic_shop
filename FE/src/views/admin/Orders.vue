<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";
import { useAdminOrders } from "@/composables/admin/useAdminOrders.js";
import AdminLayout from "@/layout/AdminLayout.vue";
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
  deleteOrder,
  deleteBulkOrders,
  goToPage,
  nextPage,
  prevPage,
  applyFilters,
  clearFilters,
  getStatusColor,
  getStatusText,
  getPaymentStatusColor,
  getPaymentStatusText,
  getPaymentMethodText,
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

// --- DELETE MODAL STATE ---
const showDeleteModal = ref(false);
const orderToDelete = ref(null);
const selectedOrders = ref(new Set());
const showBulkDeleteModal = ref(false);
const selectAllChecked = ref(false);

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
    pendingOrders: all.filter((o) => o.status === "pending").length,
    completedOrders: all.filter((o) => o.status === "delivered").length,
    totalRevenue: all
      .filter((o) => o.status === "delivered")
      .reduce((sum, o) => sum + (o.total || 0), 0),
  };
});

// --- SELECTION METHODS ---
const selectedOrdersCount = computed(() => selectedOrders.value.size);

const canDeleteSelected = computed(() => {
  if (selectedOrders.value.size === 0) return false;

  const selectedOrdersList = Array.from(selectedOrders.value);
  return selectedOrdersList.every((orderId) => {
    const order = orders.value.find((o) => o._id === orderId);
    return order && ["pending", "cancelled"].includes(order.status);
  });
});

const toggleSelectAll = () => {
  if (selectAllChecked.value) {
    selectedOrders.value.clear();
  } else {
    filteredOrders.value
      .filter((order) => ["pending", "cancelled"].includes(order.status))
      .forEach((order) => selectedOrders.value.add(order._id));
  }
  selectAllChecked.value = !selectAllChecked.value;
};

const toggleSelectOrder = (orderId) => {
  if (selectedOrders.value.has(orderId)) {
    selectedOrders.value.delete(orderId);
  } else {
    selectedOrders.value.add(orderId);
  }

  // Update select all checkbox
  const deletableOrders = filteredOrders.value.filter((order) =>
    ["pending", "cancelled"].includes(order.status)
  );
  selectAllChecked.value =
    deletableOrders.length > 0 &&
    deletableOrders.every((order) => selectedOrders.value.has(order._id));
};

const isOrderSelected = (orderId) => selectedOrders.value.has(orderId);

const canSelectOrder = (order) =>
  ["pending", "cancelled"].includes(order.status);

// --- DELETE METHODS ---
const showDeleteConfirmation = (order) => {
  orderToDelete.value = order;
  showDeleteModal.value = true;
};

const showBulkDeleteConfirmation = () => {
  if (selectedOrders.value.size === 0) return;
  showBulkDeleteModal.value = true;
};

const confirmDelete = async () => {
  try {
    await deleteOrder(orderToDelete.value._id);
    showDeleteModal.value = false;
    orderToDelete.value = null;

    // Remove from selection if it was selected
    selectedOrders.value.delete(orderToDelete.value?._id);
  } catch (err) {
    console.error("Error deleting order:", err);
    alert(
      "Có lỗi xảy ra khi xóa đơn hàng: " + (err.message || "Lỗi không xác định")
    );
  }
};

const confirmBulkDelete = async () => {
  try {
    const selectedOrdersList = Array.from(selectedOrders.value);

    // Use the bulk delete method from composable
    await deleteBulkOrders(selectedOrdersList);

    // Clear selection
    selectedOrders.value.clear();
    selectAllChecked.value = false;
    showBulkDeleteModal.value = false;
  } catch (err) {
    console.error("Error bulk deleting orders:", err);
    alert(
      "Có lỗi xảy ra khi xóa đơn hàng: " + (err.message || "Lỗi không xác định")
    );
  }
};

const cancelDelete = () => {
  showDeleteModal.value = false;
  orderToDelete.value = null;
};

const cancelBulkDelete = () => {
  showBulkDeleteModal.value = false;
};

// --- OTHER METHODS ---
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
          icon="fas fa-shopping-cart"
          color="blue"
        />
        <ModernStatsCard
          title="Đang xử lý"
          :value="stats.pendingOrders"
          icon="fas fa-hourglass-half"
          color="yellow"
        />
        <ModernStatsCard
          title="Hoàn thành"
          :value="stats.completedOrders"
          icon="fas fa-check-circle"
          color="green"
        />
        <ModernStatsCard
          title="Doanh thu"
          :value="formatCurrency(stats.totalRevenue)"
          icon="fas fa-dollar-sign"
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
                :key="status"
                :value="status"
              >
                {{ getStatusText(status) }}
              </option>
            </select>
          </div>

          <!-- Bulk Actions -->
          <div class="flex items-end">
            <div
              v-if="selectedOrdersCount > 0"
              class="flex items-center gap-3 w-full"
            >
              <div class="text-sm text-gray-600 flex-1">
                Đã chọn: {{ selectedOrdersCount }} đơn hàng
              </div>
              <button
                v-if="canDeleteSelected"
                @click="showBulkDeleteConfirmation"
                class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <i class="fas fa-trash text-sm"></i>
                Xóa đã chọn
              </button>
            </div>
            <div v-else>
              <button
                @click="clearFilters"
                class="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
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
          <div class="mb-4">
            <i class="fas fa-exclamation-triangle text-4xl"></i>
          </div>
          <p class="mb-4">{{ error }}</p>
          <button
            @click="fetchOrders"
            class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <i class="fas fa-redo mr-2"></i>
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
                    <input
                      type="checkbox"
                      :checked="selectAllChecked"
                      @change="toggleSelectAll"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
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
                    Trạng thái đơn hàng
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Trạng thái thanh toán
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
                  :class="{ 'bg-blue-50': isOrderSelected(order._id) }"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <input
                      v-if="canSelectOrder(order)"
                      type="checkbox"
                      :checked="isOrderSelected(order._id)"
                      @change="toggleSelectOrder(order._id)"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span v-else class="inline-block w-4 h-4"></span>
                  </td>
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
                    {{ formatCurrency(order.total || 0) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="getStatusColor(order.status)"
                      class="px-2 py-1 text-xs font-medium rounded-full"
                    >
                      {{ getStatusText(order.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="getPaymentStatusColor(order.payment_status)"
                      class="px-2 py-1 text-xs font-medium rounded-full"
                    >
                      {{ getPaymentStatusText(order.payment_status) }}
                    </span>
                    <div v-if="order.payment_method" class="text-xs text-gray-500 mt-1">
                      {{ getPaymentMethodText(order.payment_method) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <button
                        @click="viewOrderDetail(order)"
                        class="text-blue-600 hover:text-blue-900 p-1"
                        title="Xem chi tiết"
                      >
                        <i class="fas fa-eye"></i>
                      </button>
                      <button
                        @click="handleStatusChange(order)"
                        class="text-green-600 hover:text-green-900 p-1"
                        title="Thay đổi trạng thái"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button
                        @click="printOrder(order)"
                        class="text-purple-600 hover:text-purple-900 p-1"
                        title="In đơn hàng"
                      >
                        <i class="fas fa-print"></i>
                      </button>
                      <button
                        v-if="['pending', 'cancelled'].includes(order.status)"
                        @click="showDeleteConfirmation(order)"
                        class="text-red-600 hover:text-red-900 p-1"
                        title="Xóa đơn hàng"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                      <button
                        v-else
                        class="text-gray-400 p-1 cursor-not-allowed"
                        title="Không thể xóa đơn hàng này"
                        disabled
                      >
                        <i class="fas fa-trash"></i>
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
            <i class="fas fa-box-open text-4xl mb-2"></i>
            <p>Không tìm thấy đơn hàng nào</p>
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
        class="fixed inset-0 flex items-center justify-center z-50"
      >
        <div
          class="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl border"
        >
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
                  :key="status"
                  :value="status"
                >
                  {{ getStatusText(status) }}
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

    <!-- Modal xác nhận xóa đơn lẻ -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 flex items-center justify-center z-50"
      >
        <div
          class="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl border"
        >
          <div class="flex items-center mb-4">
            <div class="flex-shrink-0">
              <i class="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
            </div>
            <div class="ml-3">
              <h3 class="text-lg font-semibold text-gray-900">
                Xác nhận xóa đơn hàng
              </h3>
            </div>
          </div>

          <div class="mb-6">
            <p class="text-sm text-gray-700 mb-2">
              Bạn có chắc chắn muốn xóa đơn hàng sau?
            </p>
            <div class="bg-gray-50 p-3 rounded-md">
              <p class="font-medium text-gray-900">
                #{{ orderToDelete?._id?.slice(-8).toUpperCase() }}
              </p>
              <p class="text-sm text-gray-600">
                Khách hàng: {{ orderToDelete?.user_id?.name }}
              </p>
              <p class="text-sm text-gray-600">
                Tổng tiền: {{ formatCurrency(orderToDelete?.total || 0) }}
              </p>
            </div>
            <p class="text-xs text-red-600 mt-2">
              <i class="fas fa-info-circle"></i>
              Hành động này không thể hoàn tác.
            </p>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              @click="cancelDelete"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Hủy
            </button>
            <button
              @click="confirmDelete"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <i class="fas fa-trash mr-2"></i>
              Xóa đơn hàng
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal xác nhận xóa hàng loạt -->
    <Teleport to="body">
      <div
        v-if="showBulkDeleteModal"
        class="fixed inset-0 flex items-center justify-center z-50"
      >
        <div
          class="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl border"
        >
          <div class="flex items-center mb-4">
            <div class="flex-shrink-0">
              <i class="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
            </div>
            <div class="ml-3">
              <h3 class="text-lg font-semibold text-gray-900">
                Xác nhận xóa hàng loạt
              </h3>
            </div>
          </div>

          <div class="mb-6">
            <p class="text-sm text-gray-700 mb-2">
              Bạn có chắc chắn muốn xóa
              <span class="font-semibold text-red-600">{{
                selectedOrdersCount
              }}</span>
              đơn hàng đã chọn?
            </p>
            <div class="bg-gray-50 p-3 rounded-md max-h-32 overflow-y-auto">
              <div
                v-for="orderId in Array.from(selectedOrders)"
                :key="orderId"
                class="text-sm text-gray-700 mb-1"
              >
                {{
                  orders
                    .find((o) => o._id === orderId)
                    ?._id?.slice(-8)
                    .toUpperCase() || "N/A"
                }}
              </div>
            </div>
            <p class="text-xs text-red-600 mt-2">
              <i class="fas fa-info-circle"></i>
              Hành động này không thể hoàn tác.
            </p>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              @click="cancelBulkDelete"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Hủy
            </button>
            <button
              @click="confirmBulkDelete"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <i class="fas fa-trash mr-2"></i>
              Xóa {{ selectedOrdersCount }} đơn hàng
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </AdminLayout>
</template>
