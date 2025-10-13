<script setup>
import { ref, onMounted, computed } from "vue";
import AdminLayout from "@/components/admin/AdminLayout.vue";
import { getDashboardStats, getRevenueChartData, getDashboardTopProducts } from "@/api/admin/dashboardService";
import { getAllProductsAdmin } from "@/api/admin/productService";
import { getAllOrdersAdmin, getOrdersByDayStats } from "@/api/admin/orderService";
import { getCategoriesAdmin } from "@/api/admin/categoryService";

// 🟢 Dữ liệu thống kê
const loading = ref(false);
const error = ref(null);
const timeRange = ref('month'); // week, month, quarter, year

// 🟢 Dữ liệu từ API
const dashboardStats = ref(null);
const revenueData = ref(null);
const topProducts = ref([]);
const products = ref([]);
const orders = ref([]);
const orderStats = ref(null);
const categories = ref([]);

// 🟢 Thống kê tổng hợp
const overviewStats = ref({
  totalRevenue: 0,
  totalOrders: 0,
  totalProducts: 0,
  totalCustomers: 0,
  avgOrderValue: 0,
  conversionRate: 0,
  growthRate: 0,
  returnRate: 0
});

// 🟢 Thống kê kho hàng
const inventoryStats = ref({
  totalValue: 0,
  inStock: 0,
  lowStock: 0,
  outOfStock: 0,
  avgPrice: 0,
  topCategory: '',
  categoryStats: []
});

// 🟢 Thống kê bán hàng
const salesStats = ref({
  dailySales: [],
  monthlySales: [],
  topSellingProducts: [],
  salesByCategory: [],
  orderStatusStats: {
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  }
});

// 🟢 Hàm format
const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("vi-VN");
};

const formatPercent = (value) => {
  return `${(value || 0).toFixed(1)}%`;
};

// 🟢 Tải tất cả dữ liệu
async function loadAllData() {
  loading.value = true;
  error.value = null;
  
  try {
    // Tải đồng thời tất cả API
    const [
      dashboardResponse,
      revenueResponse,
      topProductsResponse,
      productsResponse,
      ordersResponse,
      orderStatsResponse,
      categoriesResponse
    ] = await Promise.allSettled([
      getDashboardStats(),
      getRevenueChartData(timeRange.value),
      getDashboardTopProducts(10),
      getAllProductsAdmin({ limit: 1000 }),
      getAllOrdersAdmin({ limit: 1000 }),
      getOrdersByDayStats(),
      getCategoriesAdmin()
    ]);

    // Xử lý dữ liệu dashboard
    if (dashboardResponse.status === 'fulfilled') {
      dashboardStats.value = dashboardResponse.value;
    }

    // Xử lý dữ liệu revenue
    if (revenueResponse.status === 'fulfilled') {
      revenueData.value = revenueResponse.value;
    }

    // Xử lý top products
    if (topProductsResponse.status === 'fulfilled') {
      topProducts.value = topProductsResponse.value?.data || [];
    }

    // Xử lý products
    if (productsResponse.status === 'fulfilled') {
      products.value = productsResponse.value?.data?.products || productsResponse.value?.products || [];
    }

    // Xử lý orders
    if (ordersResponse.status === 'fulfilled') {
      orders.value = ordersResponse.value?.data?.orders || ordersResponse.value?.orders || [];
    }

    // Xử lý order stats
    if (orderStatsResponse.status === 'fulfilled') {
      orderStats.value = orderStatsResponse.value;
    }

    // Xử lý categories
    if (categoriesResponse.status === 'fulfilled') {
      categories.value = categoriesResponse.value?.data || categoriesResponse.value || [];
    }

    // Tính toán thống kê
    calculateOverviewStats();
    calculateInventoryStats();
    calculateSalesStats();

  } catch (err) {
    console.error("Error loading statistics data:", err);
    error.value = "Không thể tải dữ liệu thống kê. Vui lòng thử lại.";
  } finally {
    loading.value = false;
  }
}

// 🟢 Tính toán thống kê tổng quan
function calculateOverviewStats() {
  const totalRevenue = orders.value.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const totalOrders = orders.value.length;
  const totalProducts = products.value.length;
  const uniqueCustomers = new Set(orders.value.map(o => o.userId || o.customerId)).size;
  const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

  // Tính conversion rate (giả định)
  const totalVisits = totalOrders * 10; // Giả sử 1 order có 10 visits
  const conversionRate = totalVisits ? (totalOrders / totalVisits) * 100 : 0;

  // Tính growth rate từ dashboard hoặc tính toán
  const growthRate = dashboardStats.value?.growthRate || 0;

  // Tính return rate
  const returnedOrders = orders.value.filter(o => o.status === 'returned' || o.status === 'cancelled').length;
  const returnRate = totalOrders ? (returnedOrders / totalOrders) * 100 : 0;

  overviewStats.value = {
    totalRevenue,
    totalOrders,
    totalProducts,
    totalCustomers: uniqueCustomers,
    avgOrderValue,
    conversionRate,
    growthRate,
    returnRate
  };
}

