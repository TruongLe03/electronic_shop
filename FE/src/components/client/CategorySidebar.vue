<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useCategories } from "@/composables/client/useCategories.js";

const router = useRouter();
const { categories, loading, error, loadCategories } = useCategories();

// Load categories on component mount
onMounted(async () => {
  try {
    await loadCategories();
  } catch (err) {
    console.error("Failed to load categories:", err);
  }
});

// Navigate to products page with category filter
const navigateToCategory = (category) => {
  router.push({
    path: "/products",
    query: { categoryId: category.id },
  });
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <!-- Header -->
    <div class="bg-blue-600 text-white px-4 py-3">
      <h3 class="text-lg font-semibold flex items-center">
        <i class="fas fa-list mr-2"></i>
        Danh mục sản phẩm
      </h3>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-4 text-center">
      <div class="flex items-center justify-center">
        <i class="fas fa-spinner fa-spin mr-2"></i>
        <span class="text-gray-600">Đang tải...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-4 text-center">
      <div class="text-red-500">
        <i class="fas fa-exclamation-triangle mr-2"></i>
        {{ error }}
      </div>
    </div>

    <!-- Categories List -->
    <div v-else-if="categories.length > 0" class="divide-y divide-gray-200">
      <button
        v-for="category in categories"
        :key="category.id"
        @click="navigateToCategory(category)"
        class="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors duration-200 flex items-center group"
      >
        <!-- Category Icon -->
        <div class="w-8 h-8 mr-3 flex items-center justify-center">
          <img
            v-if="category.image"
            :src="category.image"
            :alt="category.name"
            class="w-6 h-6 object-contain"
            @error="$event.target.style.display = 'none'"
          />
          <i v-else class="fas fa-microchip text-blue-500 text-sm"></i>
        </div>

        <!-- Category Info -->
        <div class="flex-1">
          <div
            class="font-medium text-gray-900 group-hover:text-blue-600 transition-colors"
          >
            {{ category.name }}
          </div>
          <div v-if="category.description" class="text-xs text-gray-500 mt-1">
            {{ category.description }}
          </div>
        </div>

        <!-- Arrow Icon -->
        <div class="text-gray-400 group-hover:text-blue-600 transition-colors">
          <i class="fas fa-chevron-right text-xs"></i>
        </div>
      </button>
    </div>

    <!-- Empty State -->
    <div v-else class="p-4 text-center text-gray-500">
      <i class="fas fa-folder-open text-2xl mb-2"></i>
      <p>Chưa có danh mục nào</p>
    </div>
  </div>
</template>

<style scoped>
/* Hover effects */
.group:hover .fas.fa-chevron-right {
  transform: translateX(2px);
}

/* Image fallback */
img[src=""] {
  display: none;
}
</style>
