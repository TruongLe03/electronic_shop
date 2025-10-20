<script setup>
import { ref, onMounted, computed } from "vue";
import AdminLayout from "@/layout/AdminLayout.vue";
import { getAllProductsAdmin } from "@/api/admin/productService";
import { getCategoriesAdmin } from "@/api/admin/categoryService";
import {
  getDashboardStats,
  getGrowthAnalytics,
} from "@/api/admin/dashboardService";
import { getOrdersByDayStats } from "@/api/admin/orderService";

// 🟢 Dữ liệu kho
const inventory = ref([]);
const categories = ref([]);

// 🟢 Thống kê sản phẩm
const stats = ref({
  totalProducts: 0,
  inStock: 0,
  lowStock: 0,
  outOfStock: 0,
  totalInventoryValue: 0,
  avgProductPrice: 0,
  topCategory: "",
  totalOrders: 0,
  totalSold: 0,
  growthRate: 0,
});

const dashboardStats = ref(null);
const growthStats = ref(null);
const orderStats = ref(null);

// 🟢 Bộ lọc
const selectedCategory = ref("all");
const selectedStatus = ref("all");
const searchQuery = ref("");

// 🟢 Trạng thái tải
const loading = ref(false);
const error = ref(null);

// 🟢 Trạng thái UI
const viewMode = ref("table"); // 'table' hoặc 'grid'
const sortField = ref("name");
const sortDirection = ref("asc");

// 🟢 Pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);

// 🟢 Hàm format
function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("vi-VN");
}

function getStockStatus(quantity) {
  if (quantity === 0) return "Hết hàng";
  if (quantity <= 5) return "Sắp hết";
  return "Còn hàng";
}

// 🟢 Tải danh sách danh mục
async function loadCategories() {
  try {
    console.log("Loading categories...");
    // Lấy tất cả categories
    const response = await getCategoriesAdmin();
    console.log("Categories response:", response);

    if (response && response.data && Array.isArray(response.data)) {
      categories.value = response.data;
    } else if (response && Array.isArray(response)) {
      categories.value = response;
    } else {
      console.warn("Unexpected categories response format:", response);
      categories.value = [];
    }

    console.log("Categories loaded:", categories.value.length, "categories");
  } catch (error) {
    console.error("Error loading categories:", error);
    error.value = `Lỗi tải danh mục: ${error.message || "Unknown error"}`;

    // Fallback categories
    categories.value = [
      { _id: "cam-bien", name: "Cảm biến" },
      { _id: "nguon", name: "Nguồn" },
      { _id: "module", name: "Module" },
      { _id: "linh-kien", name: "Linh kiện" },
    ];
    console.log("Using fallback categories");
  }
}

// 🟢 Tải dữ liệu thống kê tổng quan
async function loadDashboardStats() {
  try {
    dashboardStats.value = await getDashboardStats();
    growthStats.value = await getGrowthAnalytics();
    orderStats.value = await getOrdersByDayStats();
  } catch (err) {
    console.error("Error loading dashboard stats:", err);
  }
}

