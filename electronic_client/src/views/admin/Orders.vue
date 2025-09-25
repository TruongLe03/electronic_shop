<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import AdminLayout from "@components/admin/AdminLayout.vue";
import { useAuthStore } from "@stores/auth.js";
import { getAllOrders } from "@api/adminService.js";
import { useNotification } from "@composables/useNotification.js";
import { usePagination } from "@composables/usePagination.js";

const router = useRouter();
const authStore = useAuthStore();
const { showError } = useNotification();

const loading = ref(false);
const orders = ref([]);
const search = ref("");
const statusFilter = ref("");
const paymentStatusFilter = ref("");
const itemsPerPage = ref(10);
const { currentPage, totalItems, updateTotal, reset } = usePagination(
  itemsPerPage.value
);

const totalPagesCalc = computed(() =>
  Math.max(1, Math.ceil((totalItems.value || 0) / (itemsPerPage.value || 1)))
);
const visiblePagesCalc = computed(() => {
  const total = totalPagesCalc.value;
  const current = currentPage.value;
  const pages = [];
  if (total <= 10) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else if (current <= 3) {
    for (let i = 1; i <= 3; i++) pages.push(i);
    if (total > 4) pages.push("...");
    pages.push(total);
  } else if (current >= total - 2) {
    pages.push(1);
    if (total > 4) pages.push("...");
    for (let i = total - 2; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 4) pages.push("...");
    for (let i = current - 1; i <= current + 1; i++) pages.push(i);
    if (current < total - 3) pages.push("...");
    pages.push(total);
  }
  return pages;
});

const statusOptions = [
  { value: "", label: "Tất cả" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "processing", label: "Đang xử lý" },
  { value: "shipping", label: "Đang giao" },
  { value: "delivered", label: "Đã giao" },
  { value: "cancelled", label: "Đã hủy" },
];
const paymentStatusOptions = [
  { value: "", label: "Tất cả" },
  { value: "pending", label: "Chưa thanh toán" },
  { value: "paid", label: "Đã thanh toán" },
  { value: "failed", label: "Thất bại" },
];

onMounted(() => {
  if (!authStore.isAuthenticated || authStore.user?.role !== "admin") {
    router.push("/login");
    return;
  }
  loadOrders();
});

watch([statusFilter, paymentStatusFilter, itemsPerPage], () => {
  reset();
  loadOrders();
});

const loadOrders = async () => {
  try {
    loading.value = true;
    const params = {
      page: currentPage.value,
      limit: itemsPerPage.value,
      status: statusFilter.value || undefined,
      paymentStatus: paymentStatusFilter.value || undefined,
      search: search.value || undefined,
    };
    const res = await getAllOrders(params);
    orders.value = res.data.orders || [];
    updateTotal(res.data.pagination?.totalItems || 0);
  } catch (e) {
    showError("Không thể tải danh sách đơn hàng");
    orders.value = [];
    updateTotal(0);
  } finally {
    loading.value = false;
  }
};

const goTo = async (page) => {
  const p = Math.min(Math.max(1, page), totalPagesCalc.value);
  if (p !== currentPage.value) currentPage.value = p;
  await loadOrders();
  window.scrollTo({ top: 0, behavior: "smooth" });
};
const prev = async () => {
  if (currentPage.value > 1) await goTo(currentPage.value - 1);
};
const next = async () => {
  if (currentPage.value < totalPagesCalc.value)
    await goTo(currentPage.value + 1);
};

const handleSearch = () => {
  reset();
  loadOrders();
};
const clearFilters = () => {
  search.value = "";
  statusFilter.value = "";
  paymentStatusFilter.value = "";
  reset();
  loadOrders();
};

