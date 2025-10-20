<script setup>
import { ref, onMounted, computed } from "vue";
import ClientLayout from "@/layout/ClientLayout.vue";
import ProductCard from "@components/client/productCard.vue";
import { getDiscountedProducts } from "@api/productService";
import { useCartStore } from "@stores/cart";
import { useAuthStore } from "@stores/auth";
import { useRouter } from "vue-router";

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();

const allDeals = ref([]);
const loading = ref(false);
const selectedDeal = ref("all");
const currentPage = ref(1);
const totalPages = ref(1);
const itemsPerPage = 20;

const dealTypes = [
  { id: "all", name: "Tất cả ưu đãi", icon: "fas fa-tags", minDiscount: 0 },
  { id: "clearance", name: "Thanh lý", icon: "fas fa-boxes", minDiscount: 15 },
  { id: "hot", name: "Hot Deal", icon: "fas fa-fire", minDiscount: 50 },
  { id: "flash", name: "Flash Sale", icon: "fas fa-bolt", minDiscount: 30 },
  {
    id: "special",
    name: "Khuyến mãi đặc biệt",
    icon: "fas fa-star",
    minDiscount: 20,
  },
];

// Computed để filter deals theo loại được chọn
const filteredDeals = computed(() => {
  // Đảm bảo allDeals.value là array
  const deals = Array.isArray(allDeals.value) ? allDeals.value : [];

  if (selectedDeal.value === "all") {
    return deals;
  }

  const dealType = dealTypes.find((d) => d.id === selectedDeal.value);
  if (!dealType) return deals;

  return deals.filter(
    (product) => product.discount_percent >= dealType.minDiscount
  );
});

// Computed để tính tổng tiền tiết kiệm
const totalSavings = computed(() => {
  // Đảm bảo filteredDeals.value là array trước khi sử dụng reduce
  const deals = Array.isArray(filteredDeals.value) ? filteredDeals.value : [];
  return deals.reduce((total, product) => {
    const savings = calculateSavings(product);
    return total + savings.savings;
  }, 0);
});

onMounted(async () => {
  await loadDeals();
});

const loadDeals = async (page = 1) => {
  try {
    loading.value = true;
    const response = await getDiscountedProducts(page, 50); // Lấy nhiều sản phẩm hơn

    console.log("Full response:", response);
    console.log("Response.data:", response?.data);
    console.log("Response.products:", response?.products);

    // Đảm bảo response có cấu trúc đúng
    if (response && typeof response === "object") {
      // API service đã xử lý và trả về response.data và response.products
      allDeals.value = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.products)
        ? response.products
        : Array.isArray(response)
        ? response
        : [];
      currentPage.value = response.page || response.currentPage || 1;
      totalPages.value = response.totalPages || response.totalPages || 1;
    } else {
      allDeals.value = [];
    }

    console.log("Loaded deals:", allDeals.value.length);
  } catch (error) {
    console.error("Error loading deals:", error);
    allDeals.value = []; // Đảm bảo luôn là array khi có lỗi
  } finally {
    loading.value = false;
  }
};

const filterDeals = (type) => {
  selectedDeal.value = type;
};

const calculateSavings = (product) => {
  // Tính toán dựa trên discount_percent và discount_price thực tế
  let originalPrice = product.price;
  let salePrice = product.discount_price || product.price;
  let percentage = product.discount_percent || 0;

  // Nếu có discount_price, tính lại percentage
  if (product.discount_price && product.price) {
    percentage = Math.round(
      ((product.price - product.discount_price) / product.price) * 100
    );
    salePrice = product.discount_price;
  }
  // Nếu chỉ có discount_percent, tính discount_price
  else if (product.discount_percent) {
    salePrice = Math.round(
      product.price * (1 - product.discount_percent / 100)
    );
  }

  const savings = originalPrice - salePrice;

  return {
    savings: Math.max(0, savings),
    percentage: Math.max(0, percentage),
    originalPrice,
    salePrice,
  };
};

