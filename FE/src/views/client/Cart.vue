<script setup>
import { useCartStore } from "@stores/cart";
import { useAuthStore } from "@stores/auth";
import { useRouter } from "vue-router";
import { useNotification } from "@/composables/client/useNotification";
import { useGlobalLoading } from "@/composables/client/useLoading";
import { orderService } from "@api/orderService";
import ClientLayout from "@/layout/ClientLayout.vue";

const cart = useCartStore();
const authStore = useAuthStore();
const router = useRouter();
const { showSuccess, showError } = useNotification();
const { showApiLoading, hideLoading } = useGlobalLoading();

const handleUpdateQuantity = (productId, event) => {
  const quantity = parseInt(event.target.value);
  if (quantity > 0) {
    cart.updateQuantity(productId, quantity);
  }
};

const handleRemoveItem = (productId) => {
  if (confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?")) {
    cart.removeFromCart(productId);
  }
};

const handleCheckout = async () => {
  if (!authStore.isAuthenticated) {
    showError("Vui lòng đăng nhập để thanh toán");
    router.push("/login");
    return;
  }

  if (cart.cartItems.length === 0) {
    showError("Giỏ hàng trống");
    return;
  }

  // Chuyển đến trang thanh toán (không có orderId = từ cart)
  router.push({
    name: "Payment"
  });
};
</script>

<template>
  <ClientLayout>
    <div class="container mx-auto px-4 py-8">
    <!-- Empty Cart State -->
    <div v-if="cart.cartItems.length === 0" class="text-center py-8">
      <div class="flex flex-col items-center">
        <div class="text-6xl mb-4 text-gray-400">
          <i class="fas fa-shopping-cart"></i>
        </div>
        <h1 class="text-2xl font-semibold mb-2">Giỏ hàng trống</h1>
        <p class="text-gray-600 mb-6">Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
        <button
          @click="router.push('/')"
          class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Tiếp tục mua sắm
        </button>
      </div>
    </div>

    <!-- Cart Items -->
    <div v-else>
      <h1 class="text-3xl font-bold mb-8">Giỏ hàng của bạn</h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Product List -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-sm">
            <div
              v-for="item in cart.cartItems"
              :key="item.id"
              class="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 sm:p-6 border-b last:border-b-0 hover:bg-gray-50 transition"
            >
              <!-- Product Image -->
              <div class="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 mx-auto sm:mx-0">
                <img
                  :src="item.image"
                  :alt="item.name"
                  class="w-full h-full object-contain bg-gray-50 rounded-lg border"
                />
              </div>

              <!-- Product Info -->
              <div class="flex-grow text-center sm:text-left">
                <h3 class="font-semibold text-base sm:text-lg mb-1">{{ item.name }}</h3>
                <p class="text-gray-600 mb-3 text-sm sm:text-base">
                  {{ item.price.toLocaleString() }}đ
                </p>

                <div class="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-4">
                  <div class="flex items-center border rounded">
                    <input
                      type="number"
                      :value="item.quantity"
                      min="1"
                      @change="(e) => handleUpdateQuantity(item.id, e)"
                      class="w-16 p-1 text-center focus:outline-none text-sm"
                    />
                  </div>
                  <button
                    @click="handleRemoveItem(item.id)"
                    class="text-red-500 hover:text-red-600 transition text-sm sm:text-base"
                  >
                    <span class="hidden sm:inline">Xóa</span>
                    <span class="sm:hidden">×</span>
                  </button>
                </div>
              </div>

              <!-- Product Total -->
              <div class="text-center sm:text-right">
                <p class="font-semibold text-base sm:text-lg">
                  {{ (item.price * item.quantity).toLocaleString() }}đ
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <div class="bg-white p-6 rounded-lg shadow-sm sticky top-4">
            <h3 class="text-xl font-semibold mb-6">Tổng đơn hàng</h3>

            <div class="space-y-4">
              <div class="flex justify-between pb-4 border-b">
                <span class="text-gray-600">Tạm tính</span>
                <span class="font-semibold"
                  >{{ cart.cartTotal.toLocaleString() }}đ</span
                >
              </div>

              <div class="flex justify-between">
                <span class="font-semibold">Tổng cộng</span>
                <span class="font-semibold text-xl text-blue-600">
                  {{ cart.cartTotal.toLocaleString() }}đ
                </span>
              </div>
            </div>

            <button
              @click="handleCheckout"
              class="w-full bg-blue-600 text-white py-4 rounded-lg mt-6 hover:bg-blue-700 transition font-semibold"
            >
              Tiến hành thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  </ClientLayout>
</template>
