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

const animationProgress = ref(0)

onMounted(() => {
  if (!props.loading) {
    const animate = () => {
      if (animationProgress.value < 100) {
        animationProgress.value += 2
        requestAnimationFrame(animate)
      }
    }
    setTimeout(animate, 800)
  }
})

const totalOrders = computed(() => {
  return props.data.reduce((sum, item) => sum + item.count, 0)
})

const getPercentage = (count) => {
  if (totalOrders.value === 0) return 0
  return (count / totalOrders.value) * 100
}

const getCircumference = (radius) => {
  return 2 * Math.PI * radius
}

const getStrokeDasharray = (percentage, radius) => {
  const circumference = getCircumference(radius)
  const progress = (percentage * animationProgress.value) / 100
  return `${circumference * (progress / 100)} ${circumference}`
}
</script>

<template>
  <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6">
    <!-- Header -->
    <div class="flex items-center space-x-3 mb-6">
      <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-xl">
        📊
      </div>
      <div>
        <h3 class="text-xl font-bold text-gray-800 dark:text-white">Trạng thái đơn hàng</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">Phân bố theo trạng thái</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
    </div>

    <!-- Chart Content -->
    <div v-else class="relative">
      <!-- Donut Chart -->
      <div class="flex justify-center mb-6">
        <div class="relative">
          <svg width="200" height="200" class="transform -rotate-90">
            <!-- Background circle -->
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#e5e7eb"
              stroke-width="20"
              class="dark:stroke-gray-600"
            />
            
            <!-- Data segments -->
            <template v-for="(item, index) in data" :key="index">
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                :stroke="item.color"
                stroke-width="20"
                stroke-linecap="round"
                :stroke-dasharray="getStrokeDasharray(getPercentage(item.count), 80)"
                :stroke-dashoffset="getCircumference(80) - getCircumference(80) * data.slice(0, index).reduce((sum, prev) => sum + getPercentage(prev.count), 0) / 100"
                class="transition-all duration-1000 ease-out"
                style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
              />
            </template>
          </svg>
          
          <!-- Center content -->
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center">
              <p class="text-2xl font-bold text-gray-800 dark:text-white">
                {{ totalOrders.toLocaleString() }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Tổng đơn hàng</p>
            </div>
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
              :style="`background-color: ${item.color}`"
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