// 🟢 Tải dữ liệu sản phẩm từ API
async function loadInventory() {
  loading.value = true;
  error.value = null;
  try {
    console.log("Loading inventory...");

    // Lấy tất cả sản phẩm với limit lớn để có đầy đủ dữ liệu tồn kho
    const response = await getAllProductsAdmin({
      limit: 1000, // Lấy nhiều sản phẩm để quản lý tồn kho
      page: 1,
      search: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });

    console.log("Products response:", response);

    if (response && response.data && response.data.products) {
      // Debug: Check first product structure
      if (response.data.products.length > 0) {
        console.log("First product structure:", response.data.products[0]);
        console.log("Category info:", response.data.products[0].category_id);
      }
      // Transform dữ liệu sản phẩm thành format inventory
      inventory.value = response.data.products.map((product) => ({
        id: product._id,
        name: product.name || product.title || "Chưa có tên",
        sku: product.sku || product._id.slice(-6).toUpperCase(),
        category:
          product.category_id?.name ||
          product.category?.name ||
          product.categoryName ||
          "Không có danh mục",
        quantity:
          product.stock_quantity || product.stock || product.quantity || 0,
        price: product.price || 0,
        image: product.image || product.images?.[0] || null,
        updatedAt:
          product.updatedAt || product.createdAt || new Date().toISOString(),
        description: product.description || "",
        status: product.status || "active",
      }));
    } else if (response && Array.isArray(response)) {
      // Xử lý nếu API trả về mảng trực tiếp
      inventory.value = response.map((product) => ({
        id: product._id,
        name: product.name || product.title || "Chưa có tên",
        sku: product.sku || product._id.slice(-6).toUpperCase(),
        category:
          product.category?.name || product.categoryName || "Không có danh mục",
        quantity: product.stock || product.quantity || 0,
        price: product.price || 0,
        image: product.image || product.images?.[0] || null,
        updatedAt:
          product.updatedAt || product.createdAt || new Date().toISOString(),
        description: product.description || "",
        status: product.status || "active",
      }));
    } else {
      console.warn("Unexpected API response format:", response);
      inventory.value = [];
    }

    console.log("Transformed inventory data:", inventory.value);

    // Tính toán thống kê
    calculateStats();
    await loadDashboardStats();
  } catch (err) {
    console.error("Error loading inventory:", err);
    error.value =
      "Không thể tải dữ liệu kho hàng. " + (err.message || "Vui lòng thử lại.");
    inventory.value = [];
  } finally {
    loading.value = false;
  }
}

// 🟢 Tính toán thống kê
function calculateStats() {
  const total = inventory.value.length;
  const inStock = inventory.value.filter((i) => i.quantity > 5).length;
  const lowStock = inventory.value.filter(
    (i) => i.quantity > 0 && i.quantity <= 5
  ).length;
  const outOfStock = inventory.value.filter((i) => i.quantity === 0).length;
  const totalInventoryValue = inventory.value.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );
  const avgProductPrice = total
    ? inventory.value.reduce((sum, i) => sum + i.price, 0) / total
    : 0;
  const topCategory = inventory.value.reduce((acc, i) => {
    acc[i.category] = (acc[i.category] || 0) + i.quantity;
    return acc;
  }, {});
  const topCat =
    Object.entries(topCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
  const totalSold = dashboardStats.value?.totalSold || 0;
  const totalOrders = dashboardStats.value?.totalOrders || 0;
  const growthRate = growthStats.value?.growthRate || 0;

  stats.value = {
    totalProducts: total,
    inStock,
    lowStock,
    outOfStock,
    totalInventoryValue,
    avgProductPrice,
    topCategory: topCat,
    totalOrders,
    totalSold,
    growthRate,
  };
}

// 🟢 Tính toán inventory sau khi lọc và sắp xếp
const filteredInventory = computed(() => {
  let filtered = inventory.value.filter((item) => {
    const matchCategory =
      selectedCategory.value === "all" ||
      item.category === selectedCategory.value;
    const matchStatus =
      selectedStatus.value === "all" ||
      getStockStatus(item.quantity) === selectedStatus.value;
    const matchSearch =
      !searchQuery.value ||
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchCategory && matchStatus && matchSearch;
  });

  // Sắp xếp
  filtered.sort((a, b) => {
    const aVal = a[sortField.value];
    const bVal = b[sortField.value];

    if (
      sortField.value === "name" ||
      sortField.value === "sku" ||
      sortField.value === "category"
    ) {
      return sortDirection.value === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    } else {
      return sortDirection.value === "asc" ? aVal - bVal : bVal - aVal;
    }
  });

  return filtered;
});

// 🟢 Pagination tính toán
const paginatedInventory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredInventory.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredInventory.value.length / itemsPerPage.value);
});

// 🟢 Hàm sắp xếp
function sortBy(field) {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortDirection.value = "asc";
  }
}

// 🟢 Hàm refresh dữ liệu
async function refreshData() {
  await loadInventory();
}

// 🟢 Hàm tìm kiếm theo thời gian thực
function handleSearch() {
  currentPage.value = 1; // Reset về trang đầu khi tìm kiếm
}

