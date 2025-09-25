<script setup>
import { ref, onMounted } from "vue";
import Header from "@components/client/Header.vue";
import Footer from "@components/client/Footer.vue";
import ProductCard from "@components/client/productCard.vue";
import { getDiscountedProducts } from "@api/productService";

const deals = ref([]);
const loading = ref(false);
const selectedDeal = ref("all");

const dealTypes = [
  { id: "all", name: "Tất cả", icon: "🛍️" },
  { id: "flash", name: "Flash Sale", icon: "⚡" },
  { id: "daily", name: "Deal hôm nay", icon: "📅" },
  { id: "weekend", name: "Cuối tuần", icon: "🎉" },
  { id: "clearance", name: "Thanh lý", icon: "🏷️" },
];

onMounted(async () => {
  await loadDeals();
});

const loadDeals = async () => {
  try {
    loading.value = true;
    const response = await getDiscountedProducts();
    deals.value = response.data || [];
  } catch (error) {
    console.error("Error loading deals:", error);
  } finally {
    loading.value = false;
  }
};

const filterDeals = (type) => {
  selectedDeal.value = type;
  // Có thể thêm logic filter theo type ở đây
};

const calculateSavings = (originalPrice, salePrice) => {
  const savings = originalPrice - salePrice;
  const percentage = Math.round((savings / originalPrice) * 100);
  return { savings, percentage };
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
            <span class="font-bold">{{ deals.length }}</span> sản phẩm
          </div>
          <div class="bg-white/20 px-4 py-2 rounded-lg">
            Tiết kiệm đến <span class="font-bold">5.000.000₫</span>
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

      <!-- Products Grid -->
      <div v-if="loading" class="text-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"
        ></div>
        <p class="text-gray-600 mt-4">Đang tải ưu đãi...</p>
      </div>

      <div
        v-else-if="deals.length > 0"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mb-12"
      >
        <div v-for="product in deals" :key="product._id" class="relative">
          <!-- Sale Badge -->
          <div
            class="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold"
          >
            -{{
              calculateSavings(
                product.originalPrice || product.price * 1.3,
                product.price
              ).percentage
            }}%
          </div>

          <!-- Limited Stock Badge -->
          <div
            v-if="product.stock < 10"
            class="absolute top-2 right-2 z-10 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium"
          >
            Còn {{ product.stock }} sp
          </div>

          <ProductCard :product="product" />

          <!-- Savings Info -->
          <div
            class="bg-green-50 border border-green-200 rounded-b-lg p-3 -mt-2"
          >
            <div class="text-center">
              <span class="text-green-600 font-medium text-sm">
                💰 Tiết kiệm:
                {{
                  calculateSavings(
                    product.originalPrice || product.price * 1.3,
                    product.price
                  ).savings.toLocaleString()
                }}₫
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <div class="text-6xl mb-4">🎁</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Chưa có ưu đãi</h3>
        <p class="text-gray-600">
          Hiện tại chưa có chương trình khuyến mãi nào. Hãy quay lại sau!
        </p>
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

<style scoped></style>
