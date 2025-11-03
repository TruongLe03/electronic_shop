<template>
  <Header />
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="container mx-auto px-4">
      <div class="max-w-2xl mx-auto">
        <!-- Failed State -->
        <div class="bg-white rounded-lg shadow-lg p-8 text-center">
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

          <h1 class="text-2xl font-bold text-gray-900 mb-4">
            Thanh toán thất bại
          </h1>
          <p class="text-gray-600 mb-6">
            {{
              errorMessage ||
              "Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại."
            }}
          </p>

          <div v-if="orderId" class="bg-gray-50 rounded-lg p-6 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-medium text-gray-700">Mã đơn hàng:</span>
                <span class="text-gray-900 ml-2">{{ orderId }}</span>
              </div>
              <div>
                <span class="font-medium text-gray-700">Trạng thái:</span>
                <span class="text-red-600 ml-2 font-medium"
                  >Thanh toán thất bại</span
                >
              </div>
            </div>
          </div>

          <div
            class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"
          >
            <div class="flex items-start">
              <svg
                class="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                ></path>
              </svg>
              <div class="text-left">
                <p class="text-sm font-medium text-yellow-800 mb-1">
                  Lưu ý quan trọng
                </p>
                <p class="text-sm text-yellow-700">
                  Nếu bạn đã thanh toán thành công nhưng thấy thông báo này, vui
                  lòng kiểm tra đơn hàng hoặc liên hệ hỗ trợ để được xử lý.
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                v-if="orderId"
                @click="retryPayment"
                :disabled="retrying"
                class="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                {{ retrying ? "Đang xử lý..." : "Thử thanh toán lại" }}
              </button>

              <router-link
                v-if="orderId"
                :to="`/orders/${orderId}`"
                class="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors text-center"
              >
                Xem chi tiết đơn hàng
              </router-link>
            </div>

            <router-link
              to="/my-orders"
              class="inline-block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Xem tất cả đơn hàng
            </router-link>

            <router-link
              to="/cart"
              class="inline-block w-full text-blue-600 hover:text-blue-800 font-medium py-2 transition-colors"
            >
              Quay lại giỏ hàng
            </router-link>

            <router-link
              to="/"
              class="inline-block w-full text-gray-600 hover:text-gray-800 font-medium py-2 transition-colors"
            >
              Về trang chủ
            </router-link>
          </div>

          <!-- Support Contact -->
          <div class="mt-8 pt-6 border-t border-gray-200">
            <p class="text-sm text-gray-600 mb-2">Cần hỗ trợ?</p>
            <div class="flex justify-center space-x-6 text-sm">
              <a
                href="tel:1900000000"
                class="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <svg
                  class="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  ></path>
                </svg>
                Hotline: 1900 000 000
              </a>
              <a
                href="mailto:support@example.com"
                class="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <svg
                  class="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  ></path>
                </svg>
                Email hỗ trợ
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useNotification } from "@/composables/client/useNotification";
import apiClient from "@/utils/axiosConfig";
import Header from "@components/client/Header.vue";
import Footer from "@components/client/Footer.vue";

const route = useRoute();
const router = useRouter();
const { showError, showSuccess } = useNotification();

// State
const orderId = ref("");
const errorMessage = ref("");
const retrying = ref(false);

// Retry payment
const retryPayment = async () => {
  if (!orderId.value || retrying.value) return;

  try {
    retrying.value = true;

    // Call API to create new payment URL
    const response = await apiClient.post("/vnpay/create-payment", {
      orderId: orderId.value,
    });

    if (response.data.success) {
      showSuccess("Đang chuyển đến cổng thanh toán...");
      // Redirect to VNPay
      window.location.href = response.data.data.paymentUrl;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error("Retry payment error:", error);
    const message =
      error.response?.data?.message ||
      error.message ||
      "Không thể tạo lại URL thanh toán";
    showError(message);
  } finally {
    retrying.value = false;
  }
};

onMounted(() => {
  // Get parameters from URL
  orderId.value = route.query.orderId || "";
  const error = route.query.error;
  const message = route.query.message;

  if (error) {
    errorMessage.value = decodeURIComponent(error);
  } else if (message) {
    errorMessage.value = decodeURIComponent(message);
  }

  if (errorMessage.value) {
    showError(errorMessage.value);
  }
});
</script>
