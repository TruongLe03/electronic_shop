<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";
import { useAdminProducts } from "@/composables/admin/useAdminProducts.js";
import AdminLayout from "@/components/admin/AdminLayout.vue";
import ModernStatsCard from "@/components/admin/ModernStatsCard.vue";

const router = useRouter();
const authStore = useAuthStore();

// Composables
const {
  products,
  categories,
  totalProducts,
  loading,
  error,
  pagination,
  filters,
  fetchProducts,
  fetchCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  goToPage,
  nextPage,
  prevPage,
  applyFilters,
  clearFilters,
  search,
  sortBy,
  getStatusColor,
  getStatusText,
  formatCurrency,
  formatNumber,
  formatDate,
  truncateText,
} = useAdminProducts();

// Modal states
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const productToDelete = ref(null);

// Form data
const productForm = ref({
  name: "",
  description: "",
  category: "",
  price: 0,
  salePrice: 0,
  stock: 0,
  imageUrl: "",
  status: "draft",
});

// Search
const searchTerm = ref("");
let searchTimeout = null;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    search(searchTerm.value);
  }, 500);
};

// Computed
const activeProductsCount = computed(() => {
  return products.value.filter((p) => p.status === "active").length;
});

const outOfStockCount = computed(() => {
  return products.value.filter((p) => (p.stock || 0) === 0).length;
});

const draftProductsCount = computed(() => {
  return products.value.filter((p) => p.status === "draft").length;
});

const visiblePages = computed(() => {
  const pages = [];
  const total = pagination.totalPages;
  const current = pagination.page;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("...");
      pages.push(total);
    } else if (current >= total - 3) {
      pages.push(1);
      pages.push("...");
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      for (let i = current - 1; i <= current + 1; i++) pages.push(i);
      pages.push("...");
      pages.push(total);
    }
  }

  return pages;
});

// Methods
const resetForm = () => {
  productForm.value = {
    name: "",
    description: "",
    category: "",
    price: 0,
    salePrice: 0,
    stock: 0,
    imageUrl: "",
    status: "draft",
  };
};

const closeModal = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  resetForm();
};

const editProduct = (product) => {
  productForm.value = {
    id: product._id,
    name: product.name,
    description: product.description || "",
    category: product.category?._id || "",
    price: product.price,
    salePrice: product.salePrice || 0,
    stock: product.stock || 0,
    imageUrl: product.imageUrl || "",
    status: product.status,
  };
  showEditModal.value = true;
};

const submitProduct = async () => {
  try {
    if (showCreateModal.value) {
      await createProduct(productForm.value);
    } else {
      await updateProduct(productForm.value.id, productForm.value);
    }
    closeModal();
  } catch (err) {
    console.error("Submit product error:", err);
  }
};

const confirmDelete = (product) => {
  productToDelete.value = product;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  try {
    await deleteProduct(productToDelete.value._id);
    showDeleteModal.value = false;
    productToDelete.value = null;
  } catch (err) {
    console.error("Delete product error:", err);
  }
};

// Check auth
if (!authStore.user || authStore.user.role !== "admin") {
  router.push("/login");
}

// Initialize
onMounted(async () => {
  await Promise.all([fetchProducts(), fetchCategories()]);
});
</script>

