<script setup>
import { ref, computed, onMounted } from "vue";
import Header from "@components/client/Header.vue";
import Footer from "@components/client/Footer.vue";

const brands = ref([]);
const selectedBrand = ref(null);
const loading = ref(false);

const popularBrands = ref([
  {
    id: 1,
    name: "Apple",
    logo: "🍎",
    description: "Thiết kế tinh tế, công nghệ tiên tiến",
    productCount: 45,
    featured: true,
    color: "from-gray-800 to-gray-600"
  },
  {
    id: 2,
    name: "Samsung",
    logo: "📱",
    description: "Đổi mới không ngừng, chất lượng vượt trội",
    productCount: 38,
    featured: true,
    color: "from-blue-600 to-blue-800"
  },
  {
    id: 3,
    name: "Xiaomi",
    logo: "🔥",
    description: "Công nghệ cao, giá cả hợp lý",
    productCount: 32,
    featured: true,
    color: "from-orange-500 to-red-600"
  },
  {
    id: 4,
    name: "Oppo",
    logo: "🎨",
    description: "Chuyên gia selfie và sạc nhanh",
    productCount: 28,
    featured: true,
    color: "from-green-500 to-emerald-600"
  },
  {
    id: 5,
    name: "Vivo",
    logo: "🎵",
    description: "Âm thanh hoàn hảo, camera chuyên nghiệp",
    productCount: 25,
    featured: false,
    color: "from-purple-500 to-indigo-600"
  },
  {
    id: 6,
    name: "Realme",
    logo: "⚡",
    description: "Hiệu năng mạnh mẽ cho giới trẻ",
    productCount: 22,
    featured: false,
    color: "from-yellow-500 to-orange-500"
  },
  {
    id: 7,
    name: "Huawei",
    logo: "🌟",
    description: "Kết nối thông minh, tương lai trong tay",
    productCount: 20,
    featured: false,
    color: "from-red-500 to-pink-600"
  },
  {
    id: 8,
    name: "Asus",
    logo: "🎮",
    description: "Gaming và công việc chuyên nghiệp",
    productCount: 18,
    featured: false,
    color: "from-gray-700 to-gray-900"
  }
]);

onMounted(() => {
  brands.value = popularBrands.value;
});

const selectBrand = (brand) => {
  selectedBrand.value = brand;
  // Có thể chuyển hướng đến trang sản phẩm của thương hiệu
  // router.push(`/products?brand=${brand.name}`);
};

const featuredBrands = computed(() => {
  return brands.value.filter(brand => brand.featured);
});

const otherBrands = computed(() => {
  return brands.value.filter(brand => !brand.featured);
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />
    
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">🏷️ Thương hiệu nổi bật</h1>
        <p class="text-lg text-gray-600 max-w-3xl mx-auto">
          Khám phá các thương hiệu công nghệ hàng đầu thế giới với đa dạng sản phẩm chất lượng cao
        </p>
      </div>

      <!-- Featured Brands -->
      <div class="mb-16">
        <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">⭐ Thương hiệu hàng đầu</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div 
            v-for="brand in featuredBrands" 
            :key="brand.id"
            class="group cursor-pointer transform hover:-translate-y-2 transition-all duration-300"
            @click="selectBrand(brand)"
          >
            <div :class="`bg-gradient-to-br ${brand.color} rounded-2xl p-6 text-white shadow-xl group-hover:shadow-2xl`">
              <div class="text-center">
                <div class="text-4xl mb-4">{{ brand.logo }}</div>
                <h3 class="text-xl font-bold mb-2">{{ brand.name }}</h3>
                <p class="text-sm opacity-90 mb-4">{{ brand.description }}</p>
                <div class="bg-white/20 rounded-full px-4 py-2 inline-block">
                  <span class="text-sm font-medium">{{ brand.productCount }} sản phẩm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Other Brands -->
      <div class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">🔍 Thương hiệu khác</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div 
            v-for="brand in otherBrands" 
            :key="brand.id"
            class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            @click="selectBrand(brand)"
          >
            <div class="p-6 text-center">
              <div class="text-3xl mb-3">{{ brand.logo }}</div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ brand.name }}</h3>
              <p class="text-sm text-gray-600 mb-3">{{ brand.description }}</p>
              <div class="bg-gray-100 rounded-full px-3 py-1 inline-block">
                <span class="text-xs font-medium text-gray-700">{{ brand.productCount }} sản phẩm</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Brand Categories -->
      <div class="bg-white rounded-2xl shadow-lg p-8 mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">📂 Danh mục thương hiệu</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <div class="text-center p-6 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all">
            <div class="text-3xl mb-4">📱</div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Điện thoại</h3>
            <p class="text-gray-600 mb-4">iPhone, Samsung Galaxy, Xiaomi, Oppo, Vivo</p>
            <button class="text-blue-600 hover:text-blue-800 font-medium">Xem tất cả →</button>
          </div>

          <div class="text-center p-6 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all">
            <div class="text-3xl mb-4">💻</div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Laptop</h3>
            <p class="text-gray-600 mb-4">MacBook, Dell, HP, Asus, Lenovo, Acer</p>
            <button class="text-green-600 hover:text-green-800 font-medium">Xem tất cả →</button>
          </div>

          <div class="text-center p-6 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all">
            <div class="text-3xl mb-4">🎧</div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Phụ kiện</h3>
            <p class="text-gray-600 mb-4">AirPods, JBL, Sony, Anker, Belkin</p>
            <button class="text-purple-600 hover:text-purple-800 font-medium">Xem tất cả →</button>
          </div>
        </div>
      </div>

      <!-- Brand News -->
      <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-white p-8 text-center">
        <h2 class="text-2xl font-bold mb-4">📰 Tin tức thương hiệu</h2>
        <p class="mb-6 opacity-90">Cập nhật những thông tin mới nhất về sản phẩm và công nghệ từ các thương hiệu hàng đầu</p>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div class="bg-white/10 rounded-lg p-4">
            <h4 class="font-semibold mb-2">🍎 Apple ra mắt iPhone 15</h4>
            <p class="text-sm opacity-90">Thiết kế mới, camera cải tiến</p>
          </div>
          <div class="bg-white/10 rounded-lg p-4">
            <h4 class="font-semibold mb-2">📱 Samsung Galaxy S24</h4>
            <p class="text-sm opacity-90">AI tích hợp, hiệu năng vượt trội</p>
          </div>
          <div class="bg-white/10 rounded-lg p-4">
            <h4 class="font-semibold mb-2">🔥 Xiaomi giảm giá sốc</h4>
            <p class="text-sm opacity-90">Ưu đãi lên đến 50%</p>
          </div>
        </div>
        <button class="mt-6 bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
          Đọc thêm tin tức
        </button>
      </div>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
/* Custom styles nếu cần */
</style>
