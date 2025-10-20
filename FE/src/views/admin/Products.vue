<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";
import { useAdminProducts } from "@/composables/admin/useAdminProducts.js";
import AdminLayout from "@/layout/AdminLayout.vue";
import ModernStatsCard from "@/components/admin/ModernStatsCard.vue";

console.log("Products.vue - Starting to load...");

const router = useRouter();
const authStore = useAuthStore();

// Placeholder image
const placeholderImage = "https://via.placeholder.com/150";

// Try to use composable (with fallback safe defaults)
let comp;
try {
  comp = useAdminProducts();
} catch (err) {
  console.error("Error loading useAdminProducts:", err);
  comp = {
    products: ref([]),
    categories: ref([]),
    totalProducts: ref(0),
    loading: ref(false),
    error: ref("Failed to load admin products composable"),
    pagination: ref({ page: 1, limit: 10, totalPages: 1, total: 0 }),
    filters: ref({}),
    fetchProducts: async () => {},
    fetchCategories: async () => {},
    createProduct: async () => {},
    updateProduct: async () => {},
    deleteProduct: async () => {},
    toggleProductStatus: async () => {},
    goToPage: async () => {},
    nextPage: async () => {},
    prevPage: async () => {},
    applyFilters: () => {},
    clearFilters: () => {},
    search: () => {},
    sortBy: () => {},
    getStatusColor: () => "bg-gray-200 text-gray-800",
    getStatusText: () => "Unknown",
    formatCurrency: (v) =>
      typeof v === "number" ? v.toLocaleString("vi-VN") + "₫" : v,
  };
}

// Destructure from composable (works whether comp returns refs or plain values)
const products = comp.products ?? ref([]);
const categories = comp.categories ?? ref([]);
const totalProducts = comp.totalProducts ?? ref(0);
const loading = comp.loading ?? ref(false);
const error = comp.error ?? ref(null);
const pagination =
  comp.pagination ?? ref({ page: 1, limit: 10, totalPages: 1, total: 0 });
const filters = comp.filters ?? ref({});

const fetchProducts = comp.fetchProducts ?? (async () => {});
const fetchCategories = comp.fetchCategories ?? (async () => {});
const createProduct = comp.createProduct ?? (async () => {});
const updateProduct = comp.updateProduct ?? (async () => {});
const deleteProductApi = comp.deleteProduct ?? (async () => {});
const goToPage =
  comp.goToPage ??
  ((page) => {
    pagination.page = page;
  });
const nextPageApi =
  comp.nextPage ??
  (async () => {
    if (pagination.page < pagination.totalPages) pagination.page++;
  });
const prevPageApi =
  comp.prevPage ??
  (async () => {
    if (pagination.page > 1) pagination.page--;
  });
const searchApi = comp.search ?? ((q) => {});
const applyFiltersApi = comp.applyFilters ?? (() => {});
const getStatusColor =
  comp.getStatusColor ?? ((s) => "bg-gray-200 text-gray-800");
const getStatusText = comp.getStatusText ?? ((s) => s || "—");
const getStockStatusColor = 
  comp.getStockStatusColor ?? ((s) => "bg-gray-200 text-gray-800");
const getStockStatusText = 
  comp.getStockStatusText ?? ((s) => "Không xác định");
const formatCurrency =
  comp.formatCurrency ??
  ((v) => (typeof v === "number" ? v.toLocaleString("vi-VN") + "₫" : v));

// Local UI state
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showProductModal = ref(false);
const showDeleteModal = ref(false);
const productToDelete = ref(null);

const isEditMode = ref(false);
const productForm = ref({
  _id: null,
  name: "",
  description: "",
  category_id: "",
  price: 0,
  sku: "",
  stock: 0,
  imageUrl: "",
  status: "active",
});

const searchQuery = ref("");
let searchTimeout = null;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    if (typeof searchApi === "function") searchApi(searchQuery.value);
    else fetchProducts();
  }, 500);
};

const selectedCategory = ref("");

