<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const chartContainer = ref(null)
const animationProgress = ref(0)

onMounted(() => {
  if (!props.loading) {
    // Animate chart on mount
    const animate = () => {
      if (animationProgress.value < 100) {
        animationProgress.value += 2
        requestAnimationFrame(animate)
      }
    }
    setTimeout(animate, 500)
  }
})

const maxRevenue = computed(() => {
  if (!props.data.length) return 0
  return Math.max(...props.data.map(item => item.revenue))
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    notation: 'compact'
  }).format(amount)
}
</script>

<template>
  <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-3">
        <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center text-white text-xl">
          📈
        </div>
        <div>
          <h3 class="text-xl font-bold text-gray-800 dark:text-white">Doanh thu theo tháng</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">Biểu đồ doanh thu 7 tháng gần đây</p>
        </div>
      </div>
      
      <div class="flex space-x-2">
        <button class="px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full">
          7 tháng
        </button>
        <button class="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
          12 tháng
        </button>
      </div>
    </div>

    <!-- Chart Area -->
    <div ref="chartContainer" class="relative h-64">
      <!-- Loading State -->
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
        <div class="flex space-x-2">
          <div class="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          <div class="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
      </div>

      <!-- Chart Content -->
      <div v-else class="h-full flex items-end justify-between space-x-2 px-4">
        <div 
          v-for="(item, index) in data" 
          :key="index"
          class="flex-1 flex flex-col items-center group cursor-pointer"
        >
          <!-- Bar -->
          <div class="w-full max-w-12 bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden mb-3 relative">
            <div 
              :class="`bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all duration-1000 ease-out group-hover:from-blue-600 group-hover:to-cyan-500`"
              :style="`height: ${(item.revenue / maxRevenue) * 200 * (animationProgress / 100)}px`"
            ></div>
            
            <!-- Tooltip -->
            <div class="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {{ formatCurrency(item.revenue) }}
            </div>
          </div>
          
          <!-- Month Label -->
          <span class="text-xs font-medium text-gray-600 dark:text-gray-400">
            {{ item.month }}
          </span>
        </div>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="mt-6 grid grid-cols-2 gap-4">
      <div class="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
        <p class="text-xs text-gray-500 dark:text-gray-400">Trung bình</p>
        <p class="text-lg font-bold text-gray-800 dark:text-white">
          {{ loading ? '---' : formatCurrency(data.reduce((sum, item) => sum + item.revenue, 0) / data.length) }}
        </p>
      </div>
      <div class="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
        <p class="text-xs text-gray-500 dark:text-gray-400">Cao nhất</p>
        <p class="text-lg font-bold text-gray-800 dark:text-white">
          {{ loading ? '---' : formatCurrency(maxRevenue) }}
        </p>
      </div>
    </div>
  </div>
</template>