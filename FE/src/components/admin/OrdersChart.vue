<script setup>
import { ref, computed } from "vue";
import { Doughnut } from "vue-chartjs";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const totalOrders = computed(() => {
  return props.data.reduce((sum, item) => sum + item.count, 0);
});

const getPercentage = (count) => {
  if (totalOrders.value === 0) return 0;
  return (count / totalOrders.value) * 100;
};

// Color mapping for order statuses - Vibrant colors
const statusLabelColors = {
  "Chờ thanh toán": "#FF6B9D",
  "Đang chờ thanh toán": "#FFA500",
  "Thanh toán thất bại": "#FF4444",
  "Đã xác nhận": "#4169E1",
  "Đang chuẩn bị hàng": "#9B59B6",
  "Sẵn sàng giao hàng": "#3498DB",
  "Đang giao hàng": "#00BCD4",
  "Đã giao thành công": "#4CAF50",
  "Đã hủy": "#E91E63",
  "Đã trả hàng": "#95A5A6",
};

const getStatusColor = (status) => {
  return statusLabelColors[status] || "#95A5A6";
};

const chartData = computed(() => ({
  labels: props.data.map((item) => item.status),
  datasets: [
    {
      data: props.data.map((item) => item.count),
      backgroundColor: props.data.map((item) => getStatusColor(item.status)),
      borderColor: "#fff",
      borderWidth: 2,
      hoverOffset: 10,
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "rgba(17, 24, 39, 0.9)",
      titleColor: "#fff",
      bodyColor: "#fff",
      padding: 12,
      borderColor: "rgba(255, 255, 255, 0.1)",
      borderWidth: 1,
      callbacks: {
        label: function (context) {
          const label = context.label || "";
          const value = context.parsed || 0;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${label}: ${value} (${percentage}%)`;
        },
      },
    },
  },
  cutout: "65%", // Tạo donut chart với center content
};
</script>

<template>
  <div
    class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6"
  >
    <!-- Header -->
    <div class="flex items-center space-x-3 mb-6">
      <div
        class="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-xl"
      >
        📊
      </div>
      <div>
        <h3 class="text-xl font-bold text-gray-800 dark:text-white">
          Trạng thái đơn hàng
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Phân bố theo trạng thái
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div
        class="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"
      ></div>
    </div>

    <!-- Chart Content -->
    <div v-else class="relative">
      <!-- Pie Chart -->
      <div class="flex justify-center mb-6 relative" style="height: 280px">
        <Doughnut :data="chartData" :options="chartOptions" />
        
        <!-- Center content overlay -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="text-center">
            <p class="text-3xl font-bold text-gray-800 dark:text-white">
              {{ totalOrders }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Đơn hàng</p>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="space-y-3">
        <div
          v-for="(item, index) in data"
          :key="index"
          class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
        >
          <div class="flex items-center space-x-3">
            <div
              class="w-4 h-4 rounded-full shadow-sm group-hover:scale-110 transition-transform"
              :style="`background-color: ${getStatusColor(item.status)}`"
            ></div>
            <span class="font-medium text-gray-800 dark:text-white">
              {{ item.status }}
            </span>
          </div>

          <div class="text-right">
            <span class="font-bold text-gray-800 dark:text-white">
              {{ item.count.toLocaleString() }}
            </span>
            <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">
              ({{ getPercentage(item.count).toFixed(1) }}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
