<template>
  <AdminLayout>
    <div class="p-6">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-center gap-4 mb-4">
          <button
            @click="$router.back()"
            class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <i class="fas fa-arrow-left text-lg"></i>
          </button>
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Chi tiết đơn hàng</h1>
            <p class="text-gray-600">Quản lý thông tin đơn hàng chi tiết</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex justify-center items-center min-h-[400px]"
      >
        <div class="text-center">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
          ></div>
          <p class="text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
      >
        <div
          class="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center"
        >
          <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
        </div>
        <h2 class="text-xl font-semibold text-red-800 mb-2">
          Không thể tải thông tin đơn hàng
        </h2>
        <p class="text-red-600 mb-4">{{ error }}</p>
        <button
          @click="fetchOrderDetail"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Thử lại
        </button>
      </div>

      <!-- Order Detail Content -->
      <div v-else-if="order" class="space-y-6">
        <!-- Order Summary Card -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-1">
                Mã đơn hàng
              </h3>
              <p class="text-lg font-bold text-gray-900">
                #{{ order._id?.slice(-8).toUpperCase() }}
              </p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-1">Trạng thái</h3>
              <span
                :class="getStatusColor(order.status)"
                class="px-3 py-1 rounded-full text-sm font-medium"
              >
                {{ getStatusText(order.status) }}
              </span>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-1">Tổng tiền</h3>
              <p class="text-lg font-bold text-blue-600">
                {{ formatCurrency(order.total) }}
              </p>
            </div>
          </div>

          <div
            class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200"
          >
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-1">
                Ngày đặt hàng
              </h3>
              <p class="text-gray-900">{{ formatDate(order.createdAt) }}</p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-1">
                Phương thức thanh toán
              </h3>
              <p class="text-gray-900">
                {{ getPaymentMethodText(order.payment_method) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Payment Information -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">
            Thông tin thanh toán
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-1">
                  Trạng thái thanh toán
                </h3>
                <span
                  :class="getPaymentStatusColor(order.payment_status)"
                  class="px-3 py-1 rounded-full text-sm font-medium"
                >
                  {{ getPaymentStatusText(order.payment_status) }}
                </span>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-1">
                  Phương thức thanh toán
                </h3>
                <p class="text-gray-900">
                  {{ getPaymentMethodText(order.payment_method) }}
                </p>
              </div>
              <div v-if="order.payment_completed_at">
                <h3 class="text-sm font-medium text-gray-500 mb-1">
                  Thời gian thanh toán
                </h3>
                <p class="text-gray-900">
                  {{ formatDate(order.payment_completed_at) }}
                </p>
              </div>
            </div>
            <div class="space-y-4" v-if="order.payment_info">
              <div v-if="order.payment_info.transaction_id">
                <h3 class="text-sm font-medium text-gray-500 mb-1">
                  Mã giao dịch
                </h3>
                <p class="text-gray-900 font-mono text-sm">
                  {{ order.payment_info.transaction_id }}
                </p>
              </div>
              <div v-if="order.payment_info.vnpay_transaction_no">
                <h3 class="text-sm font-medium text-gray-500 mb-1">
                  Mã giao dịch VNPay
                </h3>
                <p class="text-gray-900 font-mono text-sm">
                  {{ order.payment_info.vnpay_transaction_no }}
                </p>
              </div>
              <div v-if="order.payment_info.vnpay_bank_code">
                <h3 class="text-sm font-medium text-gray-500 mb-1">
                  Ngân hàng
                </h3>
                <p class="text-gray-900">
                  {{ getBankName(order.payment_info.vnpay_bank_code) }}
                </p>
              </div>
              <div v-if="order.payment_info.vnpay_response_code">
                <h3 class="text-sm font-medium text-gray-500 mb-1">
                  Mã phản hồi VNPay
                </h3>
                <span
                  :class="order.payment_info.vnpay_response_code === '00' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'"
                  class="px-2 py-1 rounded text-sm font-mono"
                >
                  {{ order.payment_info.vnpay_response_code }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Customer Information -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">
            Thông tin khách hàng
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-1">Họ tên</h3>
                <p class="text-gray-900">{{ order.user_id?.name || "N/A" }}</p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-1">Email</h3>
                <p class="text-gray-900">{{ order.user_id?.email || "N/A" }}</p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-1">
                  Số điện thoại
                </h3>
                <p class="text-gray-900">
                  {{ order.shipping_address?.phone || "N/A" }}
                </p>
              </div>
            </div>
            <div class="space-y-4">
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-1">
                  Địa chỉ giao hàng
                </h3>
                <p class="text-gray-900">
                  {{ order.shipping_address?.address || "N/A" }}
                </p>
              </div>
              <div v-if="order.notes">
                <h3 class="text-sm font-medium text-gray-500 mb-1">
                  Ghi chú đơn hàng
                </h3>
                <p class="text-gray-900">{{ order.notes }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Sản phẩm đã đặt</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Sản phẩm
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Đơn giá
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Số lượng
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Thành tiền
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="item in order.products"
                  :key="item.productId || item._id"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <img
                        :src="getFullImage(item.image)"
                        :alt="item.name"
                        class="w-12 h-12 object-cover rounded-md mr-4"
                        @error="(e) => (e.target.src = getFullImage(null))"
                      />
                      <div>
                        <div class="text-sm font-medium text-gray-900">
                          {{ item.name }}
                        </div>
                        <div class="text-sm text-gray-500">
                          SKU: {{ item.productId || "N/A" }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatCurrency(item.discount_price || item.price) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ item.quantity }}
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                  >
                    {{
                      formatCurrency(
                        (item.discount_price || item.price) * item.quantity
                      )
                    }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Order Summary -->
          <div class="mt-6 pt-6 border-t border-gray-200">
            <div class="max-w-md ml-auto space-y-2">
              <div class="flex justify-between text-gray-600">
                <span>Tạm tính:</span>
                <span>{{ formatCurrency(calculateSubtotal()) }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Phí vận chuyển:</span>
                <span>{{ formatCurrency(order.shipping_fee || 30000) }}</span>
              </div>
              <hr class="border-gray-200" />
              <div class="flex justify-between text-lg font-bold text-gray-800">
                <span>Tổng cộng:</span>
                <span class="text-blue-600">{{
                  formatCurrency(order.total)
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Status Management -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">
            Quản lý trạng thái đơn hàng
          </h2>

          <!-- Status Update Form -->
          <div class="mb-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  for="newStatus"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >
                  Cập nhật trạng thái
                </label>
                <select
                  id="newStatus"
                  v-model="newStatus"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn trạng thái --</option>
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
                >
                  Ghi chú (tùy chọn)
                </label>
                <input
                  id="statusNote"
                  v-model="statusNote"
                  type="text"
                  placeholder="Nhập ghi chú..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div class="flex items-end">
                <button
                  @click="updateStatus"
                  :disabled="!newStatus || updating"
                  class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {{ updating ? "Đang cập nhật..." : "Cập nhật trạng thái" }}
                </button>
              </div>
            </div>
          </div>

          <!-- Status Timeline -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-3">
              Lịch sử trạng thái
            </h3>
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p class="font-medium text-gray-900">Đơn hàng được tạo</p>
                  <p class="text-sm text-gray-600">
                    {{ formatDate(order.createdAt) }}
                  </p>
                </div>
              </div>
              <div
                v-if="order.status !== 'pending'"
                class="flex items-center gap-3"
              >
                <div
                  :class="
                    order.status === 'cancelled' ? 'bg-red-500' : 'bg-green-500'
                  "
                  class="w-3 h-3 rounded-full"
                ></div>
                <div>
                  <p class="font-medium text-gray-900">
                    {{ getStatusText(order.status) }}
                  </p>
                  <p class="text-sm text-gray-600">
                    {{ formatDate(order.updatedAt) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex flex-col sm:flex-row gap-4">
            <button
              @click="printOrder"
              class="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              <i class="fas fa-print"></i>
              In đơn hàng
            </button>

            <button
              v-if="['pending', 'cancelled'].includes(order.status)"
              @click="deleteOrder"
              :disabled="deleting"
              class="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              <i class="fas fa-trash"></i>
              {{ deleting ? "Đang xóa..." : "Xóa đơn hàng" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAdminOrders } from "@/composables/admin/useAdminOrders.js";
import { getOrderById } from "@/api/adminService.js";
import { getFullImage } from "@/utils/imageUtils.js";
import AdminLayout from "@/layout/AdminLayout.vue";

const route = useRoute();
const router = useRouter();

// Composable
const {
  orderStatuses,
  updateOrderStatus,
  deleteOrder: deleteOrderFromComposable,
  getStatusColor,
  getStatusText,
  formatCurrency,
  formatDate,
} = useAdminOrders();

// State
const order = ref(null);
const loading = ref(true);
const error = ref("");
const updating = ref(false);
const deleting = ref(false);

// Form state
const newStatus = ref("");
const statusNote = ref("");

// Computed
const orderId = computed(() => route.params.id);

// Methods
const fetchOrderDetail = async () => {
  try {
    loading.value = true;
    error.value = "";

    const response = await getOrderById(orderId.value);
    if (response.success) {
      order.value = response.data;
      newStatus.value = order.value.status;
    } else {
      error.value = response.message || "Không thể tải thông tin đơn hàng";
    }
  } catch (err) {
    console.error("Error fetching order detail:", err);
    error.value = "Có lỗi xảy ra khi tải thông tin đơn hàng";
  } finally {
    loading.value = false;
  }
};

const updateStatus = async () => {
  if (!newStatus.value || newStatus.value === order.value.status) {
    alert("Vui lòng chọn trạng thái khác với trạng thái hiện tại");
    return;
  }

  try {
    updating.value = true;
    await updateOrderStatus(orderId.value, newStatus.value, statusNote.value);

    // Update local order data
    order.value.status = newStatus.value;
    order.value.updatedAt = new Date().toISOString();

    // Reset form
    statusNote.value = "";

    alert("Cập nhật trạng thái thành công!");
  } catch (err) {
    console.error("Error updating order status:", err);
    alert(
      "Có lỗi xảy ra khi cập nhật trạng thái: " +
        (err.message || "Lỗi không xác định")
    );
  } finally {
    updating.value = false;
  }
};

const deleteOrder = async () => {
  if (
    !confirm(
      `Bạn có chắc chắn muốn xóa đơn hàng #${order.value._id
        ?.slice(-8)
        .toUpperCase()}?`
    )
  ) {
    return;
  }

  try {
    deleting.value = true;
    await deleteOrderFromComposable(orderId.value);

    alert("Xóa đơn hàng thành công!");
    router.push("/admin/orders");
  } catch (err) {
    console.error("Error deleting order:", err);
    alert(
      "Có lỗi xảy ra khi xóa đơn hàng: " + (err.message || "Lỗi không xác định")
    );
  } finally {
    deleting.value = false;
  }
};

const printOrder = () => {
  console.log("Print order:", orderId.value);
  // TODO: Implement print functionality
  alert("Tính năng in đơn hàng sẽ được phát triển trong tương lai");
};

const calculateSubtotal = () => {
  if (!order.value?.products) return 0;
  return order.value.products.reduce((sum, item) => {
    const price = item.discount_price || item.price;
    return sum + price * item.quantity;
  }, 0);
};

const getPaymentMethodText = (method) => {
  const methodMap = {
    COD: "Thanh toán khi nhận hàng (COD)",
    cod: "Thanh toán khi nhận hàng (COD)",
    VNPay: "VNPay - Ví điện tử",
    vnpay: "VNPay - Ví điện tử",
    MoMo: "MoMo",
    momo: "MoMo",
    Bank: "Chuyển khoản ngân hàng",
    bank: "Chuyển khoản ngân hàng",
  };
  return methodMap[method] || method || "Không xác định";
};

const getPaymentStatusColor = (paymentStatus) => {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800", 
    failed: "bg-red-100 text-red-800",
    refunded: "bg-purple-100 text-purple-800",
  };
  return colors[paymentStatus] || "bg-gray-100 text-gray-800";
};

const getPaymentStatusText = (paymentStatus) => {
  const statusLabels = {
    pending: "Chờ thanh toán",
    completed: "Đã thanh toán",
    failed: "Thanh toán thất bại", 
    refunded: "Đã hoàn tiền",
  };
  return statusLabels[paymentStatus] || "Không xác định";
};

const getBankName = (bankCode) => {
  const bankNames = {
    'VNPAYQR': 'VNPay QR',
    'VNBANK': 'VNBank',
    'INTCARD': 'Thẻ quốc tế',
    'VISA': 'Visa',
    'MASTERCARD': 'Mastercard',
    'JCB': 'JCB',
    'UPI': 'UnionPay',
    'VCB': 'Vietcombank',
    'TCB': 'Techcombank',
    'MB': 'MB Bank',
    'VIB': 'VIB',
    'ICB': 'ICB',
    'BIDV': 'BIDV',
    'VBA': 'Agribank',
    'OCB': 'OCB',
    'SHB': 'SHB',
    'ACB': 'ACB',
    'MSB': 'MSB',
    'SACOMBANK': 'Sacombank',
    'EXIMBANK': 'Eximbank',
    'SCB': 'SCB',
    'VPB': 'VPBank',
  };
  return bankNames[bankCode] || bankCode;
};

// Lifecycle
onMounted(() => {
  if (!orderId.value) {
    error.value = "Mã đơn hàng không hợp lệ";
    loading.value = false;
    return;
  }

  fetchOrderDetail();
});
</script>
