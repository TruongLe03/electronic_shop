<script setup>
import AdminLayout from "@components/admin/AdminLayout.vue";
// Placeholder data, replace with real API later
const stats = [
  {
    label: "Tổng Doanh Thu",
    value: "₫ 120,000,000",
    icon: "fas fa-dollar-sign",
    color: "from-purple-400 to-purple-600",
  },
  {
    label: "Tổng Đơn Hàng",
    value: "1,250",
    icon: "fas fa-shopping-cart",
    color: "from-orange-400 to-orange-600",
  },
  {
    label: "Tổng Người Dùng",
    value: "3,400",
    icon: "fas fa-users",
    color: "from-blue-400 to-blue-600",
  },
  {
    label: "Tổng Sản Phẩm",
    value: "320",
    icon: "fas fa-box",
    color: "from-emerald-400 to-emerald-600",
  },
];
</script>

<template>
  <AdminLayout
    title="Thống kê & Phân tích"
    subtitle="Xem báo cáo tổng quan hệ thống"
    icon="fas fa-chart-bar"
  >
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="group"
      >
        <div
          class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:scale-105"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-1">{{ stat.label }}</p>
              <p class="text-3xl font-bold text-gray-900">{{ stat.value }}</p>
            </div>
            <div
              class="w-16 h-16 bg-gradient-to-r"
              :class="stat.color + ' rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300'"
            >
              <i :class="stat.icon + ' text-white text-2xl'"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart Placeholders -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex flex-col items-center justify-center min-h-[320px]">
        <div class="text-5xl text-indigo-400 mb-4">
          <i class="fas fa-chart-line"></i>
        </div>
        <div class="text-lg font-semibold text-gray-800 mb-2">Biểu đồ doanh thu</div>
        <div class="text-gray-500">(Sắp ra mắt)</div>
      </div>
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex flex-col items-center justify-center min-h-[320px]">
        <div class="text-5xl text-emerald-400 mb-4">
          <i class="fas fa-chart-pie"></i>
        </div>
        <div class="text-lg font-semibold text-gray-800 mb-2">Biểu đồ đơn hàng & sản phẩm</div>
        <div class="text-gray-500">(Sắp ra mắt)</div>
      </div>
    </div>
  </AdminLayout>
</template>