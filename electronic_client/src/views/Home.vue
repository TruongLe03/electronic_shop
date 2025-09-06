<script setup>
import { ref, onMounted } from "vue";
import Header from "../components/Header.vue";
import ProductCard from "../components/productCard.vue";
import heroSection from "../components/heroSection.vue";
import FlashSale from "../components/FlashSale.vue";
import bestSeller from "../components/bestSeller.vue";
import newProducts from "../components/newProducts.vue";
import Footer from "../components/Footer.vue";
import { getProducts } from "../api/productService";

const products = ref([]);
const loading = ref(false);
const error = ref(null);
const currentPage = ref(1);
const itemsPerPage = 8; // Giảm số lượng để hiển thị đẹp hơn
const totalPages = ref(0);
const totalProducts = ref(0);

// Thêm state cho các section mới
const featuredCategories = ref([
  {
    id: 1,
    name: "Arduino & Vi điều khiển",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop",
    count: "150+ sản phẩm",
    color: "from-blue-500 to-purple-600"
  },
  {
    id: 2,
    name: "Cảm biến IoT",
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop",
    count: "200+ sản phẩm",
    color: "from-green-500 to-teal-600"
  },
  {
    id: 3,
    name: "Robot & Automation",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=200&fit=crop",
    count: "80+ sản phẩm",
    color: "from-orange-500 to-red-600"
  },
  {
    id: 4,
    name: "Phụ kiện điện tử",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop",
    count: "300+ sản phẩm",
    color: "from-purple-500 to-pink-600"
  }
]);

const statistics = ref([
  { label: "Sản phẩm", value: "1000+", icon: "📦" },
  { label: "Khách hàng", value: "5000+", icon: "👥" },
  { label: "Đơn hàng", value: "15000+", icon: "📊" },
  { label: "Đánh giá 5 sao", value: "98%", icon: "⭐" }
]);

const services = ref([
  {
    icon: "🚚",
    title: "Giao hàng nhanh",
    description: "Giao hàng trong 24h tại TP.HCM và Hà Nội"
  },
  {
    icon: "🔧",
    title: "Hỗ trợ kỹ thuật",
    description: "Đội ngũ kỹ sư hỗ trợ 24/7"
  },
  {
    icon: "💎",
    title: "Chất lượng cao",
    description: "Sản phẩm chính hãng, bảo hành đầy đủ"
  },
  {
    icon: "💰",
    title: "Giá tốt nhất",
    description: "Cam kết giá tốt nhất thị trường"
  }
]);

const loadProducts = async (page = 1) => {
  try {
    loading.value = true;
    error.value = null;

    console.log(`Loading products for page ${page} with limit ${itemsPerPage}`);

    const result = await getProducts(page, itemsPerPage);
    console.log("Load products result:", result);

    // More detailed debugging
    console.log("Result type:", typeof result);
    console.log("Result keys:", result ? Object.keys(result) : "null");
    console.log("Result.data:", result?.data);
    console.log("Result.data type:", typeof result?.data);
    console.log("Is result.data array?", Array.isArray(result?.data));

    if (result && result.data && Array.isArray(result.data)) {
      products.value = result.data;
      totalProducts.value = result.total || result.data.length;
      totalPages.value = Math.ceil(totalProducts.value / itemsPerPage);

      console.log("Products set successfully:", {
        count: products.value.length,
        total: totalProducts.value,
        pages: totalPages.value,
      });
    } else {
      console.error("Invalid result structure:", result);
      error.value = "Dữ liệu sản phẩm không hợp lệ";
      products.value = [];
    }
  } catch (err) {
    console.error("Load products error:", err);
    error.value = err.message || "Không thể tải sản phẩm";
    products.value = [];
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page;
    loadProducts(page);
  }
};

const retryLoad = () => {
  loadProducts(currentPage.value);
};

onMounted(() => {
  console.log("Component mounted, loading products...");
  loadProducts(currentPage.value);
});
</script>

