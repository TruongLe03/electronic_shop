<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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

const maxRevenue = computed(() => {
  if (!props.data || !props.data.length) return 0;
  const values = props.data.map((item) => {
    const v = Number(item?.revenue ?? 0);
    return Number.isFinite(v) ? v : 0;
  });
  const max = Math.max(...values, 0);
  return max > 0 ? max : 1;
});

const avgRevenue = computed(() => {
  if (!props.data || !props.data.length) return 0;
  const sum = props.data.reduce((sum, item) => {
    const v = Number(item?.revenue ?? 0);
    return sum + (Number.isFinite(v) ? v : 0);
  }, 0);
  return props.data.length > 0 ? sum / props.data.length : 0;
});

const formatCurrency = (amount) => {
  const num = Number(amount);
  if (!Number.isFinite(num)) return "0 ₫";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    notation: "compact",
  }).format(num);
};

const chartData = computed(() => ({
  labels: props.data.map((item) => item.month),
  datasets: [
    {
      label: "Doanh thu",
      data: props.data.map((item) => Number(item?.revenue ?? 0)),
      borderColor: "rgb(59, 130, 246)",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: "rgb(59, 130, 246)",
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      pointHoverBackgroundColor: "rgb(37, 99, 235)",
      pointHoverBorderColor: "#fff",
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
      displayColors: false,
      callbacks: {
        label: function (context) {
          return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(context.parsed.y);
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(156, 163, 175, 0.1)",
        drawBorder: false,
      },
      ticks: {
        color: "rgba(107, 114, 128, 0.8)",
        callback: function (value) {
          return new Intl.NumberFormat("vi-VN", {
            notation: "compact",
            compactDisplay: "short",
          }).format(value);
        },
      },
    },
    x: {
      grid: {
        display: false,
        drawBorder: false,
      },
      ticks: {
        color: "rgba(107, 114, 128, 0.8)",
      },
    },
  },
  interaction: {
    intersect: false,
    mode: "index",
  },
};
</script>

<template>
  <div
    class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-3">
        <div
          class="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center text-white text-xl"
        >
          📈
        </div>
        <div>
          <h3 class="text-xl font-bold text-gray-800 dark:text-white">
            Doanh thu theo tháng
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Biểu đồ doanh thu 7 tháng gần đây
          </p>
        </div>
      </div>

      <div class="flex space-x-2">
        <button
          class="px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full"
        >
          7 tháng
        </button>
        <button
          class="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          12 tháng
        </button>
      </div>
    </div>

    <!-- Chart Area -->
    <div class="relative h-64">
      <!-- Loading State -->
      <div
        v-if="loading"
        class="absolute inset-0 flex items-center justify-center"
      >
        <div class="flex space-x-2">
          <div class="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          <div
            class="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
            style="animation-delay: 0.1s"
          ></div>
          <div
            class="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
            style="animation-delay: 0.2s"
          ></div>
        </div>
      </div>

      <!-- Chart Content -->
      <Line v-else :data="chartData" :options="chartOptions" />
    </div>

    <!-- Summary Stats -->
    <div class="mt-6 grid grid-cols-2 gap-4">
      <div class="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
        <p class="text-xs text-gray-500 dark:text-gray-400">Trung bình</p>
        <p class="text-lg font-bold text-gray-800 dark:text-white">
          {{ loading || !data.length ? "---" : formatCurrency(avgRevenue) }}
        </p>
      </div>
      <div class="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
        <p class="text-xs text-gray-500 dark:text-gray-400">Cao nhất</p>
        <p class="text-lg font-bold text-gray-800 dark:text-white">
          {{ loading ? "---" : formatCurrency(maxRevenue) }}
        </p>
      </div>
    </div>
  </div>
</template>