// computed stats from local products array
const activeProductsCount = computed(() =>
  Array.isArray(products.value)
    ? products.value.filter((p) => p.status === "active").length
    : 0
);
const outOfStockCount = computed(() =>
  Array.isArray(products.value)
    ? products.value.filter((p) => (p.stock ?? p.stock_quantity ?? 0) === 0).length
    : 0
);
const lowStockCount = computed(() =>
  Array.isArray(products.value)
    ? products.value.filter((p) => {
        const stock = p.stock ?? p.stock_quantity ?? 0;
        return stock > 0 && stock <= 10;
      }).length
    : 0
);
const draftProductsCount = computed(() =>
  Array.isArray(products.value)
    ? products.value.filter((p) => p.status === "draft").length
    : 0
);

// pagination helpers
const showFrom = computed(() => {
  const page = pagination.page ?? 1;
  const limit = pagination.limit ?? (products.value.length || 10);
  return (page - 1) * limit + (products.value.length ? 1 : 0);
});
const showTo = computed(() => {
  const page = pagination.page ?? 1;
  const limit = pagination.limit ?? (products.value.length || 10);
  const total =
    totalProducts?.value ?? pagination.total ?? products.value.length;
  return Math.min(page * limit, total || products.value.length);
});

// visible pages (array with numbers and '...')
const visiblePages = computed(() => {
  const pages = [];
  const total = pagination.totalPages ?? 1;
  const current = pagination.page ?? 1;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
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

// helpers
const pKey = (p) =>
  p === "..." ? `dot-${Math.random().toString(36).substr(2, 6)}` : `p-${p}`;
const currentPageClass = (p) => {
  if (p === "...") return "px-3 py-1 text-sm text-gray-400";
  return p === pagination.page
    ? "px-3 py-1 text-sm bg-blue-500 text-white rounded-lg"
    : "px-3 py-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors";
};

const goTo = (p) => {
  if (p === "...") return;
  if (typeof goToPage === "function") goToPage(p);
  else pagination.page = p;
  fetchProducts();
};

const nextPage = async () => {
  if (typeof nextPageApi === "function") await nextPageApi();
  else if (pagination.page < pagination.totalPages) pagination.page++;
  fetchProducts();
};

const prevPage = async () => {
  if (typeof prevPageApi === "function") await prevPageApi();
  else if (pagination.page > 1) pagination.page--;
  fetchProducts();
};

const addProduct = () => {
  resetForm();
  isEditMode.value = false;
  showProductModal.value = true;
};

const resetForm = () => {
  productForm.value = {
    _id: null,
    name: "",
    description: "",
    category_id: "",
    price: 0,
    sku: "",
    stock: 0,
    imageUrl: "",
    status: "active",
  };
};

const closeModal = () => {
  showProductModal.value = false;
  resetForm();
};

const onEditProduct = (product) => {
  productForm.value = {
    _id: product._id ?? product.id,
    name: product.name ?? "",
    description: product.description ?? "",
    category_id: product.category_id ?? product.category ?? "",
    price: product.price ?? 0,
    sku: product.sku ?? "",
    stock: product.stock ?? 0,
    imageUrl: product.imageUrl ?? product.image ?? "",
    status: product.status ?? "active",
  };
  isEditMode.value = true;
  showProductModal.value = true;
};

// view product placeholder — replace with route if needed
const viewProduct = (product) => {
  // example: router.push({ name: 'ProductDetail', params: { id: product._id || product.id } });
  console.log("View product", product);
};

const onDuplicateProduct = (product) => {
  const copy = { ...product };
  delete copy._id;
  copy.name = (copy.name || "") + " (bản sao)";
  productForm.value = {
    _id: null,
    name: copy.name,
    description: copy.description ?? "",
    category_id: copy.category_id ?? copy.category ?? "",
    price: copy.price ?? 0,
    sku: copy.sku ? copy.sku + "-COPY" : "",
    stock: copy.stock ?? 0,
    imageUrl: copy.imageUrl ?? copy.image ?? "",
    status: copy.status ?? "active",
  };
  isEditMode.value = false;
  showProductModal.value = true;
};

const saveProduct = async () => {
  try {
    if (isEditMode.value && productForm.value._id) {
      if (typeof updateProduct === "function")
        await updateProduct(productForm.value._id, productForm.value);
    } else {
      if (typeof createProduct === "function")
        await createProduct(productForm.value);
    }
    closeModal();
    await fetchProducts();
  } catch (err) {
    console.error("Submit product error:", err);
    // Không cần thêm thông báo lỗi ở đây vì composable đã xử lý
  }
};

const confirmDelete = (product) => {
  productToDelete.value = product;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  productToDelete.value = null;
};

const handleDelete = async () => {
  try {
    if (!productToDelete.value) return;
    const id = productToDelete.value._id ?? productToDelete.value.id;
    if (typeof deleteProduct === "function") await deleteProduct(id);
    closeDeleteModal();
    await fetchProducts();
  } catch (err) {
    console.error("Delete product error:", err);
    // Không cần thêm thông báo lỗi ở đây vì composable đã xử lý
  }
};

const applyCategoryFilter = async () => {
  console.log("🔍 applyCategoryFilter called with:", selectedCategory.value);

  try {
    // Update filters directly
    if (filters && typeof filters === "object") {
      if (selectedCategory.value) {
        filters.category = selectedCategory.value;
      } else {
        filters.category = "";
      }
      console.log("✅ Filters updated:", filters);
    } else {
      console.error("❌ Filters object not available:", filters);
    }

    // Reset to page 1
    if (pagination && pagination.page) {
      pagination.page = 1;
    }

    // Call fetchProducts with updated filters
    console.log("📞 Calling fetchProducts...");
    await fetchProducts();
    console.log("✅ fetchProducts completed");
  } catch (error) {
    console.error("❌ applyCategoryFilter error:", error);
  }
};

const categoryName = (cat) => {
  // cat could be id or object
  if (!cat) return "—";
  
  // If cat is a populated object with name, return it directly
  if (typeof cat === "object" && cat.name) {
    return cat.name;
  }
  
  // if categories list contains object with _id matching
  const found = (categories.value || []).find(
    (c) => c._id === (cat._id ?? cat) || c.id === cat
  );
  return found ? found.name : typeof cat === "string" ? cat : cat.name ?? "—";
};

// Check auth: redirect non-admin
if (!authStore.user || authStore.user.role !== "admin") {
  router.push("/login");
}

// initial fetch
onMounted(async () => {
  console.log("Products.vue onMounted - starting...");
  await Promise.all([fetchCategories(), fetchProducts()]);
  console.log("Categories after fetch:", categories.value);
  console.log("Products after fetch:", products.value?.length);
});

// watch pagination.page to refetch products (if composable expects that)
watch(
  () => pagination.page,
  async () => {
    await fetchProducts();
  }
);

// watch selectedCategory for debugging
watch(
  () => selectedCategory.value,
  (newValue) => {
    console.log("selectedCategory changed to:", newValue);
  }
);
</script>
<template>
  <AdminLayout>
    <!-- Error debug -->
    <div
      v-if="error && error.includes('Failed to load')"
      class="p-6 bg-red-50 border border-red-200 rounded-lg m-6"
    >
      <h2 class="text-lg font-semibold text-red-800">Component Error</h2>
      <p class="text-red-600">{{ error }}</p>
      <p class="text-sm text-red-500 mt-2">Check console for details</p>
    </div>

    <div class="p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <p class="text-gray-600">
            Quản lý danh sách sản phẩm và thông tin chi tiết
          </p>
        </div>
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
          title="Sắp hết"
          :value="lowStockCount"
          :format="'number'"
          icon="📉"
          color="yellow"
        />
        <ModernStatsCard
          title="Bản nháp"
          :value="draftProductsCount"
          :format="'number'"
          icon="📝"
          color="gray"
          :loading="loading"
        />
      </div>

      <!-- Products Table -->
      <div
        class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50"
      >
        <!-- Header controls -->
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
                  @input="debouncedSearch"
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  class="w-full sm:w-64 pl-10 pr-4 py-2 text-amber-50 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
                <i
                  class="fas fa-search absolute left-3 top-2.5 h-5 w-5 text-amber-50"
                ></i>
              </div>

              <!-- Category Filter -->
              <select
                v-model="selectedCategory"
                @change="applyCategoryFilter"
                class="px-4 py-2 text-amber-50 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">Tất cả danh mục</option>
                <option
                  v-for="cat in categories"
                  :key="cat._id || cat.id"
                  :value="cat._id || cat.id"
                >
                  {{ cat.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <!-- Loading skeleton -->
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

          <!-- Products table -->
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
                  Tình trạng
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
                :key="product._id || product.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center space-x-4">
                    <img
                      class="w-16 h-16 rounded-lg object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                      :src="product.images[0]"
                      :alt="product.name"
                    />
                    <div>
                      <div
                        class="text-sm font-semibold text-gray-900 dark:text-white"
                      >
                        {{ product.name }}
                      </div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">
                        SKU: {{ product.sku || "—" }}
                      </div>
                    </div>
                  </div>
                </td>

                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-600 dark:text-gray-300">
                    {{ categoryName(product.category_id || product.category) }}
                  </span>
                </td>

                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="text-sm font-semibold text-gray-900 dark:text-white"
                    >{{ formatCurrency(product.price) }}</span
                  >
                </td>

                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="text-sm font-semibold text-gray-700 dark:text-gray-300"
                    >{{ product.stock ?? 0 }}</span
                  >
                </td>

                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStockStatusColor(
                      product.stock || product.stock_quantity || 0
                    )}`"
                    >{{ getStockStatusText(product.stock || product.stock_quantity || 0) }}</span
                  >
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
                      @click="onEditProduct(product)"
                      class="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <i class="fas fa-edit w-4 h-4"></i>
                    </button>

                    <button
                      @click="onDuplicateProduct(product)"
                      class="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg transition-colors"
                      title="Sao chép"
                    >
                      <i class="fas fa-copy w-4 h-4"></i>
                    </button>

                    <button
                      @click="confirmDelete(product)"
                      class="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <i class="fas fa-trash w-4 h-4"></i>
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="!products.length && !loading">
                <td colspan="6" class="text-center py-8 text-gray-500">
                  Không có sản phẩm nào.
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
              <span class="font-semibold">{{ showFrom }}-{{ showTo }}</span> của
              <span class="font-semibold">{{ totalProducts }}</span> sản phẩm
            </div>

            <div class="flex items-center space-x-2">
              <button
                @click="prevPage"
                :disabled="pagination.page <= 1"
                class="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              >
                Trước
              </button>

              <button
                v-for="p in visiblePages"
                :key="pKey(p)"
                @click="goTo(p)"
                :class="['px-3 py-1 text-sm rounded-lg', currentPageClass(p)]"
                :disabled="p === '...'"
              >
                {{ p }}
              </button>

              <button
                @click="nextPage"
                :disabled="pagination.page >= pagination.totalPages"
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
      class="fixed inset-0 bg-white bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
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
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Tên sản phẩm *</label
              >
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
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Danh mục *</label
              >
              <select
                v-model="productForm.category_id"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-colors"
                required
              >
                <option value="">Chọn danh mục</option>
                <option
                  v-for="cat in categories"
                  :key="cat._id || cat.id"
                  :value="cat._id || cat.id"
                >
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <!-- SKU -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Mã sản phẩm (SKU) *</label
              >
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
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Giá bán (VNĐ) *</label
              >
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
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Số lượng tồn kho *</label
              >
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
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Trạng thái</label
              >
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
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >URL hình ảnh</label
              >
              <input
                v-model="productForm.imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-colors"
              />
            </div>

            <!-- Description -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Mô tả sản phẩm</label
              >
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

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]"
      @click="closeDeleteModal"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md" @click.stop>
        <h3 class="text-lg font-semibold mb-4">Xác nhận xóa</h3>
        <p class="text-sm text-gray-600 mb-6">
          Bạn có chắc muốn xóa sản phẩm
          <span class="font-medium">{{ productToDelete?.name }}</span> không?
          Hành động này không thể hoàn tác.
        </p>
        <div class="flex justify-end space-x-3">
          <button @click="closeDeleteModal" class="px-4 py-2 rounded-md border">
            Hủy
          </button>
          <button
            @click="handleDelete"
            :disabled="loading"
            class="px-4 py-2 bg-red-600 text-white rounded-md"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
/* Nếu muốn, thêm style tùy chỉnh ở đây */
</style>
