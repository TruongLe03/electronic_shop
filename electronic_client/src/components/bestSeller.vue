<script setup>
import productCard from "./productCard.vue";
</script>

<template>
  <section class="py-8 px-4 md:px-8 lg:px-16 bg-gray-50">
    <h2 class="text-2xl md:text-3xl font-bold mb-6 text-gray-800 text-center">
      Best Sellers
    </h2>
    <div
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      <div
        v-for="item in bestSellers"
        :key="item.id"
        class="bg-white rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col items-center"
      >
        <img
          :src="item.image"
          :alt="item.name"
          class="w-32 h-32 object-contain mb-4"
        />
        <h3 class="text-lg font-semibold text-gray-700 mb-2 text-center">
          {{ item.name }}
        </h3>
        <p class="text-gray-500 mb-2 text-center">{{ item.category }}</p>
        <span class="text-xl font-bold text-blue-600 mb-4">
          ${{ item.price }}
        </span>
        <button
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full"
        >
          Buy Now
        </button>
      </div>
    </div>
  </section>
</template>
