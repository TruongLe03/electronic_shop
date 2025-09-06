<script setup>
import { ref, onMounted } from "vue";
import Header from "../components/Header.vue";
import ProductCard from "../components/productCard.vue";
import Footer from "../components/Footer.vue";
import { getProducts, getProductsByCategory } from "../api/productService";
import { getCategories } from "../api/categoryService";
import { useCartStore } from "../stores/cart";

const products = ref([]);
const categories = ref([]);
const loading = ref(false);
const error = ref(null);
const currentPage = ref(1);
const itemsPerPage = 20;
const totalPages = ref(0);
const totalProducts = ref(0);
const selectedCategory = ref("all");
const cartStore = useCartStore();
const quantity = ref(1);

const handleAddToCart = async (product) => {
  try {
    const success = await cartStore.addToCart(product, quantity.value);
    if (success) {
      alert('Thêm vào giỏ hàng thành công!');
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    alert('Có lỗi xảy ra khi thêm vào giỏ hàng');
  }
};

// Load categories
const loadCategories = async () => {
  try {
    const result = await getCategories();
    console.log("Raw categories result:", result); // Debug log

    // Ensure we have an array of categories
    let categoriesData = Array.isArray(result) ? result : [];

    // Map MongoDB ObjectId format if needed
    categoriesData = categoriesData.map((cat) => ({
      id: cat._id?.$oid || cat.id || cat._id,
      name: cat.name,
      description: cat.description,
      image: cat.image,
    }));

    console.log("Processed categories:", categoriesData); // Debug log

    categories.value = [
      { id: "all", name: "Tất cả sản phẩm" },
      ...categoriesData,
    ];
  } catch (err) {
    console.error("Error loading categories:", err);
    categories.value = [{ id: "all", name: "Tất cả sản phẩm" }];
  }
};

const loadProducts = async (page = 1, category = "all") => {
  try {
    loading.value = true;
    error.value = null;

    let result;

    if (category === "all") {
      result = await getProducts(page, itemsPerPage);
    } else {
      result = await getProductsByCategory(category, page, itemsPerPage);
    }

    console.log("API Response(category):", result); // For debugging

    if (result && result.data) {
      products.value = result.data;
      totalProducts.value = result.total;
      totalPages.value = result.totalPages;
      currentPage.value = result.page;
    } else {
      throw new Error("Dữ liệu sản phẩm không hợp lệ");
    }
  } catch (err) {
    console.error("Error loading products:", err);
    error.value = err.message || "Không thể tải sản phẩm";
    products.value = [];
    totalProducts.value = 0;
    totalPages.value = 0;
  } finally {
    loading.value = false;
  }
};

const handleCategoryChange = async (categoryId) => {
  console.log("Selected category ID:", categoryId); // Debug log

  selectedCategory.value = categoryId;
  currentPage.value = 1; // Reset to first page when changing category

  try {
    await loadProducts(1, categoryId);
  } catch (err) {
    console.error("Error in handleCategoryChange:", err);
    error.value = "Không thể tải sản phẩm cho danh mục này";
  }
};

const handlePageChange = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page;
    loadProducts(page, selectedCategory.value);

    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const retryLoad = () => {
  loadProducts(currentPage.value, selectedCategory.value);
};

onMounted(async () => {
  await loadCategories();
  loadProducts(currentPage.value, selectedCategory.value);
});
</script>

<template>
  <Header />
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
    <!-- Category Filter -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-700 mb-3">
        Danh mục sản phẩm
      </h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="category in categories"
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
          @click="retryLoad"
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
            categories.find((c) => c.id === selectedCategory)?.name ||
            "Tất cả sản phẩm"
          }}
          ({{ totalProducts }} sản phẩm)
        </h2>
      </div>

      <div
        class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6"
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
            :disabled="currentPage <= 1"
            class="px-3 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            ← Trước
          </button>

          <!-- Show page numbers with smart truncation -->
          <template v-for="page in totalPages" :key="page">
            <button
              v-if="
                page <= 3 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 1 ||
                totalPages <= 10
              "
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
              v-else-if="
                (page === 4 && currentPage > 6) ||
                (page === totalPages - 1 && currentPage < totalPages - 3)
              "
              class="px-3 py-2 text-gray-500"
            >
              ...
            </span>
          </template>

          <button
            @click="handlePageChange(currentPage + 1)"
            :disabled="currentPage >= totalPages"
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
          @click="retryLoad"
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
