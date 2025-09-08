<script setup>
import { getFullImage, handleImageError } from "@utils/imageUtils";
import { useCartStore } from "@stores/cart";
import { useNotification } from "@composables/useNotification";
import { ref } from "vue";

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const cartStore = useCartStore();
const { showError } = useNotification();
const loading = ref(false);

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
    // Toast notification sẽ được hiển thị từ cart store
  } catch (error) {
    console.error("Error adding to cart:", error);
    showError("Có lỗi xảy ra khi thêm vào giỏ hàng");
  } finally {
    loading.value = false;
  }
};

// Debug log để kiểm tra dữ liệu image
console.log("Product data:", props.product);
console.log("Main image:", props.product?.main_image);
console.log("Processed image URL:", getFullImage(props.product?.main_image));
</script>

<template>
  <div
    class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
  >
    <!-- Product Image -->
    <router-link :to="`/product/${product._id}`" class="block">
      <div class="relative group">
        <img
          :src="getFullImage(product.main_image)"
          :alt="product.name"
          class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          @error="handleImageError"
          @load="
            () =>
              console.log(
                'Image loaded successfully:',
                getFullImage(product.main_image)
              )
          "
        />
        <!-- Add to Cart Overlay -->
        <div
          class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        >
          <button
            @click.prevent="handleAddToCart"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transform transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="loading"
          >
            <span v-if="loading">Đang thêm...</span>
            <span v-else>Thêm vào giỏ</span>
          </button>
        </div>
      </div>
    </router-link>

    <div class="p-4">
      <!-- Product Name -->
      <router-link :to="`/product/${product._id}`" class="block">
        <h3
          class="text-lg font-semibold mb-2 line-clamp-2 hover:text-blue-600 cursor-pointer transition-colors"
        >
          {{ product.name }}
        </h3>
      </router-link>

      <!-- Price Section -->
      <div class="flex items-center gap-2">
        <!-- When there is a discount -->
        <template v-if="product.discount_price">
          <span class="text-xl font-bold text-red-600">
            {{ formatPrice(product.discount_price) }}
          </span>
          <span class="text-sm text-gray-400 line-through">
            {{ formatPrice(product.price) }}
          </span>
        </template>
        <!-- Regular price when no discount -->
        <span v-else class="text-xl font-bold text-red-600">
          {{ formatPrice(product.price) }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
