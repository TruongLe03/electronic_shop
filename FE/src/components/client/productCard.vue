<script setup>
import { getFullImage, handleImageError } from "@utils/imageUtils";
import { useCartStore } from "@stores/cart";
import { useNotification } from "@/composables/client/useNotification";
import { ref, computed } from "vue";

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  showQuickView: {
    type: Boolean,
    default: true,
  },
});

const cartStore = useCartStore();
const { showError, showSuccess } = useNotification();
const loading = ref(false);
const isHovered = ref(false);

// Computed properties
const discountedPrice = computed(() => {
  // Ưu tiên discount_price nếu có
  if (props.product.discount_price && props.product.discount_price > 0) {
    return props.product.discount_price;
  }
  // Nếu không có discount_price, dùng discount_percent
  if (props.product.discount_percent && props.product.discount_percent > 0) {
    return props.product.price * (1 - props.product.discount_percent / 100);
  }
  return props.product.price;
});

const hasDiscount = computed(() => {
  return (
    (props.product.discount_price &&
      props.product.discount_price > 0 &&
      props.product.discount_price < props.product.price) ||
    (props.product.discount_percent && props.product.discount_percent > 0)
  );
});

const discountPercentage = computed(() => {
  if (props.product.discount_percent && props.product.discount_percent > 0) {
    return Math.round(props.product.discount_percent);
  }
  if (
    props.product.discount_price &&
    props.product.discount_price > 0 &&
    props.product.discount_price < props.product.price
  ) {
    return Math.round(
      ((props.product.price - props.product.discount_price) /
        props.product.price) *
        100
    );
  }
  return 0;
});

const rating = computed(() => {
  // Lấy average_rating từ product, default là 0 nếu chưa có đánh giá
  return props.product.average_rating || 0;
});

const reviewCount = computed(() => {
  return props.product.review_count || 0;
});

const stockStatus = computed(() => {
  const stock = props.product.stock || 0;
  if (stock === 0)
    return { text: "Hết hàng", class: "bg-red-100 text-red-800" };
  if (stock <= 5)
    return { text: "Sắp hết", class: "bg-yellow-100 text-yellow-800" };
  return { text: "Còn hàng", class: "bg-green-100 text-green-800" };
});

// Methods
const formatPrice = (price) => {
  if (!price) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const handleAddToCart = async (event) => {
  if (loading.value) return;

  // Create ripple effect
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  const ripple = document.createElement("span");
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.className = "ripple-effect";
  ripple.style.width = ripple.style.height = size + "px";
  ripple.style.left = x + "px";
  ripple.style.top = y + "px";

  button.appendChild(ripple);

  // Remove ripple after animation
  setTimeout(() => {
    ripple.remove();
  }, 600);

  try {
    loading.value = true;

    // Cart store sẽ tự động xử lý authentication và redirect
    const added = await cartStore.addToCart(props.product, 1);

    if (added) {
      // Add success class for feedback
      button.classList.add("success");
      setTimeout(() => {
        button.classList.remove("success");
      }, 600);
    }
    // Nếu không thêm được (chưa đăng nhập), cart store sẽ tự động xử lý
  } catch (error) {
    console.error("Error adding to cart:", error);
    showError("Có lỗi xảy ra khi thêm vào giỏ hàng");
  } finally {
    loading.value = false;
  }
};

const handleQuickView = () => {
  // Implement quick view modal
  console.log("Quick view:", props.product);
};
</script>

<template>
  <div
    class="group relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Product Image Container -->
    <div class="relative overflow-hidden bg-gray-50">
      <!-- Discount Badge -->
      <div
        v-if="hasDiscount"
        class="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 bg-red-500 text-white text-xs font-bold px-1 sm:px-2 py-1 rounded-full"
      >
        -{{ discountPercentage }}%
      </div>

      <!-- Stock Status Badge -->
      <div
        :class="[
          'absolute top-2 right-2 sm:top-3 sm:right-3 z-10 text-xs font-medium px-1 sm:px-2 py-1 rounded-full',
          stockStatus.class,
        ]"
      >
        {{ stockStatus.text }}
      </div>

      <!-- Product Image -->
      <router-link
        :to="{
          path: `/product/${product._id}`,
          query: {
            name: product.name,
            category: product.category_id?.name,
          },
        }"
        class="block"
      >
        <div class="aspect-square relative overflow-hidden">
          <img
            :src="getFullImage(product.main_image)"
            :alt="product.name"
            @error="handleImageError"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          <!-- Overlay on Hover -->
          <div
            class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          ></div>

          <!-- Quick View Button -->
          <div
            v-if="showQuickView"
            class="absolute inset-0 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <button
              @click.prevent="handleQuickView"
              class="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors transform scale-90 group-hover:scale-100"
            >
              <i class="fas fa-eye mr-1"></i>
              Xem nhanh
            </button>
          </div>
        </div>
      </router-link>
    </div>

    <!-- Product Info -->
    <div class="p-2 sm:p-3 md:p-4">
      <!-- Category -->
      <div
        class="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1 sm:mb-2"
      >
        {{ product.category_id?.name || "Electronics" }}
      </div>

      <!-- Product Name -->
      <router-link
        :to="{
          path: `/product/${product._id}`,
          query: {
            name: product.name,
            category: product.category_id?.name,
          },
        }"
      >
        <h3
          class="font-semibold text-gray-900 mb-1 sm:mb-2 line-clamp-2 hover:text-blue-600 transition-colors leading-tight text-sm sm:text-base"
        >
          {{ product.name }}
        </h3>
      </router-link>

      <!-- Rating -->
      <div class="mb-2 sm:mb-3">
        <div class="flex items-center mb-1">
          <!-- Luôn hiển thị 5 sao -->
          <div class="flex">
            <i
              v-for="star in 5"
              :key="star"
              :class="[
                'text-xs sm:text-sm',
                star <= Math.floor(rating)
                  ? 'fas fa-star text-yellow-400'
                  : star <= rating
                  ? 'fas fa-star-half-alt text-yellow-400'
                  : 'far fa-star text-gray-300',
              ]"
            ></i>
          </div>
          <span
            v-if="rating > 0"
            class="text-xs sm:text-sm text-gray-600 ml-1 sm:ml-2"
            >({{ rating.toFixed(1) }}) · {{ reviewCount }} đánh giá</span
          >
        </div>
        <!-- Đã bán -->
        <div class="text-xs text-gray-500">Đã bán: {{ product.sold || 0 }}</div>
      </div>

      <!-- Price -->
      <div class="mb-2 sm:mb-4">
        <div class="flex items-center gap-2 flex-wrap">
          <!-- Current Price -->
          <span class="text-sm sm:text-lg font-bold text-red-600">
            {{ formatPrice(discountedPrice) }}
          </span>

          <!-- Original Price -->
          <span
            v-if="hasDiscount"
            class="text-xs sm:text-sm text-gray-500 line-through opacity-80"
          >
            {{ formatPrice(product.price) }}
          </span>
        </div>
      </div>

      <!-- Add to Cart Button -->
      <button
        @click="handleAddToCart($event)"
        :disabled="loading || product.stock === 0"
        :class="[
          'add-to-cart-btn w-full py-2 sm:py-3 px-2 sm:px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base relative overflow-hidden',
          product.stock === 0
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : loading
            ? 'bg-blue-400 text-white cursor-wait'
            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transform hover:scale-105',
        ]"
      >
        <!-- Success ripple effect -->
        <div
          v-if="!loading && product.stock > 0"
          class="ripple-effect absolute inset-0 rounded-lg opacity-0 bg-white"
        ></div>

        <i
          :class="[
            loading ? 'fas fa-spinner fa-spin' : 'fas fa-shopping-cart',
            'transition-transform duration-300',
          ]"
        ></i>
        <span>
          {{
            product.stock === 0
              ? "Hết hàng"
              : loading
              ? "Đang thêm..."
              : "Thêm vào giỏ"
          }}
        </span>
      </button>
    </div>

    <!-- Hover Effect Border -->
    <div
      class="absolute inset-0 border-2 border-transparent group-hover:border-blue-200 rounded-xl transition-colors duration-300 pointer-events-none"
    ></div>
  </div>
</template>

<style scoped>
/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Custom hover animations */
.group:hover .transform {
  transform: translateY(-4px);
}

/* Add to Cart Button Effects */
.add-to-cart-btn {
  position: relative;
  overflow: hidden;
}

.add-to-cart-btn:hover:not(:disabled) {
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

.add-to-cart-btn:active:not(:disabled) {
  transform: scale(0.98);
}

/* Ripple effect */
.ripple-effect {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  transform: scale(0);
  animation: ripple 0.6s linear;
  pointer-events: none;
}

@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

/* Success feedback animation */
.add-to-cart-btn.success {
  animation: successPulse 0.6s ease-out;
}

@keyframes successPulse {
  0% {
    transform: scale(1);
    background: linear-gradient(to right, #2563eb, #1d4ed8);
  }
  50% {
    transform: scale(1.05);
    background: linear-gradient(to right, #059669, #047857);
  }
  100% {
    transform: scale(1);
    background: linear-gradient(to right, #2563eb, #1d4ed8);
  }
}

/* Loading spinner enhancement */
.fa-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Button shine effect */
.add-to-cart-btn:before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: left 0.5s;
}

.add-to-cart-btn:hover:before {
  left: 100%;
}

/* Smooth transitions for all elements */
* {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
