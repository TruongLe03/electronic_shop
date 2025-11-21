<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="container mx-auto px-4">
      <div class="max-w-2xl mx-auto">
        <!-- Loading State -->
        <div v-if="loading" class="text-center">
          <div
            class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
          ></div>
          <p class="mt-4 text-gray-600">
            Đang chuyển đến trang thanh toán SePay...
          </p>
          <p class="mt-2 text-sm text-gray-500">Vui lòng không tắt trang này</p>
        </div>

        <!-- Form submit (auto submit to SePay) -->
        <form
          v-if="checkoutUrl && fields"
          ref="sepayForm"
          :action="checkoutUrl"
          method="POST"
          class="hidden"
        >
          <input
            v-for="(value, key) in fields"
            :key="key"
            type="hidden"
            :name="key"
            :value="value"
          />
        </form>

        <!-- Transfer Info -->
        <div v-else-if="transferInfo" class="bg-white rounded-lg shadow-lg p-8">
          <div class="text-center mb-6">
            <h1 class="text-2xl font-bold text-gray-900 mb-2">
              Thông tin chuyển khoản
            </h1>
            <p class="text-gray-600">
              Vui lòng chuyển khoản theo thông tin bên dưới để hoàn tất đơn hàng
            </p>
          </div>

          <!-- QR Code -->
          <div v-if="transferInfo.qrCode" class="flex justify-center mb-6">
            <div class="bg-white p-4 rounded-lg border-2 border-gray-200">
              <img
                :src="transferInfo.qrCode"
                alt="QR Code chuyển khoản"
                class="w-64 h-64 object-contain"
              />
              <p class="text-center text-sm text-gray-600 mt-2">
                Quét mã QR để chuyển khoản
              </p>
            </div>
          </div>

          <!-- Transfer Details -->
          <div class="bg-gray-50 rounded-lg p-6 mb-6">
            <div class="space-y-4">
              <div class="flex justify-between">
                <span class="font-medium text-gray-700">Ngân hàng:</span>
                <span class="text-gray-900 font-semibold">{{ bankName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-medium text-gray-700">Số tài khoản:</span>
                <div class="flex items-center gap-2">
                  <span class="text-gray-900 font-mono font-semibold">
                    {{ transferInfo.accountNumber }}
                  </span>
                  <button
                    @click="copyToClipboard(transferInfo.accountNumber)"
                    class="text-blue-600 hover:text-blue-800"
                    title="Copy"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="flex justify-between">
                <span class="font-medium text-gray-700">Chủ tài khoản:</span>
                <span class="text-gray-900 font-semibold">
                  {{ transferInfo.accountName }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="font-medium text-gray-700">Số tiền:</span>
                <span class="text-red-600 font-bold text-xl">
                  {{ formatCurrency(transferInfo.amount) }}
                </span>
              </div>
              <div class="border-t pt-4">
                <div class="flex justify-between items-start">
                  <span class="font-medium text-gray-700">Nội dung CK:</span>
                  <div class="flex items-center gap-2">
                    <span class="text-gray-900 font-mono font-bold text-right">
                      {{ transferInfo.content }}
                    </span>
                    <button
                      @click="copyToClipboard(transferInfo.content)"
                      class="text-blue-600 hover:text-blue-800"
                      title="Copy"
                    >
                      <svg
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <p class="text-sm text-red-600 mt-2 font-medium">
                  ⚠️ Vui lòng nhập chính xác nội dung để hệ thống tự động xác
                  nhận thanh toán
                </p>
              </div>
            </div>
          </div>

          <!-- Order Info -->
          <div class="bg-blue-50 rounded-lg p-4 mb-6">
            <div class="flex items-start gap-3">
              <svg
                class="w-5 h-5 text-blue-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <div class="text-sm text-gray-700">
                <p class="font-medium mb-1">Lưu ý:</p>
                <ul class="list-disc list-inside space-y-1">
                  <li>
                    Sau khi chuyển khoản, đơn hàng sẽ tự động được xác nhận
                    trong vòng 1-2 phút
                  </li>
                  <li>
                    Vui lòng không tắt trang này để nhận thông báo xác nhận
                    thanh toán
                  </li>
                  <li>
                    Nếu sau 5 phút chưa được xác nhận, vui lòng liên hệ hỗ trợ
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Payment Status -->
          <div v-if="paymentStatus" class="mb-6">
            <div
              :class="[
                'p-4 rounded-lg flex items-center gap-3',
                paymentStatus === 'completed'
                  ? 'bg-green-100'
                  : 'bg-yellow-100',
              ]"
            >
              <div v-if="paymentStatus === 'completed'" class="text-green-600">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </div>
              <div v-else class="animate-spin text-yellow-600">
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  ></path>
                </svg>
              </div>
              <div class="flex-1">
                <p
                  :class="[
                    'font-medium',
                    paymentStatus === 'completed'
                      ? 'text-green-800'
                      : 'text-yellow-800',
                  ]"
                >
                  {{ paymentStatusText }}
                </p>
                <p
                  :class="[
                    'text-sm',
                    paymentStatus === 'completed'
                      ? 'text-green-600'
                      : 'text-yellow-600',
                  ]"
                >
                  {{ paymentStatusSubtext }}
                </p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="space-y-3">
            <button
              v-if="paymentStatus === 'completed'"
              @click="goToOrderDetail"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Xem chi tiết đơn hàng
            </button>

            <button
              v-else
              @click="checkStatus"
              :disabled="checkingStatus"
              class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              {{
                checkingStatus
                  ? "Đang kiểm tra..."
                  : "Kiểm tra trạng thái thanh toán"
              }}
            </button>

            <router-link
              to="/my-orders"
              class="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Xem tất cả đơn hàng
            </router-link>

            <router-link
              to="/"
              class="block w-full text-center text-blue-600 hover:text-blue-800 font-medium py-2 transition-colors"
            >
              Tiếp tục mua sắm
            </router-link>
          </div>
        </div>

        <!-- Error State -->
        <div v-else class="bg-white rounded-lg shadow-lg p-8 text-center">
          <div
            class="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center"
          >
            <svg
              class="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </div>

          <h1 class="text-2xl font-bold text-gray-900 mb-4">Có lỗi xảy ra</h1>
          <p class="text-gray-600 mb-6">
            {{ errorMessage || "Không thể tải thông tin chuyển khoản" }}
          </p>

          <div class="space-y-4">
            <router-link
              to="/my-orders"
              class="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Xem đơn hàng
            </router-link>

            <router-link
              to="/"
              class="inline-block w-full text-blue-600 hover:text-blue-800 font-medium py-2 transition-colors"
            >
              Về trang chủ
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useNotification } from "@/composables/client/useNotification";
import { createSepayPayment } from "@/api/sepayService";

