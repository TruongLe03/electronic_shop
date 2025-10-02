<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";
import AdminLayout from "@/components/admin/AdminLayout.vue";
import ModernStatsCard from "@/components/admin/ModernStatsCard.vue";

const router = useRouter();
const authStore = useAuthStore();

const products = ref([]);
const loading = ref(true);
const searchQuery = ref("");
const selectedCategory = ref("all");
const sortBy = ref("name");

// Modal state
const showProductModal = ref(false);
const isEditMode = ref(false);
const currentProduct = ref(null);

// Form data
const productForm = ref({
  name: "",
  category: "",
  price: 0,
  stock: 0,
  status: "active",
  image: "",
  sku: "",
  description: "",
});

const stats = ref({
  totalProducts: 0,
  activeProducts: 0,
  outOfStock: 0,
  lowStock: 0,
});

const categories = ref([
  { id: "all", name: "Tất cả" },
  { id: "smartphone", name: "Điện thoại" },
  { id: "laptop", name: "Laptop" },
  { id: "tablet", name: "Tablet" },
  { id: "accessories", name: "Phụ kiện" },
]);

onMounted(async () => {
  if (!authStore.isAuthenticated || authStore.user?.role !== "admin") {
    router.push("/login");
    return;
  }

  await loadProducts();
});

