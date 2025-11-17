<script setup>
import { ref, onMounted } from "vue";
import AdminLayout from "@/layout/AdminLayout.vue";
import RevenueChart from "@/components/admin/RevenueChart.vue";
import {
  getDashboardStats,
  getRevenueChartData,
} from "@/api/admin/dashboardService";
import { getAllProductsAdmin } from "@/api/admin/productService";
import { getAllOrdersAdmin } from "@/api/admin/orderService";

// 🟢 Dữ liệu thống kê
const loading = ref(false);
const error = ref(null);
const timeRange = ref("month"); // week, month, quarter, year

// 🟢 Modal xuất báo cáo
const showExportModal = ref(false);
const exportConfig = ref({
  type: "revenue", // revenue, inventory, best-sellers, orders, categories, comprehensive
  timeRange: "month", // day, week, month, quarter, year, custom
  format: "excel", // excel, pdf, word, csv, json
  customStartDate: "",
  customEndDate: "",
});
const exporting = ref(false);

// 🟢 Dữ liệu từ API
const dashboardStats = ref(null);
const revenueData = ref(null);
const products = ref([]);
const orders = ref([]);

// 🟢 Thống kê tổng hợp
const overviewStats = ref({
  totalRevenue: 0,
  totalOrders: 0,
  totalProducts: 0,
  totalCustomers: 0,
  avgOrderValue: 0,
  conversionRate: 0,
  growthRate: 0,
  returnRate: 0,
});

// 🟢 Thống kê kho hàng
const inventoryStats = ref({
  totalValue: 0,
  inStock: 0,
  lowStock: 0,
  outOfStock: 0,
  avgPrice: 0,
  topCategory: "",
  categoryStats: [],
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
    cancelled: 0,
  },
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

// 🟢 Màu sắc cho biểu đồ danh mục
const getCategoryColor = (index) => {
  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#14B8A6', // teal
    '#F97316', // orange
  ];
  return colors[index % colors.length];
};