// 🟢 Tính toán thống kê kho hàng
function calculateInventoryStats() {
  const totalValue = products.value.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);
  const inStock = products.value.filter(p => (p.stock || 0) > 5).length;
  const lowStock = products.value.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length;
  const outOfStock = products.value.filter(p => (p.stock || 0) === 0).length;
  const avgPrice = products.value.length ? products.value.reduce((sum, p) => sum + p.price, 0) / products.value.length : 0;

  // Thống kê theo danh mục
  const categoryStats = {};
  products.value.forEach(p => {
    const categoryName = p.category?.name || p.categoryName || 'Khác';
    if (!categoryStats[categoryName]) {
      categoryStats[categoryName] = {
        name: categoryName,
        count: 0,
        totalStock: 0,
        totalValue: 0
      };
    }
    categoryStats[categoryName].count++;
    categoryStats[categoryName].totalStock += p.stock || 0;
    categoryStats[categoryName].totalValue += p.price * (p.stock || 0);
  });

  const topCategory = Object.values(categoryStats).sort((a, b) => b.totalStock - a.totalStock)[0]?.name || '';

  inventoryStats.value = {
    totalValue,
    inStock,
    lowStock,
    outOfStock,
    avgPrice,
    topCategory,
    categoryStats: Object.values(categoryStats)
  };
}