const goDetail = (id) => router.push(`/admin/orders/${id}`);
const formatCurrency = (amount) => {
  if (amount == null || isNaN(amount)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};
const formatDate = (date) =>
  date ? new Date(date).toLocaleString("vi-VN") : "";
</script>
<template>
  <AdminLayout
    title="Quản lý Đơn hàng"
    subtitle="Danh sách, lọc, phân trang và thao tác"
    icon="fas fa-clipboard-list"
  >
    <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2"
            ><i class="fas fa-search mr-1" /> Tìm kiếm</label
          >
          <div class="relative">
            <input
              v-model="search"
              type="text"
              placeholder="Tên, email, mã đơn..."
              @keyup.enter="handleSearch"
              class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <i
              class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Trạng thái</label
          >
          <select
            v-model="statusFilter"
            class="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
          >
            <option v-for="s in statusOptions" :key="s.value" :value="s.value">
              {{ s.label }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Thanh toán</label
          >
          <select
            v-model="paymentStatusFilter"
            class="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
          >
            <option
              v-for="s in paymentStatusOptions"
              :key="s.value"
              :value="s.value"
            >
              {{ s.label }}
            </option>
          </select>
        </div>
      </div>
      <div class="mt-4 flex items-center justify-between">
        <div class="text-sm text-gray-500">
          Tổng:
          <span class="font-medium text-gray-900">{{ totalItems }}</span> đơn
          hàng
        </div>
        <div class="flex items-center gap-3">
          <label class="text-sm text-gray-700">Hiển thị</label>
          <select
            v-model.number="itemsPerPage"
            class="px-2 py-1 border border-gray-200 rounded-lg"
          >
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
          <button
            @click="clearFilters"
            class="px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50"
          >
            <i class="fas fa-times mr-2" /> Xóa lọc
          </button>
        </div>
      </div>
    </div>
    <div
      v-if="loading"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <div
        v-for="i in 6"
        :key="i"
        class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse"
      >
        <div class="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div class="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div class="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
    <div v-else>
      <div v-if="orders.length" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left">Mã đơn</th>
              <th class="px-4 py-3 text-left">Khách hàng</th>
              <th class="px-4 py-3 text-left">Tổng tiền</th>
              <th class="px-4 py-3 text-left">Trạng thái</th>
              <th class="px-4 py-3 text-left">Thanh toán</th>
              <th class="px-4 py-3 text-left">Ngày tạo</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in orders" :key="o._id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-medium">#{{ o._id }}</td>
              <td class="px-4 py-3">
                {{ o.user_id?.name || o.user_id?.email || "Khách" }}
              </td>
              <td class="px-4 py-3 font-semibold text-indigo-700">
                {{ formatCurrency(o.total) }}
              </td>
              <td class="px-4 py-3">
                <span
                  :class="{
                    'bg-yellow-100 text-yellow-700': o.status === 'pending',
                    'bg-blue-100 text-blue-700':
                      o.status === 'confirmed' || o.status === 'processing',
                    'bg-orange-100 text-orange-700': o.status === 'shipping',
                    'bg-green-100 text-green-700': o.status === 'delivered',
                    'bg-red-100 text-red-700': o.status === 'cancelled',
                  }"
                  class="px-2 py-1 rounded-full text-xs font-semibold"
                >
                  {{
                    statusOptions.find((s) => s.value === o.status)?.label ||
                    o.status
                  }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span
                  :class="{
                    'bg-yellow-100 text-yellow-700':
                      o.payment_status === 'pending',
                    'bg-green-100 text-green-700': o.payment_status === 'paid',
                    'bg-red-100 text-red-700': o.payment_status === 'failed',
                  }"
                  class="px-2 py-1 rounded-full text-xs font-semibold"
                >
                  {{
                    paymentStatusOptions.find(
                      (s) => s.value === o.payment_status
                    )?.label || o.payment_status
                  }}
                </span>
              </td>
              <td class="px-4 py-3">{{ formatDate(o.createdAt) }}</td>
              <td class="px-4 py-3 text-right">
                <button
                  @click="goDetail(o._id)"
                  class="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  <i class="fas fa-eye mr-1" /> Xem
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        v-else
        class="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-600"
      >
        <div class="text-5xl mb-3">📦</div>
        Không có đơn hàng nào khớp bộ lọc.
      </div>
      <div
        v-if="totalPagesCalc > 1"
        class="mt-8 flex items-center justify-center gap-2"
      >
        <button
          @click="prev"
          :disabled="currentPage === 1"
          class="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <i class="fas fa-chevron-left" />
        </button>
        <button
          v-for="p in visiblePagesCalc"
          :key="p"
          @click="typeof p === 'number' && goTo(p)"
          :disabled="p === '...'"
          :class="[
            'px-3 py-2 border rounded-lg hover:bg-gray-50',
            currentPage === p
              ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
              : '',
            p === '...' ? 'cursor-default' : '',
          ]"
        >
          {{ p }}
        </button>
        <button
          @click="next"
          :disabled="currentPage === totalPagesCalc"
          class="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <i class="fas fa-chevron-right" />
        </button>
      </div>
    </div>
  </AdminLayout>
</template>
