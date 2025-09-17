<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Quản lý đơn hàng</h1>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-8">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"
      ></div>
      <p class="mt-2 text-gray-600">Đang tải...</p>
    </div>

    <!-- Orders Table -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
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
                Ngày đặt
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="order in orders" :key="order._id">
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
              >
                {{ order.orderId }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ order.customer?.name }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ order.customer?.email }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatPrice(order.totalAmount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="getStatusClass(order.status)"
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                >
                  {{ getStatusText(order.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(order.createdAt) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state -->
      <div v-if="orders.length === 0" class="text-center py-12">
        <p class="text-gray-500">Không có đơn hàng nào</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth.js";
import axios from "axios";

const router = useRouter();
const authStore = useAuthStore();

// Reactive data
const orders = ref([]);
const loading = ref(false);

const orderStatuses = ref([
  {
    value: "pending",
    label: "Chờ xử lý",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "confirmed",
    label: "Đã xác nhận",
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "paid",
    label: "Đã thanh toán",
    color: "bg-green-100 text-green-800",
  },
  {
    value: "processing",
    label: "Đang xử lý",
    color: "bg-purple-100 text-purple-800",
  },
  {
    value: "shipping",
    label: "Đang giao",
    color: "bg-indigo-100 text-indigo-800",
  },
  {
    value: "delivered",
    label: "Đã giao",
    color: "bg-green-100 text-green-800",
  },
  { value: "cancelled", label: "Đã hủy", color: "bg-red-100 text-red-800" },
]);

onMounted(async () => {
  if (!authStore.isAuthenticated || authStore.user?.role !== "admin") {
    router.push("/login");
    return;
  }

  await loadOrders();
});

// Load orders
const loadOrders = async () => {
  loading.value = true;
  try {
    const response = await axios.get("/api/orders", {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    orders.value = response.data.orders || [];
  } catch (error) {
    console.error("Load orders error:", error);
  } finally {
    loading.value = false;
  }
};

// Helper functions
const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("vi-VN");
};

const getStatusClass = (status) => {
  const statusObj = orderStatuses.value.find((s) => s.value === status);
  return statusObj?.color || "bg-gray-100 text-gray-800";
};

const getStatusText = (status) => {
  const statusObj = orderStatuses.value.find((s) => s.value === status);
  return statusObj?.label || status;
};
</script>
