<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import Header from "@components/client/Header.vue";
import ProductCard from "@components/client/productCard.vue";
import Footer from "@components/client/Footer.vue";
import { useCartStore } from "@stores/cart";
import { useCategories } from "@composables/useCategories";
import { useProducts } from "@composables/useProducts";
import { usePagination } from "@composables/usePagination";
import { useProductFilters } from "@composables/useProductFilters";

const cartStore = useCartStore();
const quantity = ref(1);
const route = useRoute();

// Use composables
const { categoriesWithAll, loadCategories } = useCategories();
const { 
  products, 
  loading, 
  error, 
  totalProducts,
  loadProducts,
  loadProductsByCategory,
  searchProductsByQuery,
  retryLoad
} = useProducts();
const { 
  currentPage, 
  totalPages,
  goToPage,
  updateTotal,
  scrollToTop,
  visiblePages,
  hasNextPage,
  hasPrevPage
} = usePagination(20);
const {
  selectedCategory,
  searchQuery,
  isSearchMode,
  setCategory,
  setSearchQuery
} = useProductFilters();

// Watch for total products changes to update pagination
watch(totalProducts, (newTotal) => {
  updateTotal(newTotal);
});

const handleAddToCart = async (product) => {
  try {
    const success = await cartStore.addToCart(product, quantity.value);
    if (success) {
      alert("Thêm vào giỏ hàng thành công!");
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    alert("Có lỗi xảy ra khi thêm vào giỏ hàng");
  }
};

const handleCategoryChange = async (categoryId) => {
  console.log("Selected category ID:", categoryId);

  setCategory(categoryId);
  currentPage.value = 1; // Reset to first page when changing category

  try {
    await loadProductsByCategory(categoryId, currentPage.value, 20);
  } catch (err) {
    console.error("Error in handleCategoryChange:", err);
  }
};

const handlePageChange = (page) => {
  if (goToPage(page)) {
    if (isSearchMode.value && searchQuery.value) {
      searchProductsByQuery(searchQuery.value, page, 20);
    } else {
      loadProductsByCategory(selectedCategory.value, page, 20);
    }
    scrollToTop();
  }
};

const handleRetry = () => {
  if (isSearchMode.value && searchQuery.value) {
    retryLoad('search', searchQuery.value, currentPage.value, 20);
  } else {
    retryLoad('category', selectedCategory.value, currentPage.value, 20);
  }
};

// Watch for route changes to handle search and category
watch(() => route.query.search, (newSearch) => {
  if (newSearch) {
    setSearchQuery(newSearch);
    currentPage.value = 1;
    searchProductsByQuery(newSearch, 1, 20);
  } else {
    setSearchQuery('');
  }
}, { immediate: true });

// Watch for route changes to handle category filter
watch(() => route.query.categoryId, (newCategoryId) => {
  if (newCategoryId && newCategoryId !== selectedCategory.value) {
    setCategory(newCategoryId);
    currentPage.value = 1;
    loadProductsByCategory(newCategoryId, 1, 20);
  }
}, { immediate: true });

onMounted(async () => {
  await loadCategories();
  
  // Check if there's a search query in URL
  if (route.query.search) {
    setSearchQuery(route.query.search);
    searchProductsByQuery(route.query.search, 1, 20);
  } 
  // Check if there's a category filter in URL
  else if (route.query.categoryId) {
    setCategory(route.query.categoryId);
    loadProductsByCategory(route.query.categoryId, 1, 20);
  } 
  // Default: load all products
  else {
    loadProductsByCategory(selectedCategory.value, currentPage.value, 20);
  }
});
</script>

<template>
  <Header />
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
    
    <!-- Page Header -->
    <div class="mb-6">
      <!-- Search Results Header -->
      <div v-if="isSearchMode && searchQuery">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">
          Kết quả tìm kiếm cho: "{{ searchQuery }}"
        </h2>
        <p class="text-gray-600">
          Tìm thấy {{ totalProducts }} sản phẩm
        </p>
      </div>
      
      <!-- Category Filter Header -->
      <div v-else-if="selectedCategory && selectedCategory !== 'all'">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">
          {{ categoriesWithAll.find(c => c.id === selectedCategory)?.name || 'Danh mục sản phẩm' }}
        </h2>
        <p class="text-gray-600">
          {{ totalProducts }} sản phẩm
        </p>
      </div>
      
      <!-- All Products Header -->
      <div v-else>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">
          Tất cả sản phẩm
        </h2>
        <p class="text-gray-600">
          {{ totalProducts }} sản phẩm
        </p>
      </div>
    </div>

    <!-- Category Filter -->
    <div class="mb-6" v-if="!isSearchMode">
      <h3 class="text-lg font-semibold text-gray-700 mb-3">
        Danh mục sản phẩm
      </h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="category in categoriesWithAll"
          :key="category.id"
          @click="handleCategoryChange(category.id)"
          :class="{
            'bg-blue-500 text-white': selectedCategory === category.id,
            'bg-gray-200 text-gray-700 hover:bg-gray-300':
              selectedCategory !== category.id,
          }"
          class="px-4 py-2 rounded-full transition-colors duration-200"
        >
          {{ category.name }}
        </button>
      </div>
    </div>
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="flex flex-col items-center">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
        ></div>
        <p class="mt-2 text-gray-600">Đang tải sản phẩm...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <p class="text-red-600 mb-2">❌ {{ error }}</p>
        <button
          @click="handleRetry"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          🔄 Thử lại
        </button>
      </div>
    </div>

    <!-- Products Grid -->
    <div v-if="!loading && !error && products.length > 0">
      <div class="mb-4 flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-800">
          {{
            categoriesWithAll.find((c) => c.id === selectedCategory)?.name ||
            "Tất cả sản phẩm"
          }}
          ({{ totalProducts }} sản phẩm)
        </h2>
      </div>

      <div
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6"
      >
        <ProductCard
          v-for="product in products"
          :key="product._id || product.id"
          :product="product"
        />
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center mt-8">
        <div class="flex space-x-2">
          <button
            @click="handlePageChange(currentPage - 1)"
            :disabled="!hasPrevPage"
            class="px-3 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            ← Trước
          </button>

          <!-- Show page numbers with smart truncation -->
          <template v-for="page in visiblePages" :key="page">
            <button
              v-if="typeof page === 'number'"
              @click="handlePageChange(page)"
              :class="{
                'bg-blue-500 text-white': page === currentPage,
                'bg-gray-200 text-gray-700 hover:bg-gray-300':
                  page !== currentPage,
              }"
              class="px-3 py-2 rounded transition-colors"
            >
              {{ page }}
            </button>
            <span
              v-else
              class="px-3 py-2 text-gray-500"
            >
              {{ page }}
            </span>
          </template>

          <button
            @click="handlePageChange(currentPage + 1)"
            :disabled="!hasNextPage"
            class="px-3 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Sau →
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && !error" class="text-center py-8">
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-8">
        <p class="text-gray-500 text-lg mb-4">📦 Chưa có sản phẩm nào</p>
        <button
          @click="handleRetry"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          🔄 Tải lại
        </button>
      </div>
    </div>
  </div>
  <Footer />
</template>

<style scoped>
.container {
  width: 100%;
  max-width: 1200px;
}

@media (max-width: 640px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
