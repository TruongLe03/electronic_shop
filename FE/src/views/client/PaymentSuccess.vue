<template>
  <Header />
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="container mx-auto px-4">
      <div class="max-w-2xl mx-auto">
        <!-- Loading State -->
        <div v-if="loading" class="text-center">
          <div
            class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
          ></div>
          <p class="mt-4 text-gray-600">Đang xác thực thanh toán...</p>
        </div>

        <!-- Success State -->
        <div
          v-else-if="paymentStatus === 'success'"
          class="bg-white rounded-lg shadow-lg p-8 text-center"
        >
          <div
            class="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
          >
            <svg
              class="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>

          <h1 class="text-2xl font-bold text-gray-900 mb-4">
            Thanh toán thành công!
          </h1>
          <p class="text-gray-600 mb-6">
            Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được xác nhận và sẽ được
            xử lý sớm nhất.
          </p>

          <div class="bg-gray-50 rounded-lg p-6 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-medium text-gray-700">Mã đơn hàng:</span>
                <span class="text-gray-900 ml-2">{{ orderId }}</span>
              </div>
              <div v-if="transactionNo">
                <span class="font-medium text-gray-700">Mã giao dịch:</span>
                <span class="text-gray-900 ml-2">{{ transactionNo }}</span>
              </div>
              <div>
                <span class="font-medium text-gray-700"
                  >Phương thức thanh toán:</span
                >
                <span class="text-gray-900 ml-2">VNPay</span>
              </div>
              <div>
                <span class="font-medium text-gray-700">Trạng thái:</span>
                <span class="text-green-600 ml-2 font-medium"
                  >Đã thanh toán</span
                >
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <router-link
              :to="`/orders/${orderId}`"
              class="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Xem chi tiết đơn hàng
            </router-link>

            <router-link
              to="/my-orders"
              class="inline-block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Xem tất cả đơn hàng
            </router-link>

            <router-link
              to="/"
              class="inline-block w-full text-blue-600 hover:text-blue-800 font-medium py-2 transition-colors"
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
            {{
              errorMessage ||
              "Không thể xác thực trạng thái thanh toán. Vui lòng liên hệ hỗ trợ nếu bạn đã thanh toán."
            }}
          </p>

          <div class="space-y-4">
            <router-link
              to="/orders"
              class="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Kiểm tra đơn hàng
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
  <Footer />
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCartStore } from "@stores/cart";
import { useNotification } from "@/composables/client/useNotification";
import apiClient from "@/utils/axiosConfig";
import Header from "@components/client/Header.vue";
import Footer from "@components/client/Footer.vue";

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const { showSuccess, showError } = useNotification();

// State
const loading = ref(true);
const paymentStatus = ref("");
const orderId = ref("");
const transactionNo = ref("");
const errorMessage = ref("");

// Verify payment status when component mounts
onMounted(async () => {
  try {
    // Get parameters from URL
    orderId.value = route.query.orderId;
    transactionNo.value = route.query.transactionNo;
    const status = route.query.status;
    const error = route.query.error;

    if (!orderId.value) {
      errorMessage.value = "Không tìm thấy thông tin đơn hàng";
      paymentStatus.value = "error";
      loading.value = false;
      return;
    }

    if (status === "success") {
      paymentStatus.value = "success";
      showSuccess("Thanh toán thành công!");

      // Clear cart after successful payment
      try {
        await cartStore.fetchCart();
        if (cartStore.cartCount > 0) {
          cartStore.clearCart();
        }
      } catch (cartError) {
        console.error("Error clearing cart:", cartError);
      }
    } else if (status === "failed") {
      paymentStatus.value = "failed";
      errorMessage.value = error
        ? decodeURIComponent(error)
        : "Thanh toán thất bại";
      showError(errorMessage.value);
    } else {
      // Verify payment status with backend
      const response = await apiClient.get(`/vnpay/status/${orderId.value}`);
      if (response.data.success) {
        const paymentInfo = response.data.data;
        if (paymentInfo.payment_status === "completed") {
          paymentStatus.value = "success";
          showSuccess("Thanh toán thành công!");

          // Clear cart after successful payment
          try {
            await cartStore.fetchCart();
            if (cartStore.cartCount > 0) {
              cartStore.clearCart();
            }
          } catch (cartError) {
            console.error("Error clearing cart:", cartError);
          }
        } else {
          paymentStatus.value = "failed";
          errorMessage.value = "Thanh toán chưa hoàn tất";
        }
      } else {
        throw new Error(response.data.message);
      }
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    paymentStatus.value = "error";
    errorMessage.value =
      error.response?.data?.message ||
      error.message ||
      "Không thể xác thực thanh toán";
    showError(errorMessage.value);
  } finally {
    loading.value = false;
  }
});
</script>
