<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRoute } from "vue-router";
import ClientLayout from "@/layout/ClientLayout.vue";
import ProductCard from "@components/client/productCard.vue";
import { useCartStore } from "@stores/cart.js";
import { useCategories } from "@/composables/client/useCategories.js";
import { useProducts } from "@/composables/client/useProducts.js";
import { usePagination } from "@/composables/client/usePagination.js";
import { useProductFilters } from "@/composables/client/useProductFilters.js";

const cartStore = useCartStore();
const quantity = ref(1);
const route = useRoute();

// Advanced filter states
const sortBy = ref("newest"); // newest, oldest, price-asc, price-desc, name-asc, name-desc
const priceRange = ref("");
const showFilters = ref(false);
const originalProducts = ref([]); // Store original products for client-side filtering

// Computed property for filtered products count
const filteredProductsCount = computed(() => {
  return getFilteredAndSortedProducts().length;
});

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
  retryLoad,
} = useProducts();
const {
  currentPage,
  totalPages,
  goToPage,
  updateTotal,
  scrollToTop,
  visiblePages,
  hasNextPage,
  hasPrevPage,
} = usePagination(20);
const {
  selectedCategory,
  searchQuery,
  isSearchMode,
  setCategory,
  setSearchQuery,
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
    } else {
      // Nếu không thành công (có thể do chưa đăng nhập), lưu intended route và chuyển đến login
      const currentPath = window.location.pathname + window.location.search;
      localStorage.setItem('intendedRoute', currentPath);
      window.location.href = '/login';
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    alert("Có lỗi xảy ra khi thêm vào giỏ hàng");
  }
};

