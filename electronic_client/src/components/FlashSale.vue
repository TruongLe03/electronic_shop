<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import ProductCard from "./productCard.vue";
import { getDiscountedProducts } from "../api/productService";

const scrollContainer = ref(null);
const currentSlide = ref(0);
let autoScrollInterval = null;
const itemsPerPage = 4;
const loading = ref(true);
const error = ref(null);
const saleItems = ref([]);

// Lấy danh sách sản phẩm đang giảm giá
const fetchDiscountedProducts = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await getDiscountedProducts();
    saleItems.value = response.data;
    console.log("Discounted products:", saleItems.value);
  } catch (err) {
    error.value = "Không thể tải danh sách sản phẩm giảm giá";
    console.error("Error fetching discounted products:", err);
  } finally {
    loading.value = false;
  }
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

// Show only 4 items at a time
const visibleItems = computed(() => {
  if (!saleItems.value || saleItems.value.length === 0) {
    return [];
  }
  const startIndex = currentSlide.value * itemsPerPage;
  return saleItems.value.slice(startIndex, startIndex + itemsPerPage);
});

const totalPages = computed(() => {
  if (!saleItems.value || saleItems.value.length === 0) {
    return 0;
  }
  return Math.ceil(saleItems.value.length / itemsPerPage);
});

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const scrollLeft = () => {
  if (!totalPages.value) return;

  if (currentSlide.value > 0) {
    currentSlide.value--;
  } else {
    currentSlide.value = totalPages.value - 1;
  }
};

const scrollRight = () => {
  if (!totalPages.value) return;

  if (currentSlide.value < totalPages.value - 1) {
    currentSlide.value++;
  } else {
    currentSlide.value = 0;
  }
};

const startAutoScroll = () => {
  stopAutoScroll();
  autoScrollInterval = setInterval(() => {
    scrollRight();
  }, 5000);
};

const stopAutoScroll = () => {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
  }
};

// Start auto-scroll on mount
// Khởi tạo khi component được mount
onMounted(() => {
  fetchDiscountedProducts();
  startAutoScroll();
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
  stopAutoScroll();
});

// Pause auto-scroll on hover
const handleMouseEnter = () => {
  stopAutoScroll();
};

const handleMouseLeave = () => {
  startAutoScroll();
};
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
      <div
        class="relative group"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
        <!-- Navigation Buttons -->
        <button
          @click="scrollLeft"
          class="absolute -left-5 top-1/2 -translate-y-1/2 z-10 md:flex items-center justify-center w-10 h-10 bg-white/80 hover:bg-white shadow-lg rounded-full transition-all duration-200"
        >
          <span class="text-2xl">←</span>
        </button>

        <button
          @click="scrollRight"
          class="absolute -right-5 top-1/2 -translate-y-1/2 z-10 md:flex items-center justify-center w-10 h-10 bg-white/80 hover:bg-white shadow-lg rounded-full transition-all duration-200"
        >
          <span class="text-2xl">→</span>
        </button>

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

        <!-- Grid of 4 Cards -->
        <div
          v-else
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div
            v-for="item in visibleItems"
            :key="item._id"
            class="transform transition duration-300 hover:scale-105"
          >
            <ProductCard :product="item">
              <!-- Flash Sale Badge -->
              <template #badge>
                <div
                  class="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-lg text-sm font-semibold"
                >
                  -{{ item.discount_percent }}%
                </div>
              </template>
            </ProductCard>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-if="!loading && !error && visibleItems.length === 0"
          class="text-center py-12"
        >
          <div class="text-gray-500">Không có sản phẩm giảm giá</div>
        </div>

        <!-- Progress Dots -->
        <div
          v-if="!loading && !error && totalPages > 1"
          class="flex justify-center mt-6 gap-2"
        >
          <button
            v-for="index in totalPages"
            :key="index"
            @click="currentSlide = index - 1"
            class="w-2 h-2 rounded-full transition-all duration-300"
            :class="
              index - 1 === currentSlide ? 'bg-red-600 w-4' : 'bg-gray-300'
            "
          ></button>
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
</style>
