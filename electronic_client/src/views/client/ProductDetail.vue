<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center min-h-screen">
      <div
        class="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"
      ></div>
    </div>

    <!-- Product not found -->
    <div
      v-else-if="!product"
      class="flex flex-col items-center justify-center min-h-screen"
    >
      <div class="text-6xl mb-4">😢</div>
      <h2 class="text-2xl font-bold text-gray-700 mb-2">
        Không tìm thấy sản phẩm
      </h2>
      <p class="text-gray-500 mb-6">Sản phẩm bạn đang tìm kiếm không tồn tại</p>
      <button
        @click="$router.push('/')"
        class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
      >
        Quay về trang chủ
      </button>
    </div>

    <!-- Product detail -->
    <div v-else class="container mx-auto px-4 py-8">
      <!-- Breadcrumb -->
      <nav class="flex mb-8 text-sm">
        <router-link to="/" class="text-blue-600 hover:text-blue-800"
          >Trang chủ</router-link
        >
        <span class="mx-2 text-gray-500">/</span>
        <router-link
          v-if="product.category_id"
          :to="`/category/${product.category_id._id}`"
          class="text-blue-600 hover:text-blue-800"
        >
          {{ product.category_id.name }}
        </router-link>
        <span class="mx-2 text-gray-500">/</span>
        <span class="text-gray-500">{{ product.name }}</span>
      </nav>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Product Images -->
        <div class="space-y-4">
          <!-- Main Image -->
          <div
            class="aspect-square bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <img
              :src="selectedImage || getFullImage(product.main_image)"
              :alt="product.name"
              class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              @error="handleImageError"
            />
          </div>

          <!-- Thumbnail Images -->
          <div
            v-if="product.images && product.images.length > 0"
            class="flex space-x-2 overflow-x-auto"
          >
            <img
              :src="getFullImage(product.main_image)"
              :alt="product.name"
              class="w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition"
              :class="
                selectedImage === getFullImage(product.main_image)
                  ? 'border-blue-600'
                  : 'border-gray-200'
              "
              @click="selectedImage = getFullImage(product.main_image)"
            />
            <img
              v-for="(image, index) in product.images"
              :key="index"
              :src="getFullImage(image)"
              :alt="`${product.name} ${index + 1}`"
              class="w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition"
              :class="
                selectedImage === getFullImage(image)
                  ? 'border-blue-600'
                  : 'border-gray-200'
              "
              @click="selectedImage = getFullImage(image)"
            />
          </div>
        </div>

        <!-- Product Info -->
        <div class="space-y-6">
          <!-- Product Title & Rating -->
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">
              {{ product.name }}
            </h1>
            <div class="flex items-center space-x-4 mb-4">
              <!-- SKU -->
              <div class="text-sm text-gray-600">
                <span class="font-medium">SKU:</span> {{ product.sku }}
              </div>

              <!-- Rating -->
              <div class="flex items-center space-x-1">
                <div class="flex space-x-1">
                  <svg
                    v-for="i in 5"
                    :key="i"
                    class="w-5 h-5"
                    :class="
                      i <= Math.floor(product.rating || 0)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    "
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                  </svg>
                </div>
                <span class="text-gray-600">({{ product.rating || 0 }})</span>
                <span class="text-gray-400">•</span>
                <span class="text-gray-600"
                  >{{ product.views || 0 }} lượt xem</span
                >
              </div>

              <!-- Stock Status -->
              <div class="flex items-center">
                <span
                  class="w-3 h-3 rounded-full mr-2"
                  :class="product.stock > 0 ? 'bg-green-500' : 'bg-red-500'"
                ></span>
                <span
                  :class="product.stock > 0 ? 'text-green-600' : 'text-red-600'"
                >
                  {{
                    product.stock > 0
                      ? `Còn ${product.stock} sản phẩm`
                      : "Hết hàng"
                  }}
                </span>
                <span v-if="product.sold > 0" class="text-gray-500 ml-2"
                  >• Đã bán {{ product.sold }}</span
                >
              </div>
            </div>
          </div>

          <!-- Price -->
          <div class="border-t border-b py-6">
            <div class="flex items-center space-x-4">
              <!-- Discounted Price -->
              <span
                v-if="product.discount_price"
                class="text-3xl font-bold text-red-600"
              >
                {{ formatPrice(product.discount_price) }}
              </span>
              <!-- Regular Price -->
              <span v-else class="text-3xl font-bold text-red-600">
                {{ formatPrice(product.price) }}
              </span>

              <!-- Original Price (if discounted) -->
              <span
                v-if="
                  product.discount_price &&
                  product.discount_price < product.price
                "
                class="text-xl text-gray-500 line-through"
              >
                {{ formatPrice(product.price) }}
              </span>

              <!-- Discount Percentage -->
              <span
                v-if="product.discount_percent"
                class="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium"
              >
                -{{ product.discount_percent }}
              </span>
            </div>

            <!-- Warranty Info -->
            <div v-if="product.warranty" class="mt-3 text-sm text-gray-600">
              <svg
                class="w-4 h-4 inline mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              Bảo hành: {{ product.warranty }}
            </div>
          </div>

          <!-- Product Options -->
          <div class="space-y-4">
            <!-- Quantity -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Số lượng:</label
              >
              <div class="flex items-center space-x-3">
                <button
                  @click="decreaseQuantity"
                  :disabled="quantity <= 1"
                  class="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M20 12H4"
                    ></path>
                  </svg>
                </button>
                <span class="w-16 text-center text-lg font-medium">{{
                  quantity
                }}</span>
                <button
                  @click="increaseQuantity"
                  :disabled="quantity >= product.stock"
                  class="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex space-x-4">
              <button
                @click="addToCart"
                :disabled="product.stock === 0 || addingToCart"
                class="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2"
              >
                <svg
                  v-if="addingToCart"
                  class="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <svg
                  v-else
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l3 3m0 0l3-3M10 16v2a1 1 0 002 0v-2m-2 0V6a1 1 0 112 0v10"
                  />
                </svg>
                <span>{{
                  addingToCart ? "Đang thêm..." : "Thêm vào giỏ"
                }}</span>
              </button>

              <button
                @click="buyNow"
                :disabled="product.stock === 0"
                class="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                Mua ngay
              </button>

              <button
                @click="toggleWishlist"
                class="w-12 h-12 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition"
                :class="
                  isInWishlist
                    ? 'text-red-600 border-red-300 bg-red-50'
                    : 'text-gray-600'
                "
              >
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Product Features -->
          <div
            v-if="product.tags && product.tags.length > 0"
            class="border-t pt-6"
          >
            <h3 class="text-lg font-semibold mb-3">Tags:</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in product.tags"
                :key="tag"
                class="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Tabs -->
      <div class="mt-16">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              class="py-2 px-1 border-b-2 font-medium text-sm transition"
              :class="
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              "
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>

        <div class="py-8">
          <!-- Description Tab -->
          <div v-if="activeTab === 'description'" class="prose max-w-none">
            <h3 class="text-xl font-semibold mb-4">Mô tả sản phẩm</h3>
            <div class="text-gray-700 whitespace-pre-line mb-6">
              {{
                product.description ||
                "Chưa có mô tả chi tiết cho sản phẩm này."
              }}
            </div>

            <!-- Detailed Description -->
            <div v-if="product.description_detail" class="mt-6">
              <h4 class="text-lg font-semibold mb-3">Mô tả chi tiết</h4>
              <div class="text-gray-700 whitespace-pre-line">
                {{ product.description_detail }}
              </div>
            </div>
          </div>

          <!-- Specifications Tab -->
          <div v-if="activeTab === 'specifications'" class="space-y-4">
            <h3 class="text-xl font-semibold mb-4">Thông số kỹ thuật</h3>
            <div
              v-if="
                product.specifications &&
                Object.keys(product.specifications).length > 0
              "
              class="bg-white rounded-lg shadow overflow-hidden"
            >
              <table class="w-full">
                <tbody class="divide-y divide-gray-200">
                  <tr
                    v-for="(value, key) in product.specifications"
                    :key="key"
                    class="hover:bg-gray-50"
                  >
                    <td
                      class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50 w-1/3"
                    >
                      {{ key }}
                    </td>
                    <td
                      class="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                    >
                      {{ value }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-gray-500 text-center py-8">
              Chưa có thông số kỹ thuật cho sản phẩm này.
            </div>
          </div>

          <!-- Reviews Tab -->
          <div v-if="activeTab === 'reviews'" class="space-y-6">
            <h3 class="text-xl font-semibold mb-4">Đánh giá sản phẩm</h3>
            <div class="text-gray-500 text-center py-8">
              Chức năng đánh giá đang được phát triển.
            </div>
          </div>
        </div>
      </div>

      <!-- Related Products -->
      <div class="mt-16">
        <h2 class="text-2xl font-bold text-gray-900 mb-8">
          Sản phẩm liên quan
        </h2>
        <div
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          <ProductCard
            v-for="relatedProduct in relatedProducts"
            :key="relatedProduct._id"
            :product="relatedProduct"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCartStore } from "@stores/cart";
