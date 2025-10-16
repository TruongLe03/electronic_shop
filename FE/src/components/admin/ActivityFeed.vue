<script setup>
const props = defineProps({
  activities: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const getActivityColor = (type) => {
  const colors = {
    order: 'from-blue-500 to-cyan-500',
    user: 'from-green-500 to-emerald-500',
    product: 'from-purple-500 to-pink-500',
    payment: 'from-orange-500 to-red-500',
    inventory: 'from-yellow-500 to-orange-500'
  }
  return colors[type] || 'from-gray-500 to-gray-600'
}

const getActivityBorderColor = (type) => {
  const colors = {
    order: 'border-blue-200 dark:border-blue-800',
    user: 'border-green-200 dark:border-green-800',
    product: 'border-purple-200 dark:border-purple-800',
    payment: 'border-orange-200 dark:border-orange-800',
    inventory: 'border-yellow-200 dark:border-yellow-800'
  }
  return colors[type] || 'border-gray-200 dark:border-gray-700'
}
</script>

<template>
  <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6 h-full">
    <!-- Header -->
    <div class="flex items-center space-x-3 mb-6">
      <div class="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl">
        <i class="fas fa-bell"></i>
      </div>
      <div>
        <h3 class="text-xl font-bold text-gray-800 dark:text-white">Hoạt động gần đây</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">Theo dõi các sự kiện mới</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 5" :key="i" class="animate-pulse">
        <div class="flex items-center space-x-4">
          <div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Activity List -->
    <div v-else class="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
      <div 
        v-for="(activity, index) in activities" 
        :key="activity.id"
        class="group relative"
        :style="`animation-delay: ${index * 100}ms`"
      >
        <!-- Timeline line -->
        <div 
          v-if="index !== activities.length - 1"
          class="absolute left-5 top-12 w-0.5 h-8 bg-gradient-to-b from-gray-200 to-transparent dark:from-gray-600"
        ></div>
        
        <!-- Activity Item -->
        <div :class="`flex items-start space-x-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${getActivityBorderColor(activity.type)} bg-gradient-to-r from-white/50 to-transparent dark:from-gray-800/50 group-hover:scale-[1.02]`">
          <!-- Icon -->
          <div :class="`w-10 h-10 bg-gradient-to-r ${getActivityColor(activity.type)} rounded-full flex items-center justify-center text-white text-lg shadow-lg group-hover:scale-110 transition-transform duration-200`">
            <i v-if="activity.icon && activity.icon.startsWith('fas')" :class="activity.icon"></i>
            <span v-else>{{ activity.icon }}</span>
          </div>
          
          <!-- Content -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {{ activity.message }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ activity.time }}
            </p>
          </div>
          
          <!-- Action Button -->
          <button class="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- View All Button -->
    <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
      <button class="w-full px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2">
        <span>Xem tất cả hoạt động</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #4b5563;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.group {
  animation: slideInUp 0.5s ease-out forwards;
}
</style>