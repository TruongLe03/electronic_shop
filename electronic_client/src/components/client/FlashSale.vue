<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import ProductCard from "./productCard.vue";
import { getDiscountedProducts } from "@api/productService";

const router = useRouter();
const loading = ref(true);
const error = ref(null);
const discountedProducts = ref([]);
const scrollContainer = ref(null);

// Lấy danh sách sản phẩm đang giảm giá
const fetchDiscountedProducts = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await getDiscountedProducts();
    discountedProducts.value = response.data;
    console.log("Discounted products:", discountedProducts.value);
  } catch (err) {
    error.value = "Không thể tải danh sách sản phẩm giảm giá";
    console.error("Error fetching discounted products:", err);
  } finally {
    loading.value = false;
  }
};

// Horizontal scroll functions
const scrollLeft = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({ left: -320, behavior: 'smooth' });
  }
};

const scrollRight = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({ left: 320, behavior: 'smooth' });
  }
};

// Navigate to deals page
const goToDeals = () => {
  router.push('/deals');
};

// Tính toán thời gian còn lại của flash sale
const endTime = ref(new Date().getTime() + 24 * 60 * 60 * 1000); // 24 giờ từ hiện tại
const timeRemaining = ref({
  hours: "00",
  minutes: "00",
  seconds: "00",
});

const updateTimer = () => {
  const now = new Date().getTime();
  const distance = endTime.value - now;

  if (distance > 0) {
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    timeRemaining.value = {
      hours: hours.toString().padStart(2, "0"),
      minutes: minutes.toString().padStart(2, "0"),
      seconds: seconds.toString().padStart(2, "0"),
    };
  }
};

// Start auto-scroll on mount
// Khởi tạo khi component được mount
onMounted(() => {
  fetchDiscountedProducts();
  updateTimer();
  // Cập nhật timer mỗi giây
  const timerInterval = setInterval(updateTimer, 1000);

  // Clean up interval khi unmount
  onUnmounted(() => {
    clearInterval(timerInterval);
  });
});

// Clean up on unmount
onUnmounted(() => {
  // No additional cleanup needed
});
</script>

<template>
  <section class="py-12 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center mb-12">
        <div class="flex items-center justify-center gap-4 mb-4">
          <h2 class="text-3xl font-bold text-gray-900">Flash Sale</h2>
          <!-- Countdown Timer -->
          <div
            class="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            <div class="flex items-center">
              <span class="text-2xl font-bold">{{ timeRemaining.hours }}</span>
              <span class="text-sm ml-1">giờ</span>
            </div>
            <span class="text-2xl">:</span>
            <div class="flex items-center">
              <span class="text-2xl font-bold">{{
                timeRemaining.minutes
              }}</span>
              <span class="text-sm ml-1">phút</span>
            </div>
            <span class="text-2xl">:</span>
            <div class="flex items-center">
              <span class="text-2xl font-bold">{{
                timeRemaining.seconds
              }}</span>
              <span class="text-sm ml-1">giây</span>
            </div>
          </div>
        </div>
        <div class="w-24 h-1 bg-red-600 mx-auto"></div>
      </div>

      <!-- Cards Container -->
      <div class="relative">
        <!-- Loading State -->
        <div
          v-if="loading"
          class="flex justify-center items-center min-h-[300px]"
        >
          <div
            class="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"
          ></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-12">
          <div class="text-red-500 mb-4">{{ error }}</div>
          <button
            @click="fetchDiscountedProducts"
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>

        <!-- Flash Sale Products Slider -->
        <div v-else-if="discountedProducts.length > 0" class="relative">
          <!-- Scrollable Container -->
          <div
            ref="scrollContainer"
            class="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style="scrollbar-width: none; -ms-overflow-style: none;"
          >
            <div
              v-for="product in discountedProducts"
              :key="product._id"
              class="flex-none w-64 transform transition duration-300 hover:scale-105"
            >
              <ProductCard :product="product">
                <!-- Flash Sale Badge -->
                <template #badge>
                  <div
                    class="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-lg text-sm font-semibold"
                  >
                    -{{ product.discount_percent }}%
                  </div>
                </template>
              </ProductCard>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <button
            @click="scrollLeft"
            class="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
          >
            ‹
          </button>
          <button
            @click="scrollRight"
            class="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
          >
            ›
          </button>

          <!-- View More Button -->
          <div class="text-center mt-8">
            <button
              @click="goToDeals"
              class="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 transform hover:scale-105"
            >
              Xem thêm Flash Sale
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="text-center py-12"
        >
          <div class="text-gray-500">Không có sản phẩm giảm giá</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Ẩn scrollbar */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