<template>
  <Header />
  
  <!-- Hero Section -->
  <heroSection />
  
  <!-- Statistics Section -->
  <section class="py-12 bg-gradient-to-r from-blue-50 to-indigo-100">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div v-for="stat in statistics" :key="stat.label" 
             class="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div class="text-3xl mb-2">{{ stat.icon }}</div>
          <div class="text-2xl font-bold text-gray-800 mb-1">{{ stat.value }}</div>
          <div class="text-gray-600 text-sm">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Flash Sale -->
  <FlashSale />
  
  <!-- Featured Categories -->
  <section class="py-16 bg-gray-50">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-800 mb-4">Danh mục nổi bật</h2>
        <p class="text-gray-600 max-w-2xl mx-auto">
          Khám phá các danh mục sản phẩm điện tử hàng đầu với chất lượng tốt nhất
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="category in featuredCategories" :key="category.id"
             class="group cursor-pointer transform hover:scale-105 transition-all duration-300">
          <div class="relative overflow-hidden rounded-xl shadow-lg">
            <div :class="`absolute inset-0 bg-gradient-to-t ${category.color} opacity-80`"></div>
            <img :src="category.image" :alt="category.name" 
                 class="w-full h-48 object-cover">
            <div class="absolute inset-0 flex flex-col justify-end p-6 text-white">
              <h3 class="text-lg font-semibold mb-1">{{ category.name }}</h3>
              <p class="text-sm opacity-90">{{ category.count }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Best Sellers -->
  <bestSeller />
  
  <!-- New Products -->
  <newProducts />
  
  <!-- Services Section -->
  <section class="py-16 bg-white">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-800 mb-4">Tại sao chọn chúng tôi?</h2>
        <p class="text-gray-600 max-w-2xl mx-auto">
          Chúng tôi cam kết mang đến trải nghiệm mua sắm tuyệt vời nhất cho khách hàng
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div v-for="service in services" :key="service.title"
             class="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors duration-300">
          <div class="text-4xl mb-4">{{ service.icon }}</div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ service.title }}</h3>
          <p class="text-gray-600 text-sm">{{ service.description }}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Newsletter Section -->
  <section class="py-16 bg-gradient-to-r from-indigo-600 to-purple-600">
    <div class="container mx-auto px-4 text-center">
      <div class="max-w-2xl mx-auto">
        <h2 class="text-3xl font-bold text-white mb-4">
          🔔 Đăng ký nhận tin tức mới nhất
        </h2>
        <p class="text-indigo-100 mb-8">
          Nhận thông báo về sản phẩm mới, khuyến mãi đặc biệt và tin tức công nghệ
        </p>
        <div class="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input type="email" placeholder="Nhập email của bạn" 
                 class="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-yellow-400 outline-none">
          <button class="px-6 py-3 bg-yellow-400 text-gray-800 font-semibold rounded-lg hover:bg-yellow-300 transition-colors">
            Đăng ký ngay
          </button>
        </div>
      </div>
    </div>
  </section>

  <!-- Featured Products Grid -->
  <section class="py-16 bg-gray-50">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-800 mb-4">Sản phẩm nổi bật</h2>
        <p class="text-gray-600">Những sản phẩm được yêu thích nhất</p>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="flex flex-col items-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          <p class="mt-4 text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
          <div class="text-red-500 text-4xl mb-4">⚠️</div>
          <p class="text-red-600 mb-4">{{ error }}</p>
          <button @click="retryLoad"
                  class="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
            🔄 Thử lại
          </button>
        </div>
      </div>

      <!-- Products Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <ProductCard v-for="product in products" :key="product._id" :product="product" />
      </div>

      <!-- View All Products Button -->
      <div v-if="products.length > 0" class="text-center mt-12">
        <router-link to="/products" 
                     class="inline-flex items-center px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg">
          <span>Xem tất cả sản phẩm</span>
          <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
          </svg>
        </router-link>
      </div>
    </div>
  </section>

  <Footer />
</template>

<style scoped>
.container {
  width: 100%;
  max-width: 1200px;
}

/* Custom animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

/* Hover effects */
.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}

/* Gradient text */
.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Custom shadows */
.shadow-xl-colored {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .grid-cols-2 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .text-3xl {
    font-size: 1.875rem;
    line-height: 2.25rem;
  }
}

/* Newsletter section styling */
section:nth-of-type(6) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Service cards hover effect */
.service-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.service-card:hover {
  border-color: #6366f1;
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.1);
}
</style>