// Add to cart function
const addToCart = async (product) => {
  try {
    if (!authStore.isAuthenticated) {
      // Lưu intent để redirect sau khi đăng nhập
      localStorage.setItem('intendedRoute', router.currentRoute.value.fullPath);
      
      // Lưu sản phẩm cần thêm vào giỏ
      const cartItem = {
        productId: product._id,
        quantity: 1,
        price: product.discount_price || product.price,
        name: product.name,
        image: product.main_image || (product.images && product.images[0])
      };
      await cartStore.setPendingCartItem(cartItem);
      
      router.push('/login');
      return;
    }

    await cartStore.addToCart({
      productId: product._id,
      quantity: 1,
      price: product.discount_price || product.price
    });
    
    // Show success message (you can customize this)
    console.log('Đã thêm sản phẩm vào giỏ hàng!');
  } catch (error) {
    console.error('Error adding to cart:', error);
  }
};

// Hàm định dạng số tiền
const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN").format(price);
};
</script>

<template>
  <ClientLayout>
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero Section -->
      <div
        class="bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl text-white p-8 mb-12 text-center"
      >
        <h1 class="text-4xl md:text-5xl font-bold mb-4">
          <i class="fas fa-fire text-red-500 mr-3"></i>Khuyến mãi Hot
        </h1>
        <p class="text-xl md:text-2xl opacity-90 mb-6">
          Giảm giá lên đến 70% - Cơ hội vàng không thể bỏ lỡ!
        </p>
        <div class="flex justify-center items-center gap-4 text-lg">
          <div class="bg-white/20 px-4 py-2 rounded-lg">
            <span class="font-bold">{{ filteredDeals.length }}</span> sản phẩm
          </div>
          <div class="bg-white/20 px-4 py-2 rounded-lg">
            Tiết kiệm đến
            <span class="font-bold">{{ formatPrice(totalSavings) }}₫</span>
          </div>
        </div>
      </div>

      <!-- Deal Type Filter -->
      <div class="flex flex-wrap gap-2 sm:gap-4 mb-8 justify-center">
        <button
          v-for="deal in dealTypes"
          :key="deal.id"
          @click="filterDeals(deal.id)"
          :class="[
            'px-3 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all duration-200 flex items-center gap-1 sm:gap-2 text-sm sm:text-base',
            selectedDeal === deal.id
              ? 'bg-red-500 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 shadow-md',
          ]"
        >
          <i :class="deal.icon + ' text-xs sm:text-base'"></i>
          <span class="hidden sm:inline">{{ deal.name }}</span>
          <span class="sm:hidden">{{ deal.name.split(" ")[0] }}</span>
        </button>
      </div>

      <!-- Flash Sale Timer -->
      <div
        class="bg-yellow-100 border-l-4 border-yellow-500 p-4 sm:p-6 mb-8 rounded-r-lg"
      >
        <div
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div class="flex items-center">
            <i
              class="fas fa-clock text-xl sm:text-2xl mr-2 sm:mr-3 text-yellow-600"
            ></i>
            <div>
              <h3 class="text-base sm:text-lg font-semibold text-yellow-800">
                Flash Sale kết thúc trong:
              </h3>
              <p class="text-yellow-700 text-sm sm:text-base">
                Nhanh tay đặt hàng để không bỏ lỡ cơ hội!
              </p>
            </div>
          </div>
          <div class="flex gap-2 justify-center sm:justify-end">
            <div
              class="bg-red-500 text-white px-2 sm:px-3 py-1 sm:py-2 rounded text-center min-w-[50px] sm:min-w-[60px]"
            >
              <div class="text-lg sm:text-xl font-bold">12</div>
              <div class="text-xs">Giờ</div>
            </div>
            <div
              class="bg-red-500 text-white px-2 sm:px-3 py-1 sm:py-2 rounded text-center min-w-[50px] sm:min-w-[60px]"
            >
              <div class="text-lg sm:text-xl font-bold">34</div>
              <div class="text-xs">Phút</div>
            </div>
            <div
              class="bg-red-500 text-white px-2 sm:px-3 py-1 sm:py-2 rounded text-center min-w-[50px] sm:min-w-[60px]"
            >
              <div class="text-lg sm:text-xl font-bold">56</div>
              <div class="text-xs">Giây</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Products Grid -->
      <div v-if="loading" class="text-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"
        ></div>
        <p class="text-gray-600 mt-4">Đang tải ưu đãi...</p>
      </div>

      <div
        v-else-if="filteredDeals.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
      >
        <div
          v-for="product in filteredDeals"
          :key="product._id"
          class="relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
        >
          <!-- Sale Badge -->
          <div
            class="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg"
          >
            -{{ calculateSavings(product).percentage }}%
          </div>

          <!-- Limited Stock Badge -->
          <div
            v-if="product.stock && product.stock < 10"
            class="absolute top-3 right-3 z-10 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium animate-pulse"
          >
            Chỉ còn {{ product.stock }}
          </div>

          <!-- Product Image -->
          <div class="relative h-64 bg-gray-100">
            <img
              :src="
                (product.images && product.images[0]) ||
                '/placeholder-image.jpg'
              "
              :alt="product.name"
              class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              @error="$event.target.src = '/placeholder-image.jpg'"
            />
          </div>

          <!-- Product Info -->
          <div class="p-6">
            <h3 class="font-semibold text-gray-900 mb-3 line-clamp-2 text-base leading-tight hover:text-blue-600 transition-colors">
              {{ product.name }}
            </h3>

            <!-- Price Section -->
            <div class="mb-4">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-xl font-bold text-red-600">
                  {{ formatPrice(calculateSavings(product).salePrice) }}₫
                </span>
                <span
                  v-if="calculateSavings(product).savings > 0"
                  class="text-base text-gray-500 line-through"
                >
                  {{ formatPrice(calculateSavings(product).originalPrice) }}₫
                </span>
              </div>

              <!-- Savings Info -->
              <div
                v-if="calculateSavings(product).savings > 0"
                class="bg-green-50 px-2 py-1 rounded text-xs text-green-700 inline-block"
              >
                <i class="fas fa-dollar-sign text-green-600 mr-1"></i>Tiết kiệm
                {{ formatPrice(calculateSavings(product).savings) }}₫
              </div>
            </div>

            <!-- Rating & Sold -->
            <div
              class="flex items-center justify-between text-sm text-gray-500 mb-4"
            >
              <div class="flex items-center gap-1">
                <i class="fas fa-star text-yellow-500"></i>
                <span>{{ product.rating || 0 }}</span>
              </div>
              <div v-if="product.sold">Đã bán {{ product.sold }}</div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-2">
              <button
                @click="$router.push(`/product/${product._id}`)"
                class="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <i class="fas fa-eye text-sm"></i>
                <span class="text-sm">Mua ngay</span>
              </button>
              <button
                @click="addToCart(product)"
                class="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 px-4 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <i class="fas fa-cart-plus text-sm"></i>
                <span class="text-sm">Thêm vào giỏ</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="!loading" class="text-center py-16">
        <div class="text-8xl mb-6 text-blue-500">
          <i class="fas fa-gift"></i>
        </div>
        <h3 class="text-2xl font-semibold text-gray-900 mb-3">
          {{
            selectedDeal === "all"
              ? "Chưa có ưu đãi nào"
              : "Không có ưu đãi phù hợp"
          }}
        </h3>
        <p class="text-gray-600 mb-6">
          {{
            selectedDeal === "all"
              ? "Hiện tại chưa có chương trình khuyến mãi nào. Hãy quay lại sau!"
              : "Thử chọn loại ưu đãi khác để xem thêm sản phẩm."
          }}
        </p>
        <button
          v-if="selectedDeal !== 'all'"
          @click="filterDeals('all')"
          class="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
        >
          Xem tất cả ưu đãi
        </button>
      </div>

      <!-- Newsletter Signup -->
      <div class="bg-blue-600 text-white rounded-2xl p-8 text-center">
        <h3 class="text-2xl font-bold mb-4">
          <i class="fas fa-envelope text-white mr-3"></i>Đăng ký nhận thông báo ưu đãi
        </h3>
        <p class="mb-6 opacity-90">
          Không bỏ lỡ các chương trình khuyến mãi hấp dẫn từ chúng tôi
        </p>
        <div class="max-w-md mx-auto flex gap-4">
          <input
            type="email"
            placeholder="Nhập email của bạn..."
            class="flex-1 px-4 py-3 rounded-lg text-gray-900"
          />
          <button
            class="bg-yellow-500 hover:bg-yellow-600 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Đăng ký
          </button>
        </div>
      </div>
    </main>
  </ClientLayout>
</template>

<style scoped>
.router-link-active {
  color: #dc2626;
  background-color: #fef2f2;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
