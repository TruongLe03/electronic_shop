<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import AdminLayout from "@components/admin/AdminLayout.vue";
import { getOrderById, updateOrderStatus } from "@api/adminService.js";
import { useNotification } from "@composables/useNotification.js";

const route = useRoute();
const router = useRouter();
const { showSuccess, showError } = useNotification();

const order = ref(null);
const loading = ref(true);
const updating = ref(false);
const statusOptions = [
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "processing", label: "Đang xử lý" },
  { value: "shipping", label: "Đang giao" },
  { value: "delivered", label: "Đã giao" },
  { value: "cancelled", label: "Đã hủy" },
];

onMounted(() => {
  loadOrder();
});

const loadOrder = async () => {
  try {
    loading.value = true;
    const res = await getOrderById(route.params.id);
    order.value = res.data;
  } catch (e) {
    showError("Không thể tải chi tiết đơn hàng");
    router.push("/admin/orders");
  } finally {
    loading.value = false;
  }
};

const handleStatusChange = async (newStatus) => {
  if (!order.value || order.value.status === newStatus) return;
  try {
    updating.value = true;
    await updateOrderStatus(order.value._id, newStatus);
    order.value.status = newStatus;
    showSuccess("Cập nhật trạng thái thành công");
  } catch (e) {
    showError("Cập nhật trạng thái thất bại");
  } finally {
    updating.value = false;
  }
};

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
    title="Chi tiết Đơn hàng"
    subtitle="Xem và cập nhật trạng thái"
    icon="fas fa-file-invoice"
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
      v-else-if="order"
      class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
    >
      <div
        class="flex flex-col md:flex-row md:items-center md:justify-between mb-6"
      >
        <div>
          <div class="text-lg font-bold text-indigo-700">
            Mã đơn: #{{ order._id }}
          </div>
          <div class="text-sm text-gray-500">
            Ngày tạo: {{ formatDate(order.createdAt) }}
          </div>
        </div>
        <div class="mt-4 md:mt-0 flex items-center gap-3">
          <label class="text-sm font-medium text-gray-700">Trạng thái:</label>
          <select
            v-model="order.status"
            @change="handleStatusChange(order.status)"
            :disabled="updating"
            class="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
          >
            <option v-for="s in statusOptions" :key="s.value" :value="s.value">
              {{ s.label }}
            </option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div class="font-semibold mb-2">Khách hàng</div>
          <div class="bg-gray-50 rounded-xl p-4">
            <div>
              <span class="font-medium">Tên:</span>
              {{ order.user_id?.name || "Khách" }}
            </div>
            <div>
              <span class="font-medium">Email:</span>
              {{ order.user_id?.email || "-" }}
            </div>
            <div>
              <span class="font-medium">SĐT:</span>
              {{ order.shipping?.phone || "-" }}
            </div>
            <div>
              <span class="font-medium">Địa chỉ:</span>
              {{ order.shipping?.address || "-" }}
            </div>
          </div>
        </div>
        <div>
          <div class="font-semibold mb-2">Thanh toán</div>
          <div class="bg-gray-50 rounded-xl p-4">
            <div>
              <span class="font-medium">Trạng thái:</span>
              {{ order.payment_status }}
            </div>
            <div>
              <span class="font-medium">Phương thức:</span>
              {{ order.payment_method || "-" }}
            </div>
            <div>
              <span class="font-medium">Tổng tiền:</span>
              <span class="font-bold text-indigo-700">{{
                formatCurrency(order.total)
              }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-8">
        <div class="font-semibold mb-2">Sản phẩm</div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left">Tên sản phẩm</th>
                <th class="px-4 py-2 text-left">Số lượng</th>
                <th class="px-4 py-2 text-left">Đơn giá</th>
                <th class="px-4 py-2 text-left">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in order.products"
                :key="item.product_id || item._id"
              >
                <td class="px-4 py-2">
                  {{ item.name || "Sản phẩm đã xóa" }}
                </td>
                <td class="px-4 py-2">{{ item.quantity }}</td>
                <td class="px-4 py-2">{{ formatCurrency(item.price) }}</td>
                <td class="px-4 py-2 font-semibold">
                  {{ formatCurrency(item.price * item.quantity) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="mt-8 flex justify-end">
        <button
          @click="router.push('/admin/orders')"
          class="px-6 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 text-gray-700"
        >
          <i class="fas fa-arrow-left mr-2" /> Quay lại
        </button>
      </div>
    </div>
    <div
      v-else
      class="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-600"
    >
      <div class="text-5xl mb-3">❌</div>
      Không tìm thấy đơn hàng.
    </div>
  </AdminLayout>
</template>