// 🟢 Khởi tạo dữ liệu
onMounted(async () => {
  await loadCategories();
  await loadInventory();
});
</script>

<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header với actions -->
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div
              class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-white"
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
            Quản lý tồn kho
          </h1>
          <p class="text-gray-600 mt-1">
            Theo dõi và quản lý hàng tồn kho một cách hiệu quả
          </p>
        </div>

        <div class="flex gap-3">
          <button
            @click="refreshData"
            :disabled="loading"
            class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <svg
              class="w-4 h-4"
              :class="{ 'animate-spin': loading }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {{ loading ? "Đang tải..." : "Làm mới" }}
          </button>
          <button
            class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Xuất báo cáo
          </button>
          <button
            class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nhập hàng
          </button>
        </div>
      </div>

      <!-- Hiển thị lỗi nếu có -->
      <div
        v-if="error"
        class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
      >
        <div class="flex items-center gap-3">
          <svg
            class="w-5 h-5 text-red-500 flex-shrink-0"
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
          <div>
            <h3 class="text-red-800 font-medium">Lỗi tải dữ liệu</h3>
            <p class="text-red-600 text-sm">{{ error }}</p>
          </div>
          <button
            @click="refreshData"
            class="ml-auto flex items-center gap-1 px-3 py-1 text-sm text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Thử lại
          </button>
        </div>
      </div>

      <!-- Thống kê với animation -->
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 padding-6"
      >
        <div
          class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ stats.totalProducts }}
              </p>
              <p class="text-sm text-gray-500 mt-1">
                +{{ stats.growthRate }}% tăng trưởng
              </p>
            </div>
            <div
              class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors"
            >
              <svg
                class="w-6 h-6 text-gray-600"
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
          </div>
        </div>

        <div
          class="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl shadow-sm border border-green-100 hover:shadow-md transition-all duration-300 group"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-green-700">Tổng giá trị kho</p>
              <p class="text-3xl font-bold text-green-900 mt-2">
                {{ formatCurrency(stats.totalInventoryValue) }}
              </p>
              <p class="text-sm text-green-600 mt-1">
                Giá trung bình: {{ formatCurrency(stats.avgProductPrice) }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center group-hover:bg-green-300 transition-colors"
            >
              <svg
                class="w-6 h-6 text-green-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Bộ lọc và tìm kiếm nâng cao -->
      <div
        class="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100"
      >
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Tìm kiếm -->
          <div class="relative flex-1">
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <svg
                class="h-5 w-5 text-gray-400"
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
            <input
              v-model="searchQuery"
              @input="handleSearch"
              type="text"
              placeholder="Tìm kiếm theo tên sản phẩm, mã SKU..."
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
            />
          </div>

          <!-- Bộ lọc -->
          <div class="flex flex-col sm:flex-row gap-4">
            <!-- Bộ lọc danh mục -->
            <div class="relative">
              <select
                v-model="selectedCategory"
                class="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all w-full sm:min-w-[180px] text-sm sm:text-base"
              >
                <option value="all">🏷️ Tất cả danh mục</option>
                <option
                  v-for="category in categories"
                  :key="category._id || category.id"
                  :value="category.name"
                >
                  {{ category.name }}
                </option>
              </select>
              <div
                class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
              >
                <svg
                  class="h-4 w-4 text-gray-400"
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
              </div>
            </div>

            <!-- Bộ lọc trạng thái -->
            <div class="relative">
              <select
                v-model="selectedStatus"
                class="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all w-full sm:min-w-[180px] text-sm sm:text-base"
              >
                <option value="all">📊 Tất cả trạng thái</option>
                <option value="Còn hàng">✅ Còn hàng</option>
                <option value="Sắp hết">⚠️ Sắp hết</option>
                <option value="Hết hàng">❌ Hết hàng</option>
              </select>
              <div
                class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
              >
                <svg
                  class="h-4 w-4 text-gray-400"
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
              </div>
            </div>
          </div>
        </div>

        <!-- Quick filters -->
        <div class="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
          <span class="text-sm text-gray-600 mr-2">Bộ lọc nhanh:</span>
          <button
            @click="selectedStatus = 'Hết hàng'"
            class="inline-flex items-center gap-1 px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
          >
            <svg
              class="w-3 h-3"
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
            Hết hàng
          </button>
          <button
            @click="selectedStatus = 'Sắp hết'"
            class="inline-flex items-center gap-1 px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors"
          >
            <svg
              class="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            Sắp hết
          </button>
          <button
            @click="
              selectedStatus = 'all';
              selectedCategory = 'all';
              searchQuery = '';
            "
            class="inline-flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
          >
            <svg
              class="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Xóa bộ lọc
          </button>
        </div>
      </div>

      <!-- Bảng sản phẩm với thiết kế hiện đại -->
      <div
        class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <!-- Header bảng -->
        <div class="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">
              Danh sách sản phẩm ({{ filteredInventory.length }})
            </h3>
            <div class="flex items-center gap-2 text-sm text-gray-500">
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
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
              Hiển thị dạng bảng
            </div>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="p-6">
          <div class="animate-pulse">
            <div class="flex justify-between items-center mb-4">
              <div class="h-4 bg-gray-300 rounded w-1/4"></div>
              <div class="h-4 bg-gray-300 rounded w-1/6"></div>
            </div>
            <div class="space-y-3">
              <div
                v-for="n in 5"
                :key="n"
                class="flex items-center space-x-4 py-3"
              >
                <div class="w-12 h-12 bg-gray-300 rounded-xl"></div>
                <div class="flex-1">
                  <div class="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                  <div class="h-3 bg-gray-300 rounded w-1/3"></div>
                </div>
                <div class="w-20 h-4 bg-gray-300 rounded"></div>
                <div class="w-16 h-4 bg-gray-300 rounded"></div>
                <div class="w-24 h-4 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bảng responsive -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  @click="sortBy('name')"
                  class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div class="flex items-center gap-1">
                    Sản phẩm
                    <svg
                      v-if="sortField === 'name'"
                      :class="{ 'rotate-180': sortDirection === 'desc' }"
                      class="w-3 h-3 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </div>
                </th>
                <th
                  @click="sortBy('category')"
                  class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div class="flex items-center gap-1">
                    Danh mục
                    <svg
                      v-if="sortField === 'category'"
                      :class="{ 'rotate-180': sortDirection === 'desc' }"
                      class="w-3 h-3 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </div>
                </th>
                <th
                  @click="sortBy('quantity')"
                  class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div class="flex items-center gap-1">
                    Tồn kho
                    <svg
                      v-if="sortField === 'quantity'"
                      :class="{ 'rotate-180': sortDirection === 'desc' }"
                      class="w-3 h-3 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </div>
                </th>
                <th
                  @click="sortBy('price')"
                  class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div class="flex items-center gap-1">
                    Giá bán
                    <svg
                      v-if="sortField === 'price'"
                      :class="{ 'rotate-180': sortDirection === 'desc' }"
                      class="w-3 h-3 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </div>
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Trạng thái
                </th>
                <th
                  @click="sortBy('updatedAt')"
                  class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div class="flex items-center gap-1">
                    Cập nhật
                    <svg
                      v-if="sortField === 'updatedAt'"
                      :class="{ 'rotate-180': sortDirection === 'desc' }"
                      class="w-3 h-3 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </div>
                </th>
                <th
                  class="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="item in paginatedInventory"
                :key="item.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <!-- Thông tin sản phẩm -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div
                      class="w-12 h-12 rounded-xl flex items-center justify-center mr-4 overflow-hidden"
                    >
                      <img
                        v-if="item.image"
                        :src="item.image"
                        :alt="item.name"
                        class="w-full h-full object-cover rounded-xl"
                        @error="
                          $event.target.style.display = 'none';
                          $event.target.nextElementSibling.style.display =
                            'flex';
                        "
                      />
                      <div
                        class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center"
                      >
                        <svg
                          class="w-6 h-6 text-gray-600"
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
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {{ item.name }}
                      </div>
                      <div class="text-sm text-gray-500">
                        SKU: {{ item.sku }}
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Danh mục -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                  >
                    {{ item.category }}
                  </span>
                </td>

                <!-- Tồn kho -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="text-sm font-semibold text-gray-900">
                      {{ item.quantity }}
                    </div>
                    <div class="ml-2 text-xs text-gray-500"></div>
                  </div>
                </td>

                <!-- Giá bán -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ formatCurrency(item.price) }}
                  </div>
                </td>

                <!-- Trạng thái -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="{
                      'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800':
                        getStockStatus(item.quantity) === 'Còn hàng',
                      'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800':
                        getStockStatus(item.quantity) === 'Sắp hết',
                      'inline-flex px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800':
                        getStockStatus(item.quantity) === 'Hết hàng',
                    }"
                  >
                    {{ getStockStatus(item.quantity) }}
                  </span>
                </td>

                <!-- Ngày cập nhật -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(item.updatedAt) }}
                </td>

                <!-- Actions -->
                <td
                  class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                >
                  <div class="flex justify-end gap-1">
                    <div class="relative group">
                      <button
                        class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
                      <div
                        class="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                      >
                        Chỉnh sửa
                      </div>
                    </div>
                    <div class="relative group">
                      <button
                        class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
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
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                      <div
                        class="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                      >
                        Nhập hàng
                      </div>
                    </div>
                    <div class="relative group">
                      <button
                        class="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
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
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </button>
                      <div
                        class="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                      >
                        Xem báo cáo
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty state -->
        <div v-if="filteredInventory.length === 0" class="text-center py-12">
          <svg
            class="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414A1 1 0 0014 21H10a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 18H4"
            />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">
            Không tìm thấy sản phẩm
          </h3>
          <p class="mt-1 text-sm text-gray-500">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm khác.
          </p>
        </div>

        <!-- Pagination -->
        <div
          v-if="filteredInventory.length > 0"
          class="px-6 py-4 border-t border-gray-200 bg-white"
        >
          <div class="flex items-center justify-between">
            <!-- Thông tin hiển thị -->
            <div class="text-sm text-gray-700">
              Hiển thị {{ (currentPage - 1) * itemsPerPage + 1 }} -
              {{
                Math.min(currentPage * itemsPerPage, filteredInventory.length)
              }}
              trong tổng số {{ filteredInventory.length }} sản phẩm
            </div>

            <!-- Điều khiển phân trang -->
            <div class="flex items-center gap-2">
              <!-- Items per page -->
              <div class="flex items-center gap-2 mr-4">
                <span class="text-sm text-gray-600">Hiển thị:</span>
                <select
                  v-model="itemsPerPage"
                  @change="currentPage = 1"
                  class="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option :value="10">10</option>
                  <option :value="25">25</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
              </div>

              <!-- Previous button -->
              <button
                @click="currentPage--"
                :disabled="currentPage <= 1"
                class="p-2 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 transition-colors"
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
              </button>

              <!-- Page numbers -->
              <div class="flex items-center gap-1">
                <template v-for="page in Math.min(5, totalPages)" :key="page">
                  <button
                    @click="currentPage = page"
                    :class="{
                      'bg-blue-600 text-white': currentPage === page,
                      'bg-white text-gray-700 hover:bg-gray-100':
                        currentPage !== page,
                    }"
                    class="w-8 h-8 text-sm font-medium rounded-lg border border-gray-300 transition-colors"
                  >
                    {{ page }}
                  </button>
                </template>

                <span v-if="totalPages > 5" class="text-gray-500">...</span>

                <button
                  v-if="totalPages > 5 && currentPage < totalPages"
                  @click="currentPage = totalPages"
                  :class="{
                    'bg-blue-600 text-white': currentPage === totalPages,
                    'bg-white text-gray-700 hover:bg-gray-100':
                      currentPage !== totalPages,
                  }"
                  class="w-8 h-8 text-sm font-medium rounded-lg border border-gray-300 transition-colors"
                >
                  {{ totalPages }}
                </button>
              </div>

              <!-- Next button -->
              <button
                @click="currentPage++"
                :disabled="currentPage >= totalPages"
                class="p-2 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 transition-colors"
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
