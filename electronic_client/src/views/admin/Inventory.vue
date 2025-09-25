<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import AdminLayout from "@components/admin/AdminLayout.vue";
import { useAuthStore } from "@stores/auth.js";
import { getAllInventory, updateInventory } from "@api/adminService.js";
import { useNotification } from "@composables/useNotification.js";
import { usePagination } from "@composables/usePagination.js";

const router = useRouter();
const authStore = useAuthStore();
const { showError, showSuccess } = useNotification();

const loading = ref(false);
const inventory = ref([]);
const search = ref("");
const itemsPerPage = ref(10);
const { currentPage, totalItems, updateTotal, reset } = usePagination(
  itemsPerPage.value
);

const totalPagesCalc = computed(() =>
  Math.max(1, Math.ceil((totalItems.value || 0) / (itemsPerPage.value || 1)))
);

onMounted(() => {
  if (!authStore.isAuthenticated || authStore.user?.role !== "admin") {
    router.push("/login");
    return;
  }
  loadInventory();
});

watch([itemsPerPage], () => {
  reset();
  loadInventory();
});

const loadInventory = async () => {
  try {
    loading.value = true;
    const params = {
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: search.value || undefined,
    };
    const res = await getAllInventory(params);
    inventory.value = res.data.inventory || [];
    updateTotal(res.data.pagination?.totalItems || 0);
  } catch (e) {
    showError("Không thể tải danh sách tồn kho");
    inventory.value = [];
    updateTotal(0);
  } finally {
    loading.value = false;
  }
};

const goTo = async (page) => {
  const p = Math.min(Math.max(1, page), totalPagesCalc.value);
  if (p !== currentPage.value) currentPage.value = p;
  await loadInventory();
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
  loadInventory();
};
const clearFilters = () => {
  search.value = "";
  reset();
  loadInventory();
};

const goDetail = (id) => router.push(`/admin/inventory/${id}`);

const quickUpdate = async (id, newStock) => {
  try {
    await updateInventory(id, { stock: newStock });
    showSuccess("Cập nhật tồn kho thành công");
    loadInventory();
  } catch (e) {
    showError("Cập nhật tồn kho thất bại");
  }
};
</script>
<template>
  <AdminLayout
    title="Quản lý Tồn kho"
    subtitle="Danh sách, tìm kiếm, cập nhật nhanh"
    icon="fas fa-warehouse"
  >
    <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2"
            ><i class="fas fa-search mr-1" /> Tìm kiếm</label
          >
          <div class="relative">
            <input
              v-model="search"
              type="text"
              placeholder="Tên sản phẩm, SKU..."
              @keyup.enter="handleSearch"
              class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <i
              class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>
      </div>
      <div class="mt-4 flex items-center justify-between">
        <div class="text-sm text-gray-500">
          Tổng:
          <span class="font-medium text-gray-900">{{ totalItems }}</span> sản
          phẩm
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
      <div v-if="inventory.length" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left">Sản phẩm</th>
              <th class="px-4 py-3 text-left">SKU</th>
              <th class="px-4 py-3 text-left">Tồn kho</th>
              <th class="px-4 py-3 text-left">Cập nhật nhanh</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in inventory"
              :key="item._id"
              class="hover:bg-gray-50"
            >
              <td class="px-4 py-3 font-medium">
                {{ item.product_id?.name || "Sản phẩm đã xóa" }}
              </td>
              <td class="px-4 py-3">{{ item.sku }}</td>
              <td class="px-4 py-3 font-semibold text-indigo-700">
                {{ item.stock }}
              </td>
              <td class="px-4 py-3">
                <input
                  type="number"
                  :min="0"
                  :max="100000"
                  :value="item.stock"
                  @change="(e) => quickUpdate(item._id, +e.target.value)"
                  class="w-24 px-2 py-1 border border-gray-200 rounded-lg"
                />
              </td>
              <td class="px-4 py-3 text-right">
                <button
                  @click="goDetail(item._id)"
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
        <div class="text-5xl mb-3">🏬</div>
        Không có sản phẩm tồn kho nào khớp bộ lọc.
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
          v-for="p in totalPagesCalc"
          :key="p"
          @click="goTo(p)"
          :class="[
            'px-3 py-2 border rounded-lg hover:bg-gray-50',
            currentPage === p
              ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
              : '',
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
