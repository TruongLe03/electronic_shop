<script setup>
import { ref, onMounted, computed } from "vue";
import Header from "@components/client/Header.vue";
import Footer from "@components/client/Footer.vue";
import ProductCard from "@components/client/productCard.vue";
import { getDiscountedProducts } from "@api/productService";

const allDeals = ref([]);
const loading = ref(false);
const selectedDeal = ref("all");
const currentPage = ref(1);
const totalPages = ref(1);
const itemsPerPage = 20;

const dealTypes = [
  { id: "all", name: "Tất cả ưu đãi", icon: "🛍️", minDiscount: 0 },
  { id: "mega", name: "Siêu giảm giá", icon: "💥", minDiscount: 70 },
  { id: "hot", name: "Hot Deal", icon: "🔥", minDiscount: 50 },
  { id: "flash", name: "Flash Sale", icon: "⚡", minDiscount: 30 },
  { id: "special", name: "Khuyến mãi đặc biệt", icon: "⭐", minDiscount: 20 },
];

// Computed để filter deals theo loại được chọn
const filteredDeals = computed(() => {
  // Đảm bảo allDeals.value là array
  const deals = Array.isArray(allDeals.value) ? allDeals.value : [];
  
  if (selectedDeal.value === "all") {
    return deals;
  }
  
  const dealType = dealTypes.find(d => d.id === selectedDeal.value);
  if (!dealType) return deals;
  
  return deals.filter(product => 
    product.discount_percent >= dealType.minDiscount
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
    if (response && typeof response === 'object') {
      // API service đã xử lý và trả về response.data và response.products
      allDeals.value = Array.isArray(response.data) ? response.data : 
                       Array.isArray(response.products) ? response.products :
                       Array.isArray(response) ? response : [];
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
    percentage = Math.round(((product.price - product.discount_price) / product.price) * 100);
    salePrice = product.discount_price;
  } 
  // Nếu chỉ có discount_percent, tính discount_price
  else if (product.discount_percent) {
    salePrice = Math.round(product.price * (1 - product.discount_percent / 100));
  }
  
  const savings = originalPrice - salePrice;
  
  return { 
    savings: Math.max(0, savings), 
    percentage: Math.max(0, percentage),
    originalPrice,
    salePrice
  };
};

// Hàm định dạng số tiền
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price);
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero Section -->
      <div
        class="bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl text-white p-8 mb-12 text-center"
      >
        <h1 class="text-4xl md:text-5xl font-bold mb-4">🔥 Khuyến mãi Hot</h1>
        <p class="text-xl md:text-2xl opacity-90 mb-6">
          Giảm giá lên đến 70% - Cơ hội vàng không thể bỏ lỡ!
        </p>
        <div class="flex justify-center items-center gap-4 text-lg">
          <div class="bg-white/20 px-4 py-2 rounded-lg">
            <span class="font-bold">{{ filteredDeals.length }}</span> sản phẩm
          </div>
          <div class="bg-white/20 px-4 py-2 rounded-lg">
            Tiết kiệm đến <span class="font-bold">{{ formatPrice(totalSavings) }}₫</span>
          </div>
        </div>
      </div>

      <!-- Deal Type Filter -->
      <div class="flex flex-wrap gap-4 mb-8 justify-center">
        <button
          v-for="deal in dealTypes"
          :key="deal.id"
          @click="filterDeals(deal.id)"
          :class="[
            'px-6 py-3 rounded-full font-medium transition-all duration-200 flex items-center gap-2',
            selectedDeal === deal.id
              ? 'bg-red-500 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 shadow-md',
          ]"
        >
          <span>{{ deal.icon }}</span>
          {{ deal.name }}
        </button>
      </div>

      <!-- Flash Sale Timer -->
      <div
        class="bg-yellow-100 border-l-4 border-yellow-500 p-6 mb-8 rounded-r-lg"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <span class="text-2xl mr-3">⏰</span>
            <div>
              <h3 class="text-lg font-semibold text-yellow-800">
                Flash Sale kết thúc trong:
              </h3>
              <p class="text-yellow-700">
                Nhanh tay đặt hàng để không bỏ lỡ cơ hội!
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            <div
              class="bg-red-500 text-white px-3 py-2 rounded text-center min-w-[60px]"
            >
              <div class="text-xl font-bold">12</div>
              <div class="text-xs">Giờ</div>
            </div>
            <div
              class="bg-red-500 text-white px-3 py-2 rounded text-center min-w-[60px]"
            >
              <div class="text-xl font-bold">34</div>
              <div class="text-xs">Phút</div>
            </div>
            <div
              class="bg-red-500 text-white px-3 py-2 rounded text-center min-w-[60px]"
            >
              <div class="text-xl font-bold">56</div>
              <div class="text-xs">Giây</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics Bar -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div class="text-3xl font-bold text-red-500">{{ filteredDeals.length }}</div>
            <div class="text-gray-600">Sản phẩm khuyến mãi</div>
          </div>
          <div>
            <div class="text-3xl font-bold text-green-500">{{ formatPrice(totalSavings) }}₫</div>
            <div class="text-gray-600">Tổng tiết kiệm</div>
          </div>
          <div>
            <div class="text-3xl font-bold text-blue-500">
              {{ filteredDeals.length > 0 ? Math.max(...filteredDeals.map(p => p.discount_percent || 0)) : 0 }}%
            </div>
            <div class="text-gray-600">Giảm giá cao nhất</div>
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
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12"
      >
        <div v-for="product in filteredDeals" :key="product._id" class="relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
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
          <div class="relative aspect-square bg-gray-100">
            <img
              :src="product.images && product.images[0] || '/placeholder-image.jpg'"
              :alt="product.name"
              class="w-full h-full object-cover"
              @error="$event.target.src = '/placeholder-image.jpg'"
            />
          </div>

          <!-- Product Info -->
          <div class="p-4">
            <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
              {{ product.name }}
            </h3>
            
            <!-- Price Section -->
            <div class="mb-3">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-lg font-bold text-red-600">
                  {{ formatPrice(calculateSavings(product).salePrice) }}₫
                </span>
                <span v-if="calculateSavings(product).savings > 0" class="text-sm text-gray-500 line-through">
                  {{ formatPrice(calculateSavings(product).originalPrice) }}₫
                </span>
              </div>
              
              <!-- Savings Info -->
              <div v-if="calculateSavings(product).savings > 0" class="bg-green-50 px-2 py-1 rounded text-xs text-green-700 inline-block">
                💰 Tiết kiệm {{ formatPrice(calculateSavings(product).savings) }}₫
              </div>
            </div>

            <!-- Rating & Sold -->
            <div class="flex items-center justify-between text-xs text-gray-500 mb-3">
              <div class="flex items-center gap-1">
                <span class="text-yellow-500">⭐</span>
                <span>{{ product.rating || 0 }}</span>
              </div>
              <div v-if="product.sold">
                Đã bán {{ product.sold }}
              </div>
            </div>

            <!-- Action Button -->
            <button 
              @click="$router.push(`/product/${product._id}`)"
              class="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-2 px-4 rounded-lg font-medium hover:from-red-600 hover:to-pink-700 transition-all duration-200"
            >
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="!loading" class="text-center py-16">
        <div class="text-8xl mb-6">🎁</div>
        <h3 class="text-2xl font-semibold text-gray-900 mb-3">
          {{ selectedDeal === 'all' ? 'Chưa có ưu đãi nào' : 'Không có ưu đãi phù hợp' }}
        </h3>
        <p class="text-gray-600 mb-6">
          {{ selectedDeal === 'all' 
              ? 'Hiện tại chưa có chương trình khuyến mãi nào. Hãy quay lại sau!' 
              : 'Thử chọn loại ưu đãi khác để xem thêm sản phẩm.'
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
          📬 Đăng ký nhận thông báo ưu đãi
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

    <Footer />
  </div>
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