// 🟢 Tính toán thống kê bán hàng
function calculateSalesStats() {
  // Thống kê theo ngày (7 ngày gần nhất)
  const last7Days = Array.from({length: 7}, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const dailySales = last7Days.map(date => {
    const dayOrders = orders.value.filter(o => {
      const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
      return orderDate === date;
    });
    return {
      date,
      orders: dayOrders.length,
      revenue: dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    };
  });

  // Top selling products
  const productSales = {};
  orders.value.forEach(order => {
    if (order.items) {
      order.items.forEach(item => {
        const productId = item.productId || item.product?._id;
        if (productId) {
          productSales[productId] = (productSales[productId] || 0) + (item.quantity || 0);
        }
      });
    }
  });

  const topSellingProducts = Object.entries(productSales)
    .map(([productId, quantity]) => {
      const product = products.value.find(p => p._id === productId);
      return {
        id: productId,
        name: product?.name || 'Unknown Product',
        quantity,
        revenue: quantity * (product?.price || 0)
      };
    })
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Sales by category
  const salesByCategory = {};
  orders.value.forEach(order => {
    if (order.items) {
      order.items.forEach(item => {
        const product = products.value.find(p => p._id === (item.productId || item.product?._id));
        const categoryName = product?.category?.name || product?.categoryName || 'Khác';
        salesByCategory[categoryName] = (salesByCategory[categoryName] || 0) + (item.quantity || 0) * (product?.price || 0);
      });
    }
  });

  // Order status stats
  const orderStatusStats = {
    pending: orders.value.filter(o => o.status === 'pending').length,
    processing: orders.value.filter(o => o.status === 'processing').length,
    shipped: orders.value.filter(o => o.status === 'shipped').length,
    delivered: orders.value.filter(o => o.status === 'delivered').length,
    cancelled: orders.value.filter(o => o.status === 'cancelled').length
  };

  salesStats.value = {
    dailySales,
    monthlySales: [], // TODO: Implement monthly calculation
    topSellingProducts,
    salesByCategory: Object.entries(salesByCategory).map(([name, value]) => ({ name, value })),
    orderStatusStats
  };
}

// 🟢 Thay đổi khoảng thời gian
async function changeTimeRange(range) {
  timeRange.value = range;
  await loadAllData();
}

// 🟢 Refresh dữ liệu
async function refreshData() {
  await loadAllData();
}

// 🟢 Khởi tạo
onMounted(() => {
  loadAllData();
});
</script>

<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            Thống kê & Phân tích
          </h1>
          <p class="text-gray-600 mt-1">Báo cáo chi tiết về hoạt động kinh doanh và tồn kho</p>
        </div>
        
        <div class="flex gap-3">
          <!-- Time Range Selector -->
          <div class="flex bg-gray-100 rounded-xl p-1">
            <button 
              v-for="range in [
                {key: 'week', label: '7 ngày'}, 
                {key: 'month', label: '1 tháng'}, 
                {key: 'quarter', label: '3 tháng'}, 
                {key: 'year', label: '1 năm'}
              ]" 
              :key="range.key"
              @click="changeTimeRange(range.key)"
              :class="{
                'bg-white shadow-sm text-gray-900': timeRange === range.key,
                'text-gray-600 hover:text-gray-900': timeRange !== range.key
              }"
              class="px-3 py-2 text-sm font-medium rounded-lg transition-all"
            >
              {{ range.label }}
            </button>
          </div>
          
          <button 
            @click="refreshData" 
            :disabled="loading"
            class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <svg class="w-4 h-4" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
                        {{ loading ? 'Đang tải...' : 'Làm mới' }}
          </button>

          <button class="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Xuất báo cáo
          </button>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <h3 class="text-red-800 font-medium">Lỗi tải dữ liệu</h3>
            <p class="text-red-600 text-sm">{{ error }}</p>
          </div>
          <button 
            @click="refreshData"
            class="ml-auto flex items-center gap-1 px-3 py-1 text-sm text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Thử lại
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="n in 8" :key="n" class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <div class="h-4 bg-gray-300 rounded w-20"></div>
              <div class="h-8 bg-gray-300 rounded w-16"></div>
              <div class="h-3 bg-gray-300 rounded w-24"></div>
            </div>
            <div class="w-12 h-12 bg-gray-300 rounded-xl"></div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else class="space-y-6">
        <!-- Thống kê tổng quan -->
        <div>
          <h2 class="text-xl font-semibold text-gray-900 mb-4">📊 Thống kê tổng quan</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Tổng doanh thu -->
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-sm border border-blue-100 hover:shadow-md transition-all duration-300">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-blue-700">Tổng doanh thu</p>
                  <p class="text-3xl font-bold text-blue-900 mt-2">{{ formatCurrency(overviewStats.totalRevenue) }}</p>
                  <p class="text-sm text-blue-600 mt-1">+{{ formatPercent(overviewStats.growthRate) }} so với kỳ trước</p>
                </div>
                <div class="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Tổng đơn hàng -->
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl shadow-sm border border-green-100 hover:shadow-md transition-all duration-300">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-green-700">Tổng đơn hàng</p>
                  <p class="text-3xl font-bold text-green-900 mt-2">{{ overviewStats.totalOrders.toLocaleString() }}</p>
                  <p class="text-sm text-green-600 mt-1">Trung bình: {{ formatCurrency(overviewStats.avgOrderValue) }}</p>
                </div>
                <div class="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Khách hàng -->
            <div class="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl shadow-sm border border-purple-100 hover:shadow-md transition-all duration-300">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-purple-700">Khách hàng</p>
                  <p class="text-3xl font-bold text-purple-900 mt-2">{{ overviewStats.totalCustomers.toLocaleString() }}</p>
                  <p class="text-sm text-purple-600 mt-1">Tỷ lệ chuyển đổi: {{ formatPercent(overviewStats.conversionRate) }}</p>
                </div>
                <div class="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Sản phẩm -->
            <div class="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl shadow-sm border border-yellow-100 hover:shadow-md transition-all duration-300">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-yellow-700">Sản phẩm</p>
                  <p class="text-3xl font-bold text-yellow-900 mt-2">{{ overviewStats.totalProducts.toLocaleString() }}</p>
                  <p class="text-sm text-yellow-600 mt-1">Tỷ lệ trả hàng: {{ formatPercent(overviewStats.returnRate) }}</p>
                </div>
                <div class="w-12 h-12 bg-yellow-200 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Thống kê kho hàng -->
        <div>
          <h2 class="text-xl font-semibold text-gray-900 mb-4">📦 Thống kê kho hàng</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Tổng giá trị kho -->
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Tổng giá trị kho</p>
                  <p class="text-2xl font-bold text-gray-900 mt-2">{{ formatCurrency(inventoryStats.totalValue) }}</p>
                  <p class="text-sm text-gray-500 mt-1">Giá TB: {{ formatCurrency(inventoryStats.avgPrice) }}</p>
                </div>
                <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Còn hàng -->
            <div class="bg-green-50 p-6 rounded-2xl shadow-sm border border-green-100 hover:shadow-md transition-all duration-300">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-green-700">Còn hàng</p>
                  <p class="text-2xl font-bold text-green-900 mt-2">{{ inventoryStats.inStock }}</p>
                  <p class="text-sm text-green-600 mt-1">Tình trạng tốt</p>
                </div>
                <div class="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Sắp hết -->
            <div class="bg-yellow-50 p-6 rounded-2xl shadow-sm border border-yellow-100 hover:shadow-md transition-all duration-300">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-yellow-700">Sắp hết hàng</p>
                  <p class="text-2xl font-bold text-yellow-900 mt-2">{{ inventoryStats.lowStock }}</p>
                  <p class="text-sm text-yellow-600 mt-1">Cần nhập thêm</p>
                </div>
                <div class="w-12 h-12 bg-yellow-200 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Hết hàng -->
            <div class="bg-red-50 p-6 rounded-2xl shadow-sm border border-red-100 hover:shadow-md transition-all duration-300">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-red-700">Hết hàng</p>
                  <p class="text-2xl font-bold text-red-900 mt-2">{{ inventoryStats.outOfStock }}</p>
                  <p class="text-sm text-red-600 mt-1">Cần nhập ngay</p>
                </div>
                <div class="w-12 h-12 bg-red-200 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Biểu đồ và phân tích -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Doanh số theo ngày -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">📈 Doanh số 7 ngày gần nhất</h3>
            <div class="space-y-3">
              <div v-for="day in salesStats.dailySales" :key="day.date" class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p class="font-medium text-gray-900">{{ formatDate(day.date) }}</p>
                  <p class="text-sm text-gray-600">{{ day.orders }} đơn hàng</p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-green-600">{{ formatCurrency(day.revenue) }}</p>
                  <div class="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div class="bg-green-600 h-2 rounded-full" :style="{width: `${Math.min(100, (day.revenue / Math.max(...salesStats.dailySales.map(d => d.revenue))) * 100)}%`}"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sản phẩm bán chạy -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">🔥 Top sản phẩm bán chạy</h3>
            <div class="space-y-3">
              <div v-for="(product, index) in salesStats.topSellingProducts" :key="product.id" class="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center font-bold text-blue-700">
                  {{ index + 1 }}
                </div>
                <div class="flex-1">
                  <p class="font-medium text-gray-900">{{ product.name }}</p>
                  <p class="text-sm text-gray-600">Đã bán: {{ product.quantity }} sản phẩm</p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-green-600">{{ formatCurrency(product.revenue) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Thống kê theo danh mục và trạng thái đơn hàng -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Doanh số theo danh mục -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">🏷️ Doanh số theo danh mục</h3>
            <div class="space-y-3">
              <div v-for="category in salesStats.salesByCategory.slice(0, 5)" :key="category.name" class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p class="font-medium text-gray-900">{{ category.name }}</p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-blue-600">{{ formatCurrency(category.value) }}</p>
                  <div class="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div class="bg-blue-600 h-2 rounded-full" :style="{width: `${Math.min(100, (category.value / Math.max(...salesStats.salesByCategory.map(c => c.value))) * 100)}%`}"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Trạng thái đơn hàng -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">📋 Trạng thái đơn hàng</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                <span class="text-blue-700 font-medium">Chờ xử lý</span>
                <span class="font-bold text-blue-900">{{ salesStats.orderStatusStats.pending }}</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                <span class="text-yellow-700 font-medium">Đang xử lý</span>
                <span class="font-bold text-yellow-900">{{ salesStats.orderStatusStats.processing }}</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                <span class="text-purple-700 font-medium">Đang giao</span>
                <span class="font-bold text-purple-900">{{ salesStats.orderStatusStats.shipped }}</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <span class="text-green-700 font-medium">Đã giao</span>
                <span class="font-bold text-green-900">{{ salesStats.orderStatusStats.delivered }}</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                <span class="text-red-700 font-medium">Đã hủy</span>
                <span class="font-bold text-red-900">{{ salesStats.orderStatusStats.cancelled }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Thống kê kho hàng theo danh mục -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">📊 Phân tích kho hàng theo danh mục</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="category in inventoryStats.categoryStats.slice(0, 6)" :key="category.name" class="p-4 bg-gray-50 rounded-xl">
              <h4 class="font-semibold text-gray-900">{{ category.name }}</h4>
              <div class="mt-2 space-y-1">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Số sản phẩm:</span>
                  <span class="font-medium">{{ category.count }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Tồn kho:</span>
                  <span class="font-medium">{{ category.totalStock }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Giá trị:</span>
                  <span class="font-medium text-green-600">{{ formatCurrency(category.totalValue) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
/* Custom styles for better visual appeal */
.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.progress-bar {
  transition: width 0.5s ease-in-out;
}

/* Responsive improvements */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>