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
  showCompare: {
    type: Boolean,
    default: true,
  },
  showWishlist: {
    type: Boolean,
    default: true,
  }
});

const cartStore = useCartStore();
const { showError, showSuccess } = useNotification();
const loading = ref(false);
const isHovered = ref(false);

// Computed properties
const discountedPrice = computed(() => {
  if (props.product.discount_percent && props.product.discount_percent > 0) {
    return props.product.price * (1 - props.product.discount_percent / 100);
  }
  return props.product.price;
});

const hasDiscount = computed(() => {
  return props.product.discount_percent && props.product.discount_percent > 0;
});

const stockStatus = computed(() => {
  const stock = props.product.stock || 0;
  if (stock === 0) return { text: 'Hết hàng', class: 'bg-red-100 text-red-800' };
  if (stock <= 5) return { text: 'Sắp hết', class: 'bg-yellow-100 text-yellow-800' };
  return { text: 'Còn hàng', class: 'bg-green-100 text-green-800' };
});

const rating = computed(() => {
  return props.product.rating || 4.5; // Default rating
});

// Methods
const formatPrice = (price) => {
  if (!price) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const handleAddToCart = async () => {
  if (loading.value) return;

  try {
    loading.value = true;
    await cartStore.addToCart(props.product, 1);
    // Thông báo sẽ hiển thị từ cart store
  } catch (error) {
    console.error("Error adding to cart:", error);
    showError("Có lỗi xảy ra khi thêm vào giỏ hàng");
  } finally {
    loading.value = false;
  }
};

const handleQuickView = () => {
  // Implement quick view modal
  console.log('Quick view:', props.product);
};

const handleAddToWishlist = () => {
  // Implement wishlist functionality
  showSuccess('Đã thêm vào danh sách yêu thích!');
};

const handleCompare = () => {
  // Implement compare functionality
  showSuccess('Đã thêm vào danh sách so sánh!');
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
        -{{ Math.round(product.discount_percent) }}%
      </div>

      <!-- Stock Status Badge -->
      <div
        :class="[
          'absolute top-2 right-2 sm:top-3 sm:right-3 z-10 text-xs font-medium px-1 sm:px-2 py-1 rounded-full',
          stockStatus.class
        ]"
      >
        {{ stockStatus.text }}
      </div>

      <!-- Product Image -->
      <router-link :to="`/product/${product._id}`" class="block">
        <div class="aspect-square relative overflow-hidden">
          <img
            :src="getFullImage(product.main_image)"
            :alt="product.name"
            @error="handleImageError"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          <!-- Overlay on Hover -->
          <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
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

      <!-- Action Buttons -->
      <div class="absolute top-1/2 right-2 sm:right-3 transform -translate-y-1/2 hidden sm:flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-10 group-hover:translate-x-0">
        <!-- Wishlist -->
        <button
          v-if="showWishlist"
          @click="handleAddToWishlist"
          class="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-red-500 hover:scale-110 transition-all duration-200"
          title="Thêm vào yêu thích"
        >
          <i class="fas fa-heart text-xs sm:text-sm"></i>
        </button>

        <!-- Compare -->
        <button
          v-if="showCompare"
          @click="handleCompare"
          class="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-blue-500 hover:scale-110 transition-all duration-200"
          title="So sánh sản phẩm"
        >
          <i class="fas fa-balance-scale text-xs sm:text-sm"></i>
        </button>
      </div>
    </div>

    <!-- Product Info -->
    <div class="p-2 sm:p-3 md:p-4">
      <!-- Category -->
      <div class="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1 sm:mb-2">
        {{ product.category_id?.name || 'Electronics' }}
      </div>

      <!-- Product Name -->
      <router-link :to="`/product/${product._id}`">
        <h3 class="font-semibold text-gray-900 mb-1 sm:mb-2 line-clamp-2 hover:text-blue-600 transition-colors leading-tight text-sm sm:text-base">
          {{ product.name }}
        </h3>
      </router-link>

      <!-- Rating -->
      <div class="flex items-center mb-2 sm:mb-3">
        <div class="flex items-center">
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
                    : 'far fa-star text-gray-300'
              ]"
            ></i>
          </div>
          <span class="text-xs sm:text-sm text-gray-600 ml-1 sm:ml-2">({{ rating }})</span>
        </div>
        <span class="text-xs text-gray-400 ml-auto">{{ product.sold || 0 }}</span>
      </div>

      <!-- Price -->
      <div class="flex items-center justify-between mb-2 sm:mb-4">
        <div class="flex items-center space-x-1 sm:space-x-2">
          <span class="text-sm sm:text-lg font-bold text-blue-600">
            {{ formatPrice(discountedPrice) }}
          </span>
          <span
            v-if="hasDiscount"
            class="text-xs sm:text-sm text-gray-500 line-through"
          >
            {{ formatPrice(product.price) }}
          </span>
        </div>
      </div>

      <!-- Product Features -->
      <div class="text-xs text-gray-500 mb-2 sm:mb-4 space-y-1 hidden sm:block">
        <div class="flex items-center">
          <i class="fas fa-shipping-fast mr-2 text-green-600"></i>
          <span>Miễn phí vận chuyển</span>
        </div>
        <div class="flex items-center">
          <i class="fas fa-shield-alt mr-2 text-blue-600"></i>
          <span>Bảo hành chính hãng</span>
        </div>
      </div>

      <!-- Add to Cart Button -->
      <button
        @click="handleAddToCart"
        :disabled="loading || product.stock === 0"
        :class="[
          'w-full py-2 sm:py-3 px-2 sm:px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base',
          product.stock === 0
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : loading
              ? 'bg-blue-400 text-white cursor-wait'
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:scale-105'
        ]"
      >
        <i 
          :class="[
            loading ? 'fas fa-spinner fa-spin' : 'fas fa-shopping-cart'
          ]"
        ></i>
        <span>
          {{ 
            product.stock === 0 
              ? 'Hết hàng' 
              : loading 
                ? 'Đang thêm...' 
                : 'Thêm vào giỏ' 
          }}
        </span>
      </button>
    </div>

    <!-- Hover Effect Border -->
    <div class="absolute inset-0 border-2 border-transparent group-hover:border-blue-200 rounded-xl transition-colors duration-300 pointer-events-none"></div>
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

/* Smooth transitions for all elements */
* {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>