// 🟢 Tải tất cả dữ liệu
async function loadAllData() {
  loading.value = true;
  error.value = null;

  try {
    // Tải đồng thời tất cả API
    // Chỉ cần load một phần products/orders để hiển thị chi tiết
    // Thống kê tổng quan lấy từ dashboardStats
    const [
      dashboardResponse,
      revenueResponse,
      productsResponse,
      ordersResponse,
    ] = await Promise.allSettled([
      getDashboardStats(),
      getRevenueChartData(timeRange.value),
      getAllProductsAdmin({ limit: 100, page: 1 }), // Chỉ lấy 100 để tính inventory stats
      getAllOrdersAdmin({ limit: 100, page: 1 }), // Chỉ lấy 100 để phân tích chi tiết
    ]);

    // Xử lý dữ liệu dashboard
    if (dashboardResponse.status === "fulfilled") {
      dashboardStats.value = dashboardResponse.value;
    }

    // Xử lý dữ liệu revenue
    if (revenueResponse.status === "fulfilled") {
      const responseData = revenueResponse.value;
      const rawData = responseData?.data || responseData || [];

      revenueData.value = Array.isArray(rawData)
        ? rawData.map((item) => ({
            month: item?.month || "",
            revenue: Number(item?.revenue) || 0,
            orders: Number(item?.orders) || 0,
          }))
        : [];
    }

    // Xử lý products
    if (productsResponse.status === "fulfilled") {
      products.value =
        productsResponse.value?.data?.products ||
        productsResponse.value?.products ||
        [];
    }

    // Xử lý orders
    if (ordersResponse.status === "fulfilled") {
      orders.value =
        ordersResponse.value?.data?.orders ||
        ordersResponse.value?.orders ||
        [];
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
  // Sử dụng dữ liệu từ dashboardStats API (tổng số thực từ database)
  const overview =
    dashboardStats.value?.data?.overview ||
    dashboardStats.value?.overview ||
    {};

  const totalRevenue = Number(overview.totalRevenue) || 0;
  const totalOrders = Number(overview.totalOrders) || 0;
  const totalProducts = Number(overview.totalProducts) || 0;
  const totalUsers = Number(overview.totalUsers) || 0;

  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Tính conversion rate (giả định)
  const totalVisits = totalOrders * 10; // Giả sử 1 order có 10 visits
  const conversionRate = totalVisits ? (totalOrders / totalVisits) * 100 : 0;

  // Tính growth rate từ dashboard hoặc tính toán
  const growthRate = dashboardStats.value?.growthRate || 0;

  // Tính return rate từ orders hiện tại (chỉ để tham khảo vì có giới hạn)
  const returnedOrders = orders.value.filter(
    (o) => o.status === "returned" || o.status === "cancelled"
  ).length;
  const returnRate =
    orders.value.length > 0 ? (returnedOrders / orders.value.length) * 100 : 0;

  overviewStats.value = {
    totalRevenue,
    totalOrders,
    totalProducts,
    totalCustomers: totalUsers,
    avgOrderValue,
    conversionRate,
    growthRate,
    returnRate,
  };
}

// 🟢 Tính toán thống kê kho hàng
function calculateInventoryStats() {
  // Lưu ý: products.value có giới hạn 1000 items do pagination
  // Để có số liệu chính xác 100%, nên tạo API riêng cho inventory stats
  // Hiện tại tính toán dựa trên products.value để hiển thị

  const totalValue = products.value.reduce((sum, p) => {
    const price = Number(p.price ?? 0);
    const stock = Number(p.stock ?? 0);
    const item =
      (Number.isFinite(price) ? price : 0) *
      (Number.isFinite(stock) ? stock : 0);
    return sum + item;
  }, 0);
  const inStock = products.value.filter((p) => (p.stock || 0) > 5).length;
  const lowStock = products.value.filter(
    (p) => (p.stock || 0) > 0 && (p.stock || 0) <= 5
  ).length;
  const outOfStock = products.value.filter((p) => (p.stock || 0) === 0).length;
  const avgPrice = products.value.length
    ? products.value.reduce((sum, p) => {
        const price = Number(p.price ?? 0);
        return sum + (Number.isFinite(price) ? price : 0);
      }, 0) / products.value.length
    : 0;

  // Thống kê theo danh mục
  const categoryStats = {};
  products.value.forEach((p) => {
    const categoryName = p.category?.name || p.categoryName || "Khác";
    if (!categoryStats[categoryName]) {
      categoryStats[categoryName] = {
        name: categoryName,
        count: 0,
        totalStock: 0,
        totalValue: 0,
      };
    }
    categoryStats[categoryName].count++;
    categoryStats[categoryName].totalStock += p.stock || 0;
    categoryStats[categoryName].totalValue += (p.price || 0) * (p.stock || 0);
  });

  const topCategory =
    Object.values(categoryStats).sort((a, b) => b.totalStock - a.totalStock)[0]
      ?.name || "";

  inventoryStats.value = {
    totalValue,
    inStock,
    lowStock,
    outOfStock,
    avgPrice,
    topCategory,
    categoryStats: Object.values(categoryStats),
  };
}

// 🟢 Tính toán thống kê bán hàng
function calculateSalesStats() {
  // Thống kê theo ngày (7 ngày gần nhất)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split("T")[0];
  }).reverse();

  const dailySales = last7Days.map((date) => {
    const dayOrders = orders.value.filter((o) => {
      const orderDate = new Date(o.createdAt).toISOString().split("T")[0];
      return orderDate === date;
    });
    return {
      date,
      orders: dayOrders.length,
      revenue: dayOrders.reduce((sum, o) => {
        const amt = Number(o.totalAmount ?? o.total ?? 0);
        return sum + (Number.isFinite(amt) ? amt : 0);
      }, 0),
    };
  });

  // Top selling products
  const productSales = {};
  orders.value.forEach((order) => {
    if (order.items) {
      order.items.forEach((item) => {
        const productId = item.productId || item.product?._id;
        if (productId) {
          productSales[productId] =
            (productSales[productId] || 0) + (item.quantity || 0);
        }
      });
    }
  });

  const topSellingProducts = Object.entries(productSales)
    .map(([productId, quantity]) => {
      const product = products.value.find((p) => p._id === productId);
      const price = Number(product?.price ?? 0);
      return {
        id: productId,
        name: product?.name || "Unknown Product",
        quantity,
        revenue: quantity * (Number.isFinite(price) ? price : 0),
      };
    })
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Sales by category
  const salesByCategory = {};
  orders.value.forEach((order) => {
    if (order.items) {
      order.items.forEach((item) => {
        const product = products.value.find(
          (p) => p._id === (item.productId || item.product?._id)
        );
        const categoryName =
          product?.category?.name || product?.categoryName || "Khác";
        const price = Number(product?.price ?? 0);
        const qty = Number(item.quantity ?? 0);
        const add =
          (Number.isFinite(price) ? price : 0) *
          (Number.isFinite(qty) ? qty : 0);
        salesByCategory[categoryName] =
          (salesByCategory[categoryName] || 0) + add;
      });
    }
  });

  // Order status stats
  const orderStatusStats = {
    pending: orders.value.filter((o) => o.status === "pending").length,
    processing: orders.value.filter((o) => o.status === "processing").length,
    shipped: orders.value.filter((o) => o.status === "shipped").length,
    delivered: orders.value.filter((o) => o.status === "delivered").length,
    cancelled: orders.value.filter((o) => o.status === "cancelled").length,
  };

  salesStats.value = {
    dailySales,
    monthlySales: [], // TODO: Implement monthly calculation
    topSellingProducts,
    salesByCategory: Object.entries(salesByCategory).map(([name, value]) => ({
      name,
      value,
    })),
    orderStatusStats,
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

// 🟢 Mở modal xuất báo cáo
function openExportModal() {
  exportConfig.value = {
    type: "revenue",
    timeRange: timeRange.value,
    format: "excel",
    customStartDate: "",
    customEndDate: "",
  };
  showExportModal.value = true;
}

// 🟢 Đóng modal xuất báo cáo
function closeExportModal() {
  showExportModal.value = false;
}

// 🟢 Xuất báo cáo với cấu hình
async function exportReport() {
  try {
    exporting.value = true;

    // Validate custom dates
    if (exportConfig.value.timeRange === "custom") {
      if (
        !exportConfig.value.customStartDate ||
        !exportConfig.value.customEndDate
      ) {
        alert("Vui lòng chọn ngày bắt đầu và ngày kết thúc");
        return;
      }
    }

    // Build query params
    const params = new URLSearchParams({
      type: exportConfig.value.type,
      timeRange: exportConfig.value.timeRange,
      format: exportConfig.value.format,
    });

    if (exportConfig.value.timeRange === "custom") {
      params.append("startDate", exportConfig.value.customStartDate);
      params.append("endDate", exportConfig.value.customEndDate);
    }

    // For Excel, PDF, Word - download file directly
    if (["excel", "pdf", "word"].includes(exportConfig.value.format)) {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/admin/reports/export?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể xuất báo cáo");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const extension =
        exportConfig.value.format === "excel"
          ? "xlsx"
          : exportConfig.value.format === "pdf"
          ? "pdf"
          : "docx";
      link.download = `bao-cao-${
        exportConfig.value.type
      }-${Date.now()}.${extension}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      // For CSV and JSON - process data
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/admin/reports/export?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể xuất báo cáo");
      }

      const data = await response.json();
      const reportData = data.data || data;

      // Export based on format
      if (exportConfig.value.format === "csv") {
        exportToCSV(reportData);
      } else {
        exportToJSON(reportData);
      }
    }

    closeExportModal();
  } catch (err) {
    console.error("Export error:", err);
    alert("Lỗi xuất báo cáo: " + err.message);
  } finally {
    exporting.value = false;
  }
}

// 🟢 Xuất CSV từ dữ liệu báo cáo
function exportToCSV(reportData) {
  let csv =
    "\ufeffBÁO CÁO " +
    getReportTypeName(exportConfig.value.type).toUpperCase() +
    "\n";
  csv += `Ngày xuất,${new Date().toLocaleString("vi-VN")}\n`;
  csv += `Loại báo cáo,${getReportTypeName(exportConfig.value.type)}\n`;
  csv += `Thời gian,${getTimeRangeName(exportConfig.value.timeRange)}\n\n`;

  // Format dựa trên loại báo cáo
  if (exportConfig.value.type === "revenue") {
    csv += formatRevenueCSV(reportData);
  } else if (exportConfig.value.type === "inventory") {
    csv += formatInventoryCSV(reportData);
  } else if (exportConfig.value.type === "best-sellers") {
    csv += formatBestSellersCSV(reportData);
  } else if (exportConfig.value.type === "orders") {
    csv += formatOrdersCSV(reportData);
  } else if (exportConfig.value.type === "categories") {
    csv += formatCategoriesCSV(reportData);
  } else if (exportConfig.value.type === "comprehensive") {
    csv += formatComprehensiveCSV(reportData);
  }

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `bao-cao-${exportConfig.value.type}-${Date.now()}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 🟢 Xuất JSON
function exportToJSON(reportData) {
  const jsonStr = JSON.stringify(reportData, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `bao-cao-${exportConfig.value.type}-${Date.now()}.json`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 🟢 Format các loại báo cáo CSV
function formatRevenueCSV(data) {
  let csv = "TỔNG QUAN DOANH THU\n";
  csv += "Chỉ tiêu,Giá trị\n";
  csv += `Tổng doanh thu,"${formatCurrency(
    data.summary?.totalRevenue || 0
  )}"\n`;
  csv += `Tổng đơn hàng,${data.summary?.totalOrders || 0}\n`;
  csv += `Đơn hoàn thành,${data.summary?.completedOrders || 0}\n`;
  csv += `Đơn hủy,${data.summary?.cancelledOrders || 0}\n`;
  csv += `Giá trị TB đơn hàng,"${formatCurrency(
    data.summary?.avgOrderValue || 0
  )}"\n\n`;

  csv += "DOANH THU THEO NGÀY\n";
  csv += "Ngày,Doanh thu,Số đơn\n";
  (data.dailyRevenue || []).forEach((item) => {
    csv += `${item.date},"${formatCurrency(item.revenue)}",${item.orders}\n`;
  });

  return csv;
}

function formatInventoryCSV(data) {
  let csv = "TỔNG QUAN TỒN KHO\n";
  csv += "Chỉ tiêu,Giá trị\n";
  csv += `Tổng sản phẩm,${data.summary?.totalProducts || 0}\n`;
  csv += `Còn hàng,${data.summary?.inStock || 0}\n`;
  csv += `Sắp hết,${data.summary?.lowStock || 0}\n`;
  csv += `Hết hàng,${data.summary?.outOfStock || 0}\n`;
  csv += `Tổng giá trị,"${formatCurrency(data.summary?.totalValue || 0)}"\n\n`;

  csv += "SẢN PHẨM CẦN NHẬP THÊM\n";
  csv += "Tên sản phẩm,SKU,Tồn kho,Giá,Danh mục\n";
  (data.needsRestock || []).forEach((item) => {
    csv += `"${item.name}",${item.sku},${item.currentStock},"${formatCurrency(
      item.price
    )}","${item.category}"\n`;
  });

  return csv;
}

function formatBestSellersCSV(data) {
  let csv = "SẢN PHẨM BÁN CHẠY\n";
  csv += "Tên sản phẩm,SKU,Đã bán,Doanh thu,Số đơn\n";
  (data.bestSellers || []).forEach((item) => {
    csv += `"${item.productName}",${item.sku},${
      item.totalSold
    },"${formatCurrency(item.totalRevenue)}",${item.orderCount}\n`;
  });
  csv += "\n";

  csv += "SẢN PHẨM BÁN CHẬM\n";
  csv += "Tên sản phẩm,SKU,Đã bán,Doanh thu\n";
  (data.slowMovers || []).forEach((item) => {
    csv += `"${item.productName}",${item.sku},${
      item.totalSold
    },"${formatCurrency(item.totalRevenue)}"\n`;
  });

  return csv;
}

function formatOrdersCSV(data) {
  let csv = "THỐNG KÊ ĐỖN HÀNG\n";
  csv += "Trạng thái,Số lượng,Tổng tiền,Phần trăm\n";
  (data.ordersByStatus || []).forEach((item) => {
    csv += `${item.status},${item.count},"${formatCurrency(
      item.totalAmount
    )}",${item.percentage}%\n`;
  });

  return csv;
}

function formatCategoriesCSV(data) {
  let csv = "DOANH SỐ THEO DANH MỤC\n";
  csv += "Danh mục,Đã bán,Doanh thu,Phần trăm\n";
  (data.categorySales || []).forEach((item) => {
    csv += `"${item.categoryName}",${item.totalSold},"${formatCurrency(
      item.totalRevenue
    )}",${item.revenuePercentage}%\n`;
  });

  return csv;
}

function formatComprehensiveCSV(data) {
  let csv = "BÁO CÁO TỔNG HỢP\n\n";
  csv += formatRevenueCSV(data.revenue || {});
  csv += "\n\n";
  csv += formatInventoryCSV(data.inventory || {});
  csv += "\n\n";
  csv += formatBestSellersCSV(data.bestSellers || {});
  return csv;
}

// 🟢 Helper functions
function getReportTypeName(type) {
  const names = {
    revenue: "Doanh thu",
    inventory: "Tồn kho",
    "best-sellers": "Sản phẩm bán chạy",
    orders: "Đơn hàng",
    categories: "Danh mục",
    comprehensive: "Tổng hợp",
  };
  return names[type] || type;
}

function getTimeRangeName(timeRange) {
  const names = {
    day: "Hôm nay",
    week: "7 ngày gần nhất",
    month: "Tháng này",
    quarter: "Quý này",
    year: "Năm này",
    custom: "Tùy chỉnh",
  };
  return names[timeRange] || timeRange;
}

function getFormatName(format) {
  const names = {
    excel: "Excel (.xlsx)",
    pdf: "PDF (.pdf)",
    word: "Word (.docx)",
    csv: "CSV (.csv)",
    json: "JSON (.json)",
  };
  return names[format] || format.toUpperCase();
}

// 🟢 Xuất báo cáo PDF (sử dụng print)
function exportToPDF() {
  window.print();
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
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div
              class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center"
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            Thống kê & Phân tích
          </h1>
          <p class="text-gray-600 mt-1">
            Báo cáo chi tiết về hoạt động kinh doanh và tồn kho
          </p>
        </div>

        <div class="flex gap-3">
          <!-- Time Range Selector -->
          <div class="flex bg-gray-100 rounded-xl p-1">
            <button
              v-for="range in [
                { key: 'week', label: '7 ngày' },
                { key: 'month', label: '1 tháng' },
                { key: 'quarter', label: '3 tháng' },
                { key: 'year', label: '1 năm' },
              ]"
              :key="range.key"
              @click="changeTimeRange(range.key)"
              :class="{
                'bg-white shadow-sm text-gray-900': timeRange === range.key,
                'text-gray-600 hover:text-gray-900': timeRange !== range.key,
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
            @click="openExportModal"
            class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-sm"
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
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4">
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

      <!-- Loading State -->
      <div
        v-if="loading"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div
          v-for="n in 8"
          :key="n"
          class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse"
        >
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
          <h2 class="text-xl font-semibold text-gray-900 mb-4">
            📊 Thống kê tổng quan
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Tổng doanh thu -->
            <div
              class="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-sm border border-blue-100 hover:shadow-md transition-all duration-300"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-blue-700">
                    Tổng doanh thu
                  </p>
                  <p class="text-3xl font-bold text-blue-900 mt-2">
                    {{ formatCurrency(overviewStats.totalRevenue) }}
                  </p>
                  <p class="text-sm text-blue-600 mt-1">
                    +{{ formatPercent(overviewStats.growthRate) }} so với kỳ
                    trước
                  </p>
                </div>
                <div
                  class="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center"
                >
                  <svg
                    class="w-6 h-6 text-blue-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Tổng đơn hàng -->
            <div
              class="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl shadow-sm border border-green-100 hover:shadow-md transition-all duration-300"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-green-700">
                    Tổng đơn hàng
                  </p>
                  <p class="text-3xl font-bold text-green-900 mt-2">
                    {{ overviewStats.totalOrders.toLocaleString() }}
                  </p>
                  <p class="text-sm text-green-600 mt-1">
                    Trung bình:
                    {{ formatCurrency(overviewStats.avgOrderValue) }}
                  </p>
                </div>
                <div
                  class="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center"
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
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Khách hàng -->
            <div
              class="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl shadow-sm border border-purple-100 hover:shadow-md transition-all duration-300"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-purple-700">Khách hàng</p>
                  <p class="text-3xl font-bold text-purple-900 mt-2">
                    {{ overviewStats.totalCustomers.toLocaleString() }}
                  </p>
                  <p class="text-sm text-purple-600 mt-1">
                    Tỷ lệ chuyển đổi:
                    {{ formatPercent(overviewStats.conversionRate) }}
                  </p>
                </div>
                <div
                  class="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center"
                >
                  <svg
                    class="w-6 h-6 text-purple-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Sản phẩm -->
            <div
              class="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl shadow-sm border border-yellow-100 hover:shadow-md transition-all duration-300"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-yellow-700">Sản phẩm</p>
                  <p class="text-3xl font-bold text-yellow-900 mt-2">
                    {{ overviewStats.totalProducts.toLocaleString() }}
                  </p>
                  <p class="text-sm text-yellow-600 mt-1">
                    Tỷ lệ trả hàng:
                    {{ formatPercent(overviewStats.returnRate) }}
                  </p>
                </div>
                <div
                  class="w-12 h-12 bg-yellow-200 rounded-xl flex items-center justify-center"
                >
                  <svg
                    class="w-6 h-6 text-yellow-700"
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
          </div>
        </div>

        <!-- Thống kê kho hàng -->
        <div>
          <h2 class="text-xl font-semibold text-gray-900 mb-4">
            📦 Thống kê kho hàng
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Tổng giá trị kho -->
            <div
              class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">
                    Tổng giá trị kho
                  </p>
                  <p class="text-2xl font-bold text-gray-900 mt-2">
                    {{ formatCurrency(inventoryStats.totalValue) }}
                  </p>
                  <p class="text-sm text-gray-500 mt-1">
                    Giá TB: {{ formatCurrency(inventoryStats.avgPrice) }}
                  </p>
                </div>
                <div
                  class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center"
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Còn hàng -->
            <div
              class="bg-green-50 p-6 rounded-2xl shadow-sm border border-green-100 hover:shadow-md transition-all duration-300"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-green-700">Còn hàng</p>
                  <p class="text-2xl font-bold text-green-900 mt-2">
                    {{ inventoryStats.inStock }}
                  </p>
                  <p class="text-sm text-green-600 mt-1">Tình trạng tốt</p>
                </div>
                <div
                  class="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center"
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

            <!-- Sắp hết -->
            <div
              class="bg-yellow-50 p-6 rounded-2xl shadow-sm border border-yellow-100 hover:shadow-md transition-all duration-300"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-yellow-700">
                    Sắp hết hàng
                  </p>
                  <p class="text-2xl font-bold text-yellow-900 mt-2">
                    {{ inventoryStats.lowStock }}
                  </p>
                  <p class="text-sm text-yellow-600 mt-1">Cần nhập thêm</p>
                </div>
                <div
                  class="w-12 h-12 bg-yellow-200 rounded-xl flex items-center justify-center"
                >
                  <svg
                    class="w-6 h-6 text-yellow-700"
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
                </div>
              </div>
            </div>

            <!-- Hết hàng -->
            <div
              class="bg-red-50 p-6 rounded-2xl shadow-sm border border-red-100 hover:shadow-md transition-all duration-300"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-red-700">Hết hàng</p>
                  <p class="text-2xl font-bold text-red-900 mt-2">
                    {{ inventoryStats.outOfStock }}
                  </p>
                  <p class="text-sm text-red-600 mt-1">Cần nhập ngay</p>
                </div>
                <div
                  class="w-12 h-12 bg-red-200 rounded-xl flex items-center justify-center"
                >
                  <svg
                    class="w-6 h-6 text-red-700"
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
              </div>
            </div>
          </div>
        </div>

        <!-- Biểu đồ thống kê sản phẩm theo danh mục -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">
              📊 Thống kê sản phẩm theo danh mục
            </h3>
            <div class="text-sm text-gray-500">
              Tổng: {{ inventoryStats.categoryStats.reduce((sum, cat) => sum + cat.totalProducts, 0) }} sản phẩm
            </div>
          </div>
          
          <div v-if="loading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          
          <div v-else class="space-y-4">
            <div
              v-for="(category, index) in inventoryStats.categoryStats"
              :key="index"
              class="relative"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                  <div 
                    class="w-3 h-3 rounded-full"
                    :style="{ backgroundColor: getCategoryColor(index) }"
                  ></div>
                  <span class="font-medium text-gray-900">{{ category.name }}</span>
                </div>
                <div class="flex items-center gap-4">
                  <span class="text-sm text-gray-600">
                    {{ category.totalProducts }} sản phẩm
                  </span>
                  <span class="font-bold text-blue-600 min-w-[80px] text-right">
                    {{ formatCurrency(category.totalValue) }}
                  </span>
                </div>
              </div>
              
              <!-- Progress bar -->
              <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  class="h-2.5 rounded-full transition-all duration-500"
                  :style="{
                    width: `${Math.min(100, (category.totalProducts / Math.max(1, ...inventoryStats.categoryStats.map(c => c.totalProducts))) * 100)}%`,
                    backgroundColor: getCategoryColor(index)
                  }"
                ></div>
              </div>
              
              <!-- Chi tiết trạng thái tồn kho -->
              <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span class="flex items-center gap-1">
                  <span class="text-green-600">●</span> Còn hàng: {{ category.inStock }}
                </span>
                <span class="flex items-center gap-1">
                  <span class="text-orange-600">●</span> Sắp hết: {{ category.lowStock }}
                </span>
                <span class="flex items-center gap-1">
                  <span class="text-red-600">●</span> Hết hàng: {{ category.outOfStock }}
                </span>
              </div>
            </div>
            
            <div v-if="!inventoryStats.categoryStats?.length" class="text-center py-8 text-gray-500">
              Chưa có dữ liệu danh mục
            </div>
          </div>
        </div>

        <!-- Biểu đồ và phân tích -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Doanh số theo ngày -->
          <div
            class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
          >
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              📈 Doanh số 7 ngày gần nhất
            </h3>
            <div class="space-y-3">
              <div
                v-for="day in salesStats.dailySales"
                :key="day.date"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div>
                  <p class="font-medium text-gray-900">
                    {{ formatDate(day.date) }}
                  </p>
                  <p class="text-sm text-gray-600">{{ day.orders }} đơn hàng</p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-green-600">
                    {{ formatCurrency(day.revenue) }}
                  </p>
                  <div class="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      class="bg-green-600 h-2 rounded-full"
                      :style="{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            (day.revenue /
                              Math.max(
                                1,
                                ...salesStats.dailySales.map(
                                  (d) => Number(d?.revenue ?? 0) || 0
                                )
                              )) *
                              100
                          )
                        )}%`,
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sản phẩm bán chạy -->
          <div
            class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
          >
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              🔥 Top sản phẩm bán chạy
            </h3>
            <div class="space-y-3">
              <div
                v-for="(product, index) in salesStats.topSellingProducts"
                :key="product.id"
                class="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
              >
                <div
                  class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center font-bold text-blue-700"
                >
                  {{ index + 1 }}
                </div>
                <div class="flex-1">
                  <p class="font-medium text-gray-900">{{ product.name }}</p>
                  <p class="text-sm text-gray-600">
                    Đã bán: {{ product.quantity }} sản phẩm
                  </p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-green-600">
                    {{ formatCurrency(product.revenue) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Thống kê theo danh mục và trạng thái đơn hàng -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Doanh số theo danh mục -->
          <div
            class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
          >
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              🏷️ Doanh số theo danh mục
            </h3>
            <div class="space-y-3">
              <div
                v-for="category in salesStats.salesByCategory.slice(0, 5)"
                :key="category.name"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div>
                  <p class="font-medium text-gray-900">{{ category.name }}</p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-blue-600">
                    {{ formatCurrency(category.value) }}
                  </p>
                  <div class="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      class="bg-blue-600 h-2 rounded-full"
                      :style="{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            (category.value /
                              Math.max(
                                1,
                                ...salesStats.salesByCategory.map(
                                  (c) => Number(c?.value ?? 0) || 0
                                )
                              )) *
                              100
                          )
                        )}%`,
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Trạng thái đơn hàng -->
          <div
            class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
          >
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              📋 Trạng thái đơn hàng
            </h3>
            <div class="space-y-3">
              <div
                class="flex items-center justify-between p-3 bg-blue-50 rounded-xl"
              >
                <span class="text-blue-700 font-medium">Chờ xử lý</span>
                <span class="font-bold text-blue-900">{{
                  salesStats.orderStatusStats.pending
                }}</span>
              </div>
              <div
                class="flex items-center justify-between p-3 bg-yellow-50 rounded-xl"
              >
                <span class="text-yellow-700 font-medium">Đang xử lý</span>
                <span class="font-bold text-yellow-900">{{
                  salesStats.orderStatusStats.processing
                }}</span>
              </div>
              <div
                class="flex items-center justify-between p-3 bg-purple-50 rounded-xl"
              >
                <span class="text-purple-700 font-medium">Đang giao</span>
                <span class="font-bold text-purple-900">{{
                  salesStats.orderStatusStats.shipped
                }}</span>
              </div>
              <div
                class="flex items-center justify-between p-3 bg-green-50 rounded-xl"
              >
                <span class="text-green-700 font-medium">Đã giao</span>
                <span class="font-bold text-green-900">{{
                  salesStats.orderStatusStats.delivered
                }}</span>
              </div>
              <div
                class="flex items-center justify-between p-3 bg-red-50 rounded-xl"
              >
                <span class="text-red-700 font-medium">Đã hủy</span>
                <span class="font-bold text-red-900">{{
                  salesStats.orderStatusStats.cancelled
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Thống kê kho hàng theo danh mục -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            📊 Phân tích kho hàng theo danh mục
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="category in inventoryStats.categoryStats.slice(0, 6)"
              :key="category.name"
              class="p-4 bg-gray-50 rounded-xl"
            >
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
                  <span class="font-medium text-green-600">{{
                    formatCurrency(category.totalValue)
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Xuất Báo Cáo -->
    <Teleport to="body">
      <div
        v-if="showExportModal"
        class="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="closeExportModal"
      >
        <div
          class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          @click.stop
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between p-6 border-b border-gray-200"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center"
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900">Xuất báo cáo</h3>
                <p class="text-sm text-gray-600">
                  Chọn loại báo cáo và thời gian xuất
                </p>
              </div>
            </div>
            <button
              @click="closeExportModal"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-6">
            <!-- Loại báo cáo -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-3">
                Loại báo cáo
              </label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  v-for="type in [
                    {
                      value: 'revenue',
                      label: '💰 Doanh thu',
                      desc: 'Thống kê doanh thu chi tiết',
                    },
                    {
                      value: 'inventory',
                      label: '📦 Tồn kho',
                      desc: 'Báo cáo tồn kho sản phẩm',
                    },
                    {
                      value: 'best-sellers',
                      label: '🔥 Bán chạy',
                      desc: 'Top sản phẩm bán chạy',
                    },
                    {
                      value: 'orders',
                      label: '📋 Đơn hàng',
                      desc: 'Thống kê đơn hàng',
                    },
                    {
                      value: 'categories',
                      label: '🏷️ Danh mục',
                      desc: 'Phân tích theo danh mục',
                    },
                    {
                      value: 'comprehensive',
                      label: '📊 Tổng hợp',
                      desc: 'Báo cáo đầy đủ tất cả',
                    },
                  ]"
                  :key="type.value"
                  @click="exportConfig.type = type.value"
                  :class="{
                    'bg-green-50 border-green-500 ring-2 ring-green-200':
                      exportConfig.type === type.value,
                    'bg-white border-gray-200 hover:border-green-300':
                      exportConfig.type !== type.value,
                  }"
                  class="p-4 border-2 rounded-xl text-left transition-all"
                >
                  <div class="font-semibold text-gray-900">
                    {{ type.label }}
                  </div>
                  <div class="text-xs text-gray-600 mt-1">{{ type.desc }}</div>
                </button>
              </div>
            </div>

            <!-- Thời gian -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-3">
                Khoảng thời gian
              </label>
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="range in [
                    { value: 'day', label: '📅 Hôm nay' },
                    { value: 'week', label: '📆 7 ngày' },
                    { value: 'month', label: '📊 Tháng này' },
                    { value: 'quarter', label: '📈 Quý này' },
                    { value: 'year', label: '🗓️ Năm này' },
                    { value: 'custom', label: '⚙️ Tùy chỉnh' },
                  ]"
                  :key="range.value"
                  @click="exportConfig.timeRange = range.value"
                  :class="{
                    'bg-blue-50 border-blue-500 ring-2 ring-blue-200':
                      exportConfig.timeRange === range.value,
                    'bg-white border-gray-200 hover:border-blue-300':
                      exportConfig.timeRange !== range.value,
                  }"
                  class="p-3 border-2 rounded-xl text-sm font-medium transition-all"
                >
                  {{ range.label }}
                </button>
              </div>
            </div>

            <!-- Custom Date Range -->
            <div
              v-if="exportConfig.timeRange === 'custom'"
              class="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200"
            >
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Từ ngày
                </label>
                <input
                  v-model="exportConfig.customStartDate"
                  type="date"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Đến ngày
                </label>
                <input
                  v-model="exportConfig.customEndDate"
                  type="date"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <!-- Định dạng file -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-3">
                Định dạng xuất
              </label>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <button
                  v-for="format in [
                    {
                      value: 'excel',
                      label: '📊 Excel',
                      desc: 'File .xlsx',
                      color: 'green',
                    },
                    {
                      value: 'pdf',
                      label: '📕 PDF',
                      desc: 'File .pdf',
                      color: 'red',
                    },
                    {
                      value: 'word',
                      label: '📘 Word',
                      desc: 'File .docx',
                      color: 'blue',
                    },
                    {
                      value: 'csv',
                      label: '📄 CSV',
                      desc: 'Văn bản',
                      color: 'gray',
                    },
                    {
                      value: 'json',
                      label: '📋 JSON',
                      desc: 'Dữ liệu thô',
                      color: 'purple',
                    },
                  ]"
                  :key="format.value"
                  @click="exportConfig.format = format.value"
                  :class="{
                    'bg-green-50 border-green-500 ring-2 ring-green-200':
                      exportConfig.format === format.value &&
                      format.color === 'green',
                    'bg-red-50 border-red-500 ring-2 ring-red-200':
                      exportConfig.format === format.value &&
                      format.color === 'red',
                    'bg-blue-50 border-blue-500 ring-2 ring-blue-200':
                      exportConfig.format === format.value &&
                      format.color === 'blue',
                    'bg-gray-50 border-gray-500 ring-2 ring-gray-200':
                      exportConfig.format === format.value &&
                      format.color === 'gray',
                    'bg-purple-50 border-purple-500 ring-2 ring-purple-200':
                      exportConfig.format === format.value &&
                      format.color === 'purple',
                    'bg-white border-gray-200 hover:border-green-300':
                      exportConfig.format !== format.value &&
                      format.color === 'green',
                    'bg-white border-gray-200 hover:border-red-300':
                      exportConfig.format !== format.value &&
                      format.color === 'red',
                    'bg-white border-gray-200 hover:border-blue-300':
                      exportConfig.format !== format.value &&
                      format.color === 'blue',
                    'bg-white border-gray-200 hover:border-gray-300':
                      exportConfig.format !== format.value &&
                      format.color === 'gray',
                    'bg-white border-gray-200 hover:border-purple-300':
                      exportConfig.format !== format.value &&
                      format.color === 'purple',
                  }"
                  class="p-3 border-2 rounded-xl text-left transition-all"
                >
                  <div class="font-semibold text-gray-900 text-sm">
                    {{ format.label }}
                  </div>
                  <div class="text-xs text-gray-600 mt-1">
                    {{ format.desc }}
                  </div>
                </button>
              </div>
            </div>

            <!-- Thông tin tóm tắt -->
            <div
              class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200"
            >
              <h4
                class="font-semibold text-gray-900 mb-2 flex items-center gap-2"
              >
                <svg
                  class="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Sẽ xuất báo cáo
              </h4>
              <div class="space-y-1 text-sm text-gray-700">
                <p>
                  <span class="font-medium">Loại:</span>
                  {{ getReportTypeName(exportConfig.type) }}
                </p>
                <p>
                  <span class="font-medium">Thời gian:</span>
                  {{ getTimeRangeName(exportConfig.timeRange) }}
                </p>
                <p>
                  <span class="font-medium">Định dạng:</span>
                  {{ getFormatName(exportConfig.format) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl"
          >
            <button
              @click="closeExportModal"
              :disabled="exporting"
              class="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
            >
              Hủy
            </button>
            <button
              @click="exportReport"
              :disabled="exporting"
              class="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 font-medium flex items-center gap-2 shadow-sm"
            >
              <svg
                v-if="exporting"
                class="animate-spin w-4 h-4"
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
              <svg
                v-else
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
              {{ exporting ? "Đang xuất..." : "Xuất báo cáo" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
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