const loadProducts = async () => {
  try {
    loading.value = true;

    // Mock data - replace with real API calls
    await new Promise((resolve) => setTimeout(resolve, 1000));

    products.value = [
      {
        id: 1,
        name: "iPhone 15 Pro Max",
        category: "smartphone",
        price: 32990000,
        stock: 15,
        status: "active",
        image: "https://via.placeholder.com/100x100",
        sku: "IP15PM-256",
        createdAt: "2025-09-01",
      },
      {
        id: 2,
        name: "MacBook Pro M3",
        category: "laptop",
        price: 54990000,
        stock: 8,
        status: "active",
        image: "https://via.placeholder.com/100x100",
        sku: "MBP-M3-14",
        createdAt: "2025-09-02",
      },
      {
        id: 3,
        name: "iPad Air",
        category: "tablet",
        price: 16990000,
        stock: 0,
        status: "out_of_stock",
        image: "https://via.placeholder.com/100x100",
        sku: "IPAD-AIR-64",
        createdAt: "2025-09-03",
      },
      {
        id: 4,
        name: "AirPods Pro",
        category: "accessories",
        price: 6490000,
        stock: 3,
        status: "low_stock",
        image: "https://via.placeholder.com/100x100",
        sku: "AIRP-PRO-2",
        createdAt: "2025-09-04",
      },
      {
        id: 5,
        name: "Samsung Galaxy S24",
        category: "smartphone",
        price: 25990000,
        stock: 12,
        status: "active",
        image: "https://via.placeholder.com/100x100",
        sku: "SGS24-256",
        createdAt: "2025-09-05",
      },
    ];

    stats.value = {
      totalProducts: products.value.length,
      activeProducts: products.value.filter((p) => p.status === "active")
        .length,
      outOfStock: products.value.filter((p) => p.stock === 0).length,
      lowStock: products.value.filter((p) => p.stock > 0 && p.stock <= 5)
        .length,
    };
  } catch (error) {
    console.error("Error loading products:", error);
  } finally {
    loading.value = false;
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const getStatusColor = (status) => {
  const colors = {
    active:
      "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30",
    out_of_stock:
      "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30",
    low_stock:
      "text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30",
    inactive:
      "text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30",
  };
  return colors[status] || "text-gray-700 bg-gray-100";
};

const getStatusText = (status) => {
  const statusText = {
    active: "Còn hàng",
    out_of_stock: "Hết hàng",
    low_stock: "Sắp hết",
    inactive: "Ngừng bán",
  };
  return statusText[status] || status;
};

const addProduct = () => {
  isEditMode.value = false;
  currentProduct.value = null;
  productForm.value = {
    name: "",
    category: "",
    price: 0,
    stock: 0,
    status: "active",
    image: "",
    sku: "",
    description: "",
  };
  showProductModal.value = true;
};

const editProduct = (product) => {
  isEditMode.value = true;
  currentProduct.value = product;
  productForm.value = {
    name: product.name,
    category: product.category,
    price: product.price,
    stock: product.stock,
    status: product.status,
    image: product.image,
    sku: product.sku,
    description: product.description || "",
  };
  showProductModal.value = true;
};

const deleteProduct = async (product) => {
  if (
    confirm(
      `Bạn có chắc muốn xóa sản phẩm "${product.name}"?\nHành động này không thể hoàn tác!`
    )
  ) {
    try {
      loading.value = true;

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Remove from local array
      const index = products.value.findIndex((p) => p.id === product.id);
      if (index > -1) {
        products.value.splice(index, 1);
      }

      // Update stats
      stats.value = {
        totalProducts: products.value.length,
        activeProducts: products.value.filter((p) => p.status === "active")
          .length,
        outOfStock: products.value.filter((p) => p.stock === 0).length,
        lowStock: products.value.filter((p) => p.stock > 0 && p.stock <= 5)
          .length,
      };

      alert(`Đã xóa sản phẩm "${product.name}" thành công!`);
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Có lỗi xảy ra khi xóa sản phẩm!");
    } finally {
      loading.value = false;
    }
  }
};

const viewProduct = (product) => {
  console.log("View product details:", product);
  // Navigate to product detail page or open modal
};

const closeModal = () => {
  showProductModal.value = false;
  isEditMode.value = false;
  currentProduct.value = null;
};

const saveProduct = async () => {
  try {
    loading.value = true;

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (isEditMode.value) {
      // Update existing product
      const index = products.value.findIndex(
        (p) => p.id === currentProduct.value.id
      );
      if (index > -1) {
        products.value[index] = {
          ...currentProduct.value,
          ...productForm.value,
        };
      }
      alert(`Đã cập nhật sản phẩm "${productForm.value.name}" thành công!`);
    } else {
      // Add new product
      const newProduct = {
        id: Date.now(),
        ...productForm.value,
        createdAt: new Date().toISOString().split("T")[0],
      };
      products.value.push(newProduct);
      alert(`Đã thêm sản phẩm "${productForm.value.name}" thành công!`);
    }

    // Update stats
    stats.value = {
      totalProducts: products.value.length,
      activeProducts: products.value.filter((p) => p.status === "active")
        .length,
      outOfStock: products.value.filter((p) => p.stock === 0).length,
      lowStock: products.value.filter((p) => p.stock > 0 && p.stock <= 5)
        .length,
    };

    closeModal();
  } catch (error) {
    console.error("Error saving product:", error);
    alert("Có lỗi xảy ra khi lưu sản phẩm!");
  } finally {
    loading.value = false;
  }
};

const duplicateProduct = (product) => {
  if (confirm(`Bạn có muốn tạo bản sao của sản phẩm "${product.name}"?`)) {
    const newProduct = {
      ...product,
      id: Date.now(), // Generate new ID
      name: `${product.name} (Copy)`,
      sku: `${product.sku}-COPY`,
      createdAt: new Date().toISOString().split("T")[0],
    };

    products.value.unshift(newProduct);

    // Update stats
    stats.value = {
      totalProducts: products.value.length,
      activeProducts: products.value.filter((p) => p.status === "active")
        .length,
      outOfStock: products.value.filter((p) => p.stock === 0).length,
      lowStock: products.value.filter((p) => p.stock > 0 && p.stock <= 5)
        .length,
    };

    alert(`Đã tạo bản sao sản phẩm "${product.name}" thành công!`);
  }
};
</script>

<template>
  <AdminLayout>
    <div class="space-y-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModernStatsCard
          title="Tổng sản phẩm"
          :value="stats.totalProducts"
          icon="fas fa-box"
          gradient="from-blue-500 to-cyan-500"
          :loading="loading"
        />

        <ModernStatsCard
          title="Còn hàng"
          :value="stats.activeProducts"
          icon="fas fa-check-circle"
          gradient="from-green-500 to-emerald-500"
          :loading="loading"
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
