<template>
  <div class="w-4/5 mx-auto p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-6 text-gray-800 text-center">
      Sản phẩm mới (New Arrivals)
    </h2>
    <div class="relative group flex justify-center">
      <!-- Navigation Buttons -->
      <button
        @click="prevSlide"
        :disabled="currentIndex <= 0"
        class="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0"
      >
        ‹
      </button>

      <!-- Slider Container -->
      <div class="overflow-hidden w-full">
        <div
          class="flex transition-transform duration-300 ease-in-out gap-4 justify-center"
          :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
        >
          <div
            v-for="product in products"
            :key="product.id"
            class="flex-none w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-2"
          >
            <div
              class="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div class="flex flex-col items-center">
                <img
                  :src="product.image"
                  :alt="product.name"
                  class="w-32 h-32 object-contain mb-4 transition-transform duration-200 hover:scale-105"
                />
                <h3 class="font-semibold text-gray-800 mb-2 text-center">
                  {{ product.name }}
                </h3>
                <p class="text-gray-600 text-sm mb-3 text-center">
                  {{ product.description }}
                </p>
                <span class="text-red-600 font-bold text-lg">
                  {{ product.price }}₫
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        @click="nextSlide"
        :disabled="currentIndex >= products.length - visibleCount"
        class="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
      >
        ›
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const products = ref([
  {
    id: 1,
    name: "Linh kiện A",
    description: "Mô tả linh kiện A",
    price: "1.200.000",
    image: "https://via.placeholder.com/150",
  },
  {
    id: 2,
    name: "Linh kiện B",
    description: "Mô tả linh kiện B",
    price: "950.000",
    image: "https://via.placeholder.com/150",
  },
  {
    id: 3,
    name: "Linh kiện C",
    description: "Mô tả linh kiện C",
    price: "2.500.000",
    image: "https://via.placeholder.com/150",
  },
  {
    id: 4,
    name: "Linh kiện D",
    description: "Mô tả linh kiện D",
    price: "800.000",
    image: "https://via.placeholder.com/150",
  },
  {
    id: 5,
    name: "Linh kiện E",
    description: "Mô tả linh kiện E",
    price: "1.700.000",
    image: "https://via.placeholder.com/150",
  },
]);

const currentIndex = ref(0);
const visibleCount = ref(4);

const nextSlide = () => {
  if (currentIndex.value < products.value.length - visibleCount.value) {
    currentIndex.value++;
  }
};

const prevSlide = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};

// Compute visible count based on screen size
const updateVisibleCount = () => {
  if (window.innerWidth < 640) {
    visibleCount.value = 1; // Mobile
  } else if (window.innerWidth < 768) {
    visibleCount.value = 2; // Tablet
  } else if (window.innerWidth < 1024) {
    visibleCount.value = 3; // Small Desktop
  } else {
    visibleCount.value = 4; // Large Desktop
  }
};

// Add resize listener
if (typeof window !== "undefined") {
  window.addEventListener("resize", updateVisibleCount);
  updateVisibleCount(); // Initial call
}
</script>

<style scoped>
.new-products {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px #eee;
}
.slider-container {
  display: flex;
  align-items: center;
  margin-top: 16px;
}
.slider {
  display: flex;
  overflow: hidden;
  width: 100%;
}
.product-card {
  flex: 0 0 200px;
  margin: 0 8px;
  background: #f9f9f9;
  border-radius: 6px;
  padding: 12px;
  text-align: center;
  box-shadow: 0 1px 4px #ddd;
}
.product-card img {
  width: 100px;
  height: 100px;
  object-fit: contain;
  margin-bottom: 8px;
}
.price {
  color: #e53935;
  font-weight: bold;
}
.slider-btn {
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 20px;
  cursor: pointer;
  margin: 0 8px;
}
.slider-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
