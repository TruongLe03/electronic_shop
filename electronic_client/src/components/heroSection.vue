<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const heroSlides = [
  {
    id: 1,
    title: "Thiết Bị Điện Tử Chất Lượng Cao",
    description: "Khám phá bộ sưu tập sản phẩm điện tử mới nhất với giá ưu đãi",
    image: "",
    link: "/products",
  },
  {
    id: 2,
    title: "Giảm Giá Đến 50%",
    description: "Ưu đãi đặc biệt cho các sản phẩm công nghệ mới nhất",
    image: "",
    link: "/sale",
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

onMounted(() => {
  intervalId = setInterval(nextSlide, 5000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<template>
  <section class="relative bg-gray-100 overflow-hidden">
    <!-- Hero Content -->
    <div
      class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20"
    >
      <div
        class="transition-opacity duration-500"
        v-for="(slide, index) in heroSlides"
        :key="slide.id"
        v-show="currentSlide === index"
      >
        <div class="text-center sm:text-left">
          <h1
            class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4"
          >
            {{ slide.title }}
          </h1>
          <p class="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl">
            {{ slide.description }}
          </p>
          <router-link
            :to="slide.link"
            class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Khám phá ngay
          </router-link>
        </div>
      </div>

      <!-- Navigation Dots -->
      <div
        class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2"
      >
        <button
          v-for="(_, index) in heroSlides"
          :key="index"
          @click="currentSlide = index"
          class="w-3 h-3 rounded-full transition-colors duration-200"
          :class="currentSlide === index ? 'bg-blue-600' : 'bg-gray-400'"
        ></button>
      </div>

      <!-- Navigation Arrows -->
      <button
        @click="prevSlide"
        class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/50 hover:bg-white/75 rounded-full p-2"
      >
        ❮
      </button>
      <button
        @click="nextSlide"
        class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/50 hover:bg-white/75 rounded-full p-2"
      >
        ❯
      </button>
    </div>

    <!-- Decorative Elements -->
    <div
      class="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-blue-500/10 to-transparent"
    ></div>
    <div
      class="absolute bottom-0 right-0 w-full h-32 bg-gradient-to-t from-white to-transparent"
    ></div>

    <!-- Background Pattern -->
    <div class="absolute inset-0 z-0 opacity-10">
      <div
        class="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,transparent)]"
      ></div>
    </div>
  </section>
</template>

<style scoped></style>