const route = useRoute();
const router = useRouter();
const { showSuccess, showError } = useNotification();

// State
const loading = ref(true);
const checkoutUrl = ref("");
const fields = ref(null);
const errorMessage = ref("");
const orderId = ref("");
const sepayForm = ref(null);

// Bank names mapping
const bankNames = {
  MB: "MBBank - Ngân hàng Quân đội",
  VCB: "Vietcombank",
  TCB: "Techcombank",
  ACB: "ACB",
  VTB: "Vietinbank",
  // Add more banks as needed
};

const bankName = ref("");
const paymentStatusText = ref("Đang chờ thanh toán");
const paymentStatusSubtext = ref("Hệ thống đang kiểm tra giao dịch của bạn...");

// Format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

// Copy to clipboard
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    showSuccess("Đã copy vào clipboard");
  } catch (error) {
    console.error("Copy error:", error);
    showError("Không thể copy");
  }
};

// Check payment status
const checkStatus = async () => {
  if (!paymentId.value) return;

  checkingStatus.value = true;
  try {
    const response = await checkSepayPaymentStatus(paymentId.value);
    if (response.success) {
      const status = response.data.status;
      if (status === "completed") {
        paymentStatus.value = "completed";
        paymentStatusText.value = "Thanh toán thành công!";
        paymentStatusSubtext.value = "Đơn hàng của bạn đã được xác nhận";
        showSuccess("Thanh toán thành công!");
        stopStatusCheck();
      }
    }
  } catch (error) {
    console.error("Check status error:", error);
  } finally {
    checkingStatus.value = false;
  }
};

// Start auto check status
const startStatusCheck = () => {
  // Check every 10 seconds
  statusCheckInterval = setInterval(() => {
    checkStatus();
  }, 10000);
};

// Stop auto check status
const stopStatusCheck = () => {
  if (statusCheckInterval) {
    clearInterval(statusCheckInterval);
    statusCheckInterval = null;
  }
};

// Go to order detail
const goToOrderDetail = () => {
  router.push(`/order-detail/${orderId.value}`);
};

// Load payment info and auto submit to SePay
onMounted(async () => {
  try {
    orderId.value = route.query.orderId;
    const total = route.query.total;
    const userId = localStorage.getItem("user")._id;
    total;
    if (!orderId.value) {
      errorMessage.value = "Không tìm thấy thông tin đơn hàng";
      loading.value = false;
      return;
    }

    console.log("Creating SePay payment for order:", orderId.value);
    const response = await createSepayPayment(orderId.value, total, userId);

    if (response.success) {
      checkoutUrl.value = response.data.checkoutUrl;
      fields.value = response.data.fields;

      console.log("SePay checkout URL:", checkoutUrl.value);
      console.log("SePay fields:", fields.value);

      // Auto submit form after a short delay
      setTimeout(() => {
        if (sepayForm.value) {
          sepayForm.value.submit();
        }
      }, 500);
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    console.error("Create SePay payment error:", error);
    errorMessage.value =
      error.response?.data?.message ||
      error.message ||
      "Không thể tạo thanh toán";
    showError(errorMessage.value);
    loading.value = false;
  }
});
</script>
