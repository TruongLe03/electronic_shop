<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import AdminLayout from "@components/admin/AdminLayout.vue";
import { getInventoryById, updateInventory } from "@api/adminService.js";
import { useNotification } from "@composables/useNotification.js";

const route = useRoute();
const router = useRouter();
const { showSuccess, showError } = useNotification();

const inventory = ref(null);
const loading = ref(true);
const updating = ref(false);
const newStock = ref(0);

onMounted(() => {
  loadInventory();
});

const loadInventory = async () => {
  try {
    loading.value = true;
    const res = await getInventoryById(route.params.id);
    inventory.value = res.data.inventory;
    newStock.value = inventory.value?.stock || 0;
  } catch (e) {
    showError("Không thể tải chi tiết tồn kho");
    router.push("/admin/inventory");
  } finally {
    loading.value = false;
  }
};

const handleUpdate = async () => {
  try {
    updating.value = true;
    await updateInventory(inventory.value._id, { stock: newStock.value });
    showSuccess("Cập nhật tồn kho thành công");
    loadInventory();
  } catch (e) {
    showError("Cập nhật tồn kho thất bại");
  } finally {
    updating.value = false;
  }
};
</script>
<template>
  <AdminLayout
    title="Chi tiết Tồn kho"
    subtitle="Xem và cập nhật số lượng"
    icon="fas fa-boxes"
  >
    <div
      v-if="loading"
      class="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 text-center animate-pulse"
    >
      <div class="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
      <div class="h-4 bg-gray-200 rounded w-1/3 mx-auto mb-2"></div>
      <div class="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
    </div>
    <div
      v-else-if="inventory"
      class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
    >
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-6">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center">
            <i class="fas fa-box text-white text-2xl"></i>
          </div>
          <div>
            <div class="text-xl font-bold text-indigo-700">
              {{ inventory.product_id?.name || 'Sản phẩm đã xóa' }}
            </div>
            <div class="text-sm text-gray-500">SKU: {{ inventory.sku }}</div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span
            v-if="inventory.stock > 10"
            class="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700"
          >
            <i class="fas fa-check-circle mr-1"></i> Còn hàng
          </span>
          <span
            v-else-if="inventory.stock > 0"
            class="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700"
          >
            <i class="fas fa-exclamation-circle mr-1"></i> Sắp hết hàng
          </span>
          <span
            v-else
            class="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700"
          >
            <i class="fas fa-times-circle mr-1"></i> Hết hàng
          </span>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Số lượng tồn kho</label>
          <input
            type="number"
            v-model.number="newStock"
            :min="0"
            :max="100000"
            class="w-32 px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div class="flex items-end gap-4 mt-6 md:mt-0">
          <button
            @click="handleUpdate"
            :disabled="updating"
            class="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <i v-if="!updating" class="fas fa-save mr-2" />
            <svg v-else class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            Lưu
          </button>
          <button
            @click="router.push('/admin/inventory')"
            class="px-6 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 text-gray-700 flex items-center"
          >
            <i class="fas fa-arrow-left mr-2" /> Quay lại
          </button>
        </div>
      </div>
    </div>
    <div
      v-else
      class="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-600"
    >
      <div class="text-5xl mb-3">❌</div>
      Không tìm thấy tồn kho.
    </div>
  </AdminLayout>
</template>
