<script setup>
import { ref, onMounted } from "vue";
import Header from "@components/client/Header.vue";
import Footer from "@components/client/Footer.vue";
import ProductCard from "@components/client/productCard.vue";
import { getCategories } from "@api/categoryService";
import { getProductsByCategory } from "@api/productService";

const categories = ref([]);
const selectedCategory = ref(null);
const categoryProducts = ref([]);
const loading = ref(false);

onMounted(async () => {
  await loadCategories();
});

const loadCategories = async () => {
  try {
    loading.value = true;
    const response = await getCategories();
    categories.value = response.data || [];
  } catch (error) {
    console.error("Error loading categories:", error);
  } finally {
    loading.value = false;
  }
};

const selectCategory = async (category) => {
  try {
    selectedCategory.value = category;
    loading.value = true;
    const response = await getProductsByCategory(category._id);
    categoryProducts.value = response.data || [];
  } catch (error) {
    console.error("Error loading category products:", error);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />
    
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">📂 Danh mục sản phẩm</h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Khám phá các danh mục sản phẩm công nghệ đa dạng và tìm kiếm những sản phẩm phù hợp với nhu cầu của bạn
        </p>
      </div>

      <!-- Categories Grid -->
      <div v-if="!selectedCategory" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mb-12">
        <div 
          v-for="category in categories" 
          :key="category._id"
          class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
          @click="selectCategory(category)"
        >
          <div class="p-6 text-center">
            <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl text-white">📱</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ category.name }}</h3>
            <p class="text-gray-600 text-sm mb-4">{{ category.description || 'Khám phá ngay' }}</p>
            <div class="bg-blue-50 rounded-lg p-2">
              <span class="text-blue-600 font-medium text-sm">Xem sản phẩm</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Category Products -->
      <div v-if="selectedCategory">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-3xl font-bold text-gray-900">{{ selectedCategory.name }}</h2>
            <p class="text-gray-600 mt-2">{{ categoryProducts.length }} sản phẩm</p>
          </div>
          <button 
            @click="selectedCategory = null; categoryProducts = []"
            class="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            ← Quay lại danh mục
          </button>
        </div>

        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="text-gray-600 mt-4">Đang tải sản phẩm...</p>
        </div>

        <div v-else-if="categoryProducts.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          <ProductCard 
            v-for="product in categoryProducts" 
            :key="product._id"
            :product="product" 
          />
        </div>

        <div v-else class="text-center py-12">
          <div class="text-6xl mb-4">📦</div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Chưa có sản phẩm</h3>
          <p class="text-gray-600">Danh mục này hiện tại chưa có sản phẩm nào.</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading && !selectedCategory" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="text-gray-600 mt-4">Đang tải danh mục...</p>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && categories.length === 0 && !selectedCategory" class="text-center py-12">
        <div class="text-6xl mb-4">📂</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Chưa có danh mục</h3>
        <p class="text-gray-600">Hiện tại chưa có danh mục sản phẩm nào được tạo.</p>
      </div>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
.router-link-active {
  @apply text-blue-600 bg-blue-50;
}
</style>
