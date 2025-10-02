<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const heroSlides = [
  {
    id: 1,
    title: "Thế Giới Điện Tử Tương Lai",
    subtitle: "Khám phá công nghệ tiên tiến",
    description:
      "Bộ sưu tập Arduino, IoT và thiết bị điện tử hàng đầu với giá tốt nhất thị trường",
    buttonText: "Mua Ngay",
    buttonLink: "/products",
    image:
      "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600",
    bgGradient: "from-blue-600 to-purple-700",
  },
  {
    id: 2,
    title: "Giảm Giá Sốc 50%",
    subtitle: "Ưu đại đặc biệt",
    description:
      "Chương trình khuyến mãi lớn nhất trong năm cho tất cả sản phẩm Arduino và IoT",
    buttonText: "Xem Ngay",
    buttonLink: "/deals",
    image:
      "https://images.unsplash.com/photo-1581092795442-57a7bd3bc517?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600",
    bgGradient: "from-red-600 to-pink-700",
  },
  {
    id: 3,
    title: "Arduino Starter Kit",
    subtitle: "Cho người mới bắt đầu",
    description:
      "Bộ kit hoàn chỉnh với hướng dẫn chi tiết, phù hợp cho học sinh và sinh viên",
    buttonText: "Khám Phá",
    buttonLink: "/products",
    image:
      "https://images.unsplash.com/photo-1581092916274-b24875626894?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600",
    bgGradient: "from-green-600 to-teal-700",
  },
];

const currentSlide = ref(0);
let intervalId = null;

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % heroSlides.length;
};

const prevSlide = () => {
  currentSlide.value =
    currentSlide.value === 0 ? heroSlides.length - 1 : currentSlide.value - 1;
};

const goToSlide = (index) => {
  currentSlide.value = index;
};

onMounted(() => {
  intervalId = setInterval(nextSlide, 6000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<template>
  <section class="relative h-[500px] md:h-[600px] overflow-hidden">
    <!-- Slides Container -->
    <div class="relative h-full">
      <div
        v-for="(slide, index) in heroSlides"
        :key="slide.id"
        :class="[
          'absolute inset-0 transition-all duration-700 ease-in-out',
          index === currentSlide
            ? 'opacity-100 transform translate-x-0'
            : index < currentSlide
            ? 'opacity-0 transform -translate-x-full'
            : 'opacity-0 transform translate-x-full',
        ]"
      >
        <!-- Background Image with Overlay -->
        <div
          class="absolute inset-0 bg-cover bg-center bg-no-repeat"
          :style="{ backgroundImage: `url(${slide.image})` }"
        >
          <!-- Gradient Overlay -->
          <div
            :class="[
              'absolute inset-0 bg-gradient-to-r opacity-90',
              slide.bgGradient,
            ]"
          ></div>
        </div>

        <!-- Content -->
        <div class="relative z-10 h-full flex items-center">
          <div class="container mx-auto px-4">
            <div class="max-w-2xl text-white">
              <!-- Subtitle -->
              <div class="mb-4">
                <span
                  class="inline-block bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full"
                >
                  {{ slide.subtitle }}
                </span>
              </div>

              <!-- Main Title -->
              <h1 class="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                {{ slide.title }}
              </h1>

              <!-- Description -->
              <p class="text-lg md:text-xl mb-8 leading-relaxed opacity-90">
                {{ slide.description }}
              </p>

              <!-- CTA Button -->
              <div class="flex flex-col sm:flex-row gap-4">
                <router-link
                  :to="slide.buttonLink"
                  class="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  {{ slide.buttonText }}
                  <i class="fas fa-arrow-right ml-2"></i>
                </router-link>

                <button
                  class="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-gray-900 transition-all duration-300"
                >
                  <i class="fas fa-play mr-2"></i>
                  Xem Demo
                </button>
              </div>

              <!-- Features List -->
              <div class="mt-8 flex flex-wrap gap-6 text-sm">
                <div class="flex items-center">
                  <i class="fas fa-shipping-fast mr-2 text-white/80"></i>
                  <span>Miễn phí vận chuyển</span>
                </div>
                <div class="flex items-center">
                  <i class="fas fa-medal mr-2 text-white/80"></i>
                  <span>Chất lượng đảm bảo</span>
                </div>
                <div class="flex items-center">
                  <i class="fas fa-headset mr-2 text-white/80"></i>
                  <span>Hỗ trợ 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Decorative Elements -->
        <div class="absolute bottom-0 right-0 w-1/3 h-1/3 opacity-10">
          <div class="w-full h-full bg-white rounded-tl-full"></div>
        </div>
      </div>
    </div>

    <!-- Navigation Controls -->
    <div class="absolute top-1/2 left-4 transform -translate-y-1/2 z-20">
      <button
        @click="prevSlide"
        class="w-12 h-12 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all duration-300 flex items-center justify-center group"
      >
        <i
          class="fas fa-chevron-left group-hover:scale-110 transition-transform"
        ></i>
      </button>
    </div>

    <div class="absolute top-1/2 right-4 transform -translate-y-1/2 z-20">
      <button
        @click="nextSlide"
        class="w-12 h-12 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all duration-300 flex items-center justify-center group"
      >
        <i
          class="fas fa-chevron-right group-hover:scale-110 transition-transform"
        ></i>
      </button>
    </div>

    <!-- Slide Indicators -->
    <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
      <div class="flex space-x-3">
        <button
          v-for="(slide, index) in heroSlides"
          :key="index"
          @click="goToSlide(index)"
          :class="[
            'w-3 h-3 rounded-full transition-all duration-300',
            index === currentSlide
              ? 'bg-white scale-125 shadow-lg'
              : 'bg-white/50 hover:bg-white/70',
          ]"
        ></button>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-20">
      <div
        class="h-full bg-white transition-all duration-6000 ease-linear"
        :style="{ width: `${((currentSlide + 1) / heroSlides.length) * 100}%` }"
      ></div>
    </div>
  </section>

  <!-- Features Section Below Hero -->
  <section class="py-12 bg-gray-50">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Free Shipping -->
        <div
          class="flex items-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div
            class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4"
          >
            <i class="fas fa-shipping-fast text-2xl text-blue-600"></i>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 mb-1">
              Miễn Phí Vận Chuyển
            </h3>
            <p class="text-sm text-gray-600">Đơn hàng từ 500.000đ</p>
          </div>
        </div>

        <!-- Quality Guarantee -->
        <div
          class="flex items-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div
            class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-4"
          >
            <i class="fas fa-medal text-2xl text-green-600"></i>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 mb-1">Chất Lượng Đảm Bảo</h3>
            <p class="text-sm text-gray-600">Bảo hành chính hãng 12 tháng</p>
          </div>
        </div>

        <!-- 24/7 Support -->
        <div
          class="flex items-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div
            class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mr-4"
          >
            <i class="fas fa-headset text-2xl text-purple-600"></i>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 mb-1">Hỗ Trợ 24/7</h3>
            <p class="text-sm text-gray-600">Tư vấn chuyên nghiệp</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
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

.animate-fadeInUp {
  animation: fadeInUp 0.8s ease-out;
}

/* Ensure smooth transitions */
.transition-all {
  transition-property: all;
}

.duration-6000 {
  transition-duration: 6000ms;
}
</style>