// Advanced filter functions
const applySort = (products) => {
  const sorted = [...products];

  switch (sortBy.value) {
    case "price-asc":
      return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    case "price-desc":
      return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    case "name-asc":
      return sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    case "name-desc":
      return sorted.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    case "newest":
      return sorted.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    case "oldest":
      return sorted.sort(
        (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      );
    default:
      return sorted;
  }
};

const applyPriceFilter = (products) => {
  if (!priceRange.value) return products;

  const ranges = {
    "under-100": [0, 100000],
    "100-200": [100000, 200000],
    "200-400": [200000, 400000],
    "400-1000": [400000, 1000000],
    "over-1000": [1000000, Infinity],
  };

  const [min, max] = ranges[priceRange.value] || [0, Infinity];

  return products.filter((product) => {
    const price = product.price || 0;
    return price >= min && price <= max;
  });
};

const getFilteredAndSortedProducts = () => {
  let filtered = [...products.value];
  filtered = applyPriceFilter(filtered);
  filtered = applySort(filtered);
  return filtered;
};

const handleSortChange = () => {
  // Force re-render by updating products array
  const filtered = getFilteredAndSortedProducts();
  products.value = filtered;
};

const handlePriceFilterChange = () => {
  const filtered = getFilteredAndSortedProducts();
  products.value = filtered;
};

const clearFilters = () => {
  sortBy.value = "newest";
  priceRange.value = "";
  // Reload products based on current context
  if (isSearchMode.value && searchQuery.value) {
    searchProductsByQuery(searchQuery.value, currentPage.value, 20);
  } else {
    loadProductsByCategory(selectedCategory.value, currentPage.value, 20);
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
    retryLoad("search", searchQuery.value, currentPage.value, 20);
  } else {
    retryLoad("category", selectedCategory.value, currentPage.value, 20);
  }
};

// Watch for route changes to handle search and category
watch(
  () => route.query.search,
  (newSearch) => {
    if (newSearch) {
      setSearchQuery(newSearch);
      currentPage.value = 1;
      searchProductsByQuery(newSearch, 1, 20);
    } else {
      setSearchQuery("");
    }
  },
  { immediate: true }
);

// Watch for route changes to handle category filter
watch(
  () => route.query.categoryId,
  (newCategoryId) => {
    if (newCategoryId && newCategoryId !== selectedCategory.value) {
      setCategory(newCategoryId);
      currentPage.value = 1;
      loadProductsByCategory(newCategoryId, 1, 20);
    }
  },
  { immediate: true }
);

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
  <ClientLayout>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
    <div
      class="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8"
    >
      <!-- Page Header -->
      <div class="mb-6">
        <!-- Search Results Header -->
        <div v-if="isSearchMode && searchQuery">
          <div class="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div class="flex items-center gap-3 mb-2">
              <div
                class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-gray-800">Kết quả tìm kiếm</h2>
            </div>
            <p class="text-gray-600">
              Tìm kiếm cho: "<span class="font-semibold text-blue-600">{{
                searchQuery
              }}</span
              >"
            </p>
            <p class="text-sm text-gray-500 mt-1">
              Tìm thấy {{ totalProducts }} sản phẩm
            </p>
          </div>
        </div>

        <!-- Category Filter Header -->
        <div v-else-if="selectedCategory && selectedCategory !== 'all'">
          <div class="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div class="flex items-center gap-3 mb-2">
              <div
                class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-gray-800">
                {{
                  categoriesWithAll.find((c) => c.id === selectedCategory)
                    ?.name || "Danh mục sản phẩm"
                }}
              </h2>
            </div>
            <p class="text-sm text-gray-500">{{ totalProducts }} sản phẩm</p>
          </div>
        </div>
      </div>

      <!-- Category Filter -->
      <div class="mb-6" v-if="!isSearchMode">
        <div
          class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <div
            class="px-4 sm:px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100"
          >
            <h3
              class="text-lg font-semibold text-gray-800 flex items-center gap-2"
            >
              <i class="fas fa-folder text-xl text-blue-600 mr-2"></i>
              Danh mục sản phẩm
            </h3>
          </div>
          <div class="p-4 sm:p-6">
            <!-- Mobile: Horizontal Scroll -->
            <div class="sm:hidden">
              <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  v-for="category in categoriesWithAll"
                  :key="category.id"
                  @click="handleCategoryChange(category.id)"
                  :class="{
                    'bg-blue-500 text-white shadow-lg':
                      selectedCategory === category.id,
                    'bg-gray-100 text-gray-700 hover:bg-gray-200':
                      selectedCategory !== category.id,
                  }"
                  class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0"
                >
                  {{ category.name }}
                </button>
              </div>
            </div>

            <!-- Desktop: Wrap Grid -->
            <div class="hidden sm:flex sm:flex-wrap gap-2">
              <button
                v-for="category in categoriesWithAll"
                :key="category.id"
                @click="handleCategoryChange(category.id)"
                :class="{
                  'bg-blue-500 text-white shadow-lg transform scale-105':
                    selectedCategory === category.id,
                  'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md':
                    selectedCategory !== category.id,
                }"
                class="px-4 py-2 rounded-full font-medium transition-all duration-200"
              >
                {{ category.name }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Advanced Filters -->
      <div
        class="mb-6 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <!-- Mobile Filter Header -->
        <div class="lg:hidden">
          <button
            @click="showFilters = !showFilters"
            class="w-full flex items-center justify-between px-4 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center"
              >
                <svg
                  class="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                  />
                </svg>
              </div>
              <div class="text-left">
                <p class="font-semibold text-gray-800">Bộ lọc & Sắp xếp</p>
                <p class="text-sm text-gray-500">
                  {{ filteredProductsCount }} sản phẩm
                </p>
              </div>
            </div>
            <svg
              :class="{ 'rotate-180': showFilters }"
              class="w-5 h-5 text-gray-600 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        <!-- Filter Content -->
        <div :class="{ hidden: !showFilters }" class="lg:block filter-content">
          <!-- Desktop Header -->
          <div
            class="hidden lg:block px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center"
                >
                  <svg
                    class="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                    />
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-800">
                  Bộ lọc & Sắp xếp
                </h3>
              </div>
              <div class="text-sm text-gray-600">
                <span class="font-medium text-blue-600">{{
                  filteredProductsCount
                }}</span>
                sản phẩm
              </div>
            </div>
          </div>

          <!-- Filter Controls -->
          <div class="p-4 lg:p-6">
            <!-- Mobile Layout -->
            <div class="lg:hidden space-y-4">
              <!-- Sort Section -->
              <div class="bg-gray-50 rounded-lg p-4">
                <label class="block text-sm font-semibold text-gray-700 mb-3">
                  🔄 Sắp xếp theo
                </label>
                <select
                  v-model="sortBy"
                  @change="handleSortChange"
                  class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
                >
                  <option value="newest">⭐ Mới nhất</option>
                  <option value="oldest">� Cũ nhất</option>
                  <option value="price-asc">� Giá tăng dần</option>
                  <option value="price-desc">� Giá giảm dần</option>
                  <option value="name-asc">🔤 Tên A-Z</option>
                  <option value="name-desc">🔡 Tên Z-A</option>
                </select>
              </div>

              <!-- Price Filter Section -->
              <div class="bg-gray-50 rounded-lg p-4">
                <label class="block text-sm font-semibold text-gray-700 mb-3">
                  <i class="fas fa-dollar-sign text-green-600 mr-2"></i>Khoảng giá
                </label>
                <select
                  v-model="priceRange"
                  @change="handlePriceFilterChange"
                  class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
                >
                  <option value="">🏷️ Tất cả mức giá</option>
                  <option value="under-100">💵 Dưới 100K</option>
                  <option value="100-200">💴 100K - 200K</option>
                  <option value="200-400">💶 200K - 400K</option>
                  <option value="400-1000">💷 400K - 1M</option>
                  <option value="over-1000"><i class="fas fa-gem mr-1"></i>Trên 1M</option>
                </select>
              </div>

              <!-- Clear Button -->
              <button
                @click="clearFilters"
                class="w-full px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-lg transition-colors border border-red-200 font-medium"
              >
                🗑️ Xóa tất cả bộ lọc
              </button>
            </div>

            <!-- Desktop Layout -->
            <div class="hidden lg:flex lg:items-center lg:gap-6">
              <!-- Sort By -->
              <div class="flex items-center gap-3">
                <label
                  class="text-sm font-semibold text-gray-700 whitespace-nowrap flex items-center gap-2"
                >
                  <span class="text-base">🔄</span>
                  Sắp xếp:
                </label>
                <select
                  v-model="sortBy"
                  @change="handleSortChange"
                  class="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[140px]"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                  <option value="name-asc">Tên A-Z</option>
                  <option value="name-desc">Tên Z-A</option>
                </select>
              </div>

              <!-- Price Range Filter -->
              <div class="flex items-center gap-3">
                <label
                  class="text-sm font-semibold text-gray-700 whitespace-nowrap flex items-center gap-2"
                >
                  <i class="fas fa-dollar-sign text-base text-green-600"></i>
                  Giá:
                </label>
                <select
                  v-model="priceRange"
                  @change="handlePriceFilterChange"
                  class="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[140px]"
                >
                  <option value="">Tất cả</option>
                  <option value="under-100">Dưới 100K</option>
                  <option value="100-200">100K - 200K</option>
                  <option value="200-400">200K - 400K</option>
                  <option value="400-1000">400K - 1M</option>
                  <option value="over-1000">Trên 1M</option>
                </select>
              </div>

              <!-- Clear Filters -->
              <button
                @click="clearFilters"
                class="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200 font-medium"
              >
                🗑️ Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <div class="flex flex-col items-center">
            <div class="relative">
              <div
                class="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"
              ></div>
              <div
                class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent absolute top-0 left-0"
              ></div>
            </div>
            <p class="mt-4 text-gray-600 font-medium">Đang tải sản phẩm...</p>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex justify-center py-12">
        <div
          class="bg-white rounded-xl shadow-lg border border-red-200 p-8 max-w-md w-full mx-4"
        >
          <div class="text-center">
            <div
              class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">
              Có lỗi xảy ra
            </h3>
            <p class="text-red-600 mb-6">{{ error }}</p>
            <button
              @click="handleRetry"
              class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              🔄 Thử lại
            </button>
          </div>
        </div>
      </div>

      <!-- Products Grid -->
      <div v-if="!loading && !error && products.length > 0">
        <div
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4 lg:gap-6"
        >
          <ProductCard
            v-for="product in getFilteredAndSortedProducts()"
            :key="product._id || product.id"
            :product="product"
          />
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center mt-8">
          <div class="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <div class="flex items-center space-x-1 sm:space-x-2">
              <!-- Previous Button -->
              <button
                @click="handlePageChange(currentPage - 1)"
                :disabled="!hasPrevPage"
                class="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200 text-sm sm:text-base font-medium"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span class="hidden sm:inline">Trước</span>
              </button>

              <!-- Page Numbers -->
              <div class="flex items-center space-x-1">
                <template v-for="page in visiblePages" :key="page">
                  <button
                    v-if="typeof page === 'number'"
                    @click="handlePageChange(page)"
                    :class="{
                      'bg-blue-500 text-white shadow-lg': page === currentPage,
                      'bg-gray-100 text-gray-700 hover:bg-gray-200':
                        page !== currentPage,
                    }"
                    class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-all duration-200 text-sm sm:text-base font-medium flex items-center justify-center"
                  >
                    {{ page }}
                  </button>
                  <span v-else class="px-2 py-2 text-gray-400 text-sm">
                    {{ page }}
                  </span>
                </template>
              </div>

              <!-- Next Button -->
              <button
                @click="handlePageChange(currentPage + 1)"
                :disabled="!hasNextPage"
                class="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200 text-sm sm:text-base font-medium"
              >
                <span class="hidden sm:inline">Sau</span>
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading && !error" class="flex justify-center py-12">
        <div
          class="bg-white rounded-xl shadow-lg border border-gray-100 p-8 max-w-md w-full mx-4"
        >
          <div class="text-center">
            <div
              class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-2">
              Chưa có sản phẩm
            </h3>
            <p class="text-gray-500 mb-6">
              Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại
            </p>
            <button
              @click="handleRetry"
              class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              🔄 Tải lại
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  </ClientLayout>
</template>

<style scoped>
.container {
  width: 100%;
  max-width: 1200px;
}
/* Scrollbar hide for mobile category scroll */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Smooth transitions */
* {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Focus states */
select:focus {
  transform: scale(1.02);
}

button:focus {
  transform: scale(1.02);
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .container {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
}

/* Medium screen optimizations */
@media (min-width: 768px) and (max-width: 1024px) {
  .container {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

/* Animation for filter toggle */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filter-content {
  animation: slideDown 0.3s ease-out;
}
</style>