<template>
  <AdminLayout>
    <div class="p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <p class="text-gray-600">
            Quản lý danh sách sản phẩm và thông tin chi tiết
          </p>
        </div>
        <button
          @click="showCreateModal = true"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Thêm sản phẩm</span>
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <ModernStatsCard
          title="Tổng sản phẩm"
          :value="totalProducts"
          :format="'number'"
          icon="📦"
          color="blue"
        />
        <ModernStatsCard
          title="Hoạt động"
          :value="activeProductsCount"
          :format="'number'"
          icon="✅"
          color="green"
        />
        <ModernStatsCard
          title="Hết hàng"
          :value="outOfStockCount"
          :format="'number'"
          icon="⚠️"
          color="red"
        />
        <ModernStatsCard
          title="Hết hàng"
          :value="stats.outOfStock"
          icon="fas fa-times-circle"
          gradient="from-red-500 to-pink-500"
          :loading="loading"
        />

        <ModernStatsCard
          title="Sắp hết"
          :value="stats.lowStock"
          icon="fas fa-exclamation-triangle"
          gradient="from-yellow-500 to-orange-500"
          :loading="loading"
        />
      </div>

      <!-- Products Table -->
      <div
        class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50"
      >
        <!-- Header -->
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div
            class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
          >
            <div class="flex items-center space-x-3">
              <div
                class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl"
              >
                📦
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-800 dark:text-white">
                  Quản lý sản phẩm
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Danh sách tất cả sản phẩm
                </p>
              </div>
            </div>

            <div
              class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4"
            >
              <!-- Add Product Button -->
              <button
                @click="addProduct"
                class="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <i class="fas fa-plus mr-2"></i>
                Thêm sản phẩm
              </button>

              <!-- Search -->
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  class="w-full sm:w-64 pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
                <svg
                  class="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
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

              <!-- Category Filter -->
              <select
                v-model="selectedCategory"
                class="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Table Content -->
        <div class="overflow-x-auto">
          <!-- Loading State -->
          <div v-if="loading" class="p-8">
            <div class="animate-pulse space-y-4">
              <div v-for="i in 5" :key="i" class="flex items-center space-x-4">
                <div
                  class="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"
                ></div>
                <div class="flex-1 space-y-2">
                  <div
                    class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"
                  ></div>
                  <div
                    class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"
                  ></div>
                </div>
                <div
                  class="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded"
                ></div>
                <div
                  class="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"
                ></div>
              </div>
            </div>
          </div>

          <!-- Products Table -->
          <table v-else class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th
                  class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Sản phẩm
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Danh mục
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Giá
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Tồn kho
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Trạng thái
                </th>
                <th
                  class="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="product in products"
                :key="product.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center space-x-4">
                    <img
                      class="w-16 h-16 rounded-lg object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                      :src="product.image"
                      :alt="product.name"
                    />
                    <div>
                      <div
                        class="text-sm font-semibold text-gray-900 dark:text-white"
                      >
                        {{ product.name }}
                      </div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">
                        SKU: {{ product.sku }}
                      </div>
                    </div>
                  </div>
                </td>

                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-600 dark:text-gray-300">
                    {{
                      categories.find((c) => c.id === product.category)?.name ||
                      product.category
                    }}
                  </span>
                </td>

                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="text-sm font-semibold text-gray-900 dark:text-white"
                  >
                    {{ formatCurrency(product.price) }}
                  </span>
                </td>

                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    {{ product.stock }}
                  </span>
                </td>

                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      product.status
                    )}`"
                  >
                    {{ getStatusText(product.status) }}
                  </span>
                </td>

                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      @click="viewProduct(product)"
                      class="p-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors"
                      title="Xem chi tiết"
                    >
                      <i class="fas fa-eye w-4 h-4"></i>
                    </button>

                    <button
                      @click="editProduct(product)"
                      class="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <i class="fas fa-edit w-4 h-4"></i>
                    </button>

                    <button
                      @click="duplicateProduct(product)"
                      class="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg transition-colors"
                      title="Sao chép"
                    >
                      <i class="fas fa-copy w-4 h-4"></i>
                    </button>

                    <button
                      @click="deleteProduct(product)"
                      class="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <i class="fas fa-trash w-4 h-4"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Hiển thị
              <span class="font-semibold">1-{{ products.length }}</span> của
              <span class="font-semibold">{{ products.length }}</span> sản phẩm
            </div>

            <div class="flex items-center space-x-2">
              <button
                class="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              >
                Trước
              </button>
              <button
                class="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg"
              >
                1
              </button>
              <button
                class="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Modal -->
    <div
      v-if="showProductModal"
      class="fixed inset-0 bg-white bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      @click="closeModal"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto border border-gray-200"
        @click.stop
      >
        <!-- Modal Header -->
        <div
          class="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl"
        >
          <div class="flex items-center space-x-3">
            <div
              class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white"
            >
              <i
                :class="isEditMode ? 'fas fa-edit' : 'fas fa-plus'"
                class="w-5 h-5"
              ></i>
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-800">
                {{ isEditMode ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới" }}
              </h3>
              <p class="text-sm text-gray-500">
                {{
                  isEditMode
                    ? "Cập nhật thông tin sản phẩm"
                    : "Tạo sản phẩm mới cho cửa hàng"
                }}
              </p>
            </div>
          </div>
          <button
            @click="closeModal"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <i class="fas fa-times w-5 h-5"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Product Name -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Tên sản phẩm *
              </label>
              <input
                v-model="productForm.name"
                type="text"
                placeholder="Nhập tên sản phẩm"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-colors"
                required
              />
            </div>

            <!-- Category -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Danh mục *
              </label>
              <select
                v-model="productForm.category"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-colors"
                required
              >
                <option value="">Chọn danh mục</option>
                <option value="smartphone">Điện thoại</option>
                <option value="laptop">Laptop</option>
                <option value="tablet">Tablet</option>
                <option value="accessories">Phụ kiện</option>
              </select>
            </div>

            <!-- SKU -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Mã sản phẩm (SKU) *
              </label>
              <input
                v-model="productForm.sku"
                type="text"
                placeholder="Nhập mã SKU"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-colors"
                required
              />
            </div>

            <!-- Price -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Giá bán (VNĐ) *
              </label>
              <input
                v-model.number="productForm.price"
                type="number"
                min="0"
                placeholder="0"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-colors"
                required
              />
            </div>

            <!-- Stock -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Số lượng tồn kho *
              </label>
              <input
                v-model.number="productForm.stock"
                type="number"
                min="0"
                placeholder="0"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-colors"
                required
              />
            </div>

            <!-- Status -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                v-model="productForm.status"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-colors"
              >
                <option value="active">Còn hàng</option>
                <option value="inactive">Ngừng bán</option>
                <option value="out_of_stock">Hết hàng</option>
                <option value="low_stock">Sắp hết</option>
              </select>
            </div>

            <!-- Image URL -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                URL hình ảnh
              </label>
              <input
                v-model="productForm.image"
                type="url"
                placeholder="https://example.com/image.jpg"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-colors"
              />
            </div>

            <!-- Description -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Mô tả sản phẩm
              </label>
              <textarea
                v-model="productForm.description"
                rows="4"
                placeholder="Nhập mô tả chi tiết về sản phẩm..."
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-colors resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div
          class="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl"
        >
          <button
            @click="closeModal"
            class="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors font-medium"
          >
            Hủy bỏ
          </button>
          <button
            @click="saveProduct"
            :disabled="loading"
            class="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <i
              :class="
                loading
                  ? 'fas fa-spinner fa-spin'
                  : isEditMode
                  ? 'fas fa-save'
                  : 'fas fa-plus'
              "
              class="w-4 h-4"
            ></i>
            <span>{{ isEditMode ? "Cập nhật" : "Thêm mới" }}</span>
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