import { useAuthStore } from "@stores/auth";
import { useNotification } from "@composables/useNotification";
import { useGlobalLoading } from "@composables/useLoading";
import { getProductById, getRelatedProducts } from "@api/productService";
import { getFullImage } from "@utils/imageUtils";
import ProductCard from "@components/client/productCard.vue";

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();
const { showSuccess, showError } = useNotification();
const { showPageLoading, showApiLoading, hideLoading } = useGlobalLoading();

// State
const product = ref(null);
const relatedProducts = ref([]);
const loading = ref(true);
const selectedImage = ref("");
const quantity = ref(1);
const addingToCart = ref(false);
const isInWishlist = ref(false);
const activeTab = ref("description");

// Tabs configuration
const tabs = [
  { id: "description", name: "Mô tả" },
  { id: "specifications", name: "Thông số kỹ thuật" },
  { id: "reviews", name: "Đánh giá" },
];

// Computed
const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

// Methods
const fetchProduct = async (productId) => {
  let loader;
  try {
    loading.value = true;

    // Hiển thị loading overlay cho page
    loader = showPageLoading("Đang tải thông tin sản phẩm...");

    const response = await getProductById(productId);
    product.value = response.data;
    selectedImage.value = getFullImage(response.data.main_image);

    // Fetch related products
    if (response.data.category_id?._id) {
      const relatedResponse = await getRelatedProducts(
        response.data.category_id._id,
        productId
      );
      relatedProducts.value = relatedResponse.data;
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    showError("Có lỗi xảy ra khi tải thông tin sản phẩm");
  } finally {
    loading.value = false;
    hideLoading(loader);
  }
};

const handleImageError = (event) => {
  console.log("Image load error for:", event.target.src);
  event.target.src = "/assets/images/placeholder.jpg";
};

const increaseQuantity = () => {
  if (quantity.value < product.value.stock) {
    quantity.value++;
  }
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const addToCart = async () => {
  if (!authStore.isAuthenticated) {
    showError("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
    router.push("/login");
    return;
  }

  let loader;
  try {
    addingToCart.value = true;

    // Hiển thị loading cho API call
    loader = showApiLoading("Đang thêm vào giỏ hàng...");

    await cartStore.addToCart(product.value._id, quantity.value);
    showSuccess(`Đã thêm ${quantity.value} sản phẩm vào giỏ hàng`);
  } catch (error) {
    console.error("Error adding to cart:", error);
    showError("Có lỗi xảy ra khi thêm vào giỏ hàng");
  } finally {
    addingToCart.value = false;
    hideLoading(loader);
  }
};

const buyNow = () => {
  if (!authStore.isAuthenticated) {
    showError("Vui lòng đăng nhập để mua hàng");
    router.push("/login");
    return;
  }

  // Add to cart then go to checkout
  addToCart().then(() => {
    router.push("/cart");
  });
};

const toggleWishlist = () => {
  if (!authStore.isAuthenticated) {
    showError("Vui lòng đăng nhập để thêm vào danh sách yêu thích");
    router.push("/login");
    return;
  }

  isInWishlist.value = !isInWishlist.value;
  const message = isInWishlist.value
    ? "Đã thêm vào danh sách yêu thích"
    : "Đã xóa khỏi danh sách yêu thích";
  showSuccess(message);
};

// Watchers
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      fetchProduct(newId);
      quantity.value = 1;
      activeTab.value = "description";
    }
  },
  { immediate: true }
);

// Lifecycle
onMounted(() => {
  if (route.params.id) {
    fetchProduct(route.params.id);
  }
});
</script>

<style scoped>
.prose {
  max-width: none;
}

.prose h3 {
  margin-bottom: 1rem;
}
</style>
