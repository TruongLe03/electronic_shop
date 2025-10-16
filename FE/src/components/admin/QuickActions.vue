<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const quickActions = [
  {
    title: 'Danh mục',
    description: 'Quản lý danh mục sản phẩm',
    icon: 'fas fa-tags',
    gradient: 'from-indigo-500 to-purple-500',
    path: '/admin/categories',
    stats: 'Cập nhật mới'
  },
  {
    title: 'Xử lý đơn hàng',
    description: 'Quản lý đơn hàng mới',
    icon: 'fas fa-clipboard-list',
    gradient: 'from-blue-500 to-cyan-500',
    path: '/admin/orders',
    stats: '23 chờ xử lý'
  },
  {
    title: 'Quản lý người dùng',
    description: 'Xem và quản lý khách hàng',
    icon: 'fas fa-users',
    gradient: 'from-purple-500 to-pink-500',
    path: '/admin/users',
    stats: '156 hoạt động'
  },
  {
    title: 'Xem báo cáo',
    description: 'Thống kê và phân tích',
    icon: 'fas fa-chart-bar',
    gradient: 'from-orange-500 to-red-500',
    path: '/admin/statistics',
    stats: 'Cập nhật 1h trước'
  },
  {
    title: 'Quản lý kho',
    description: 'Kiểm tra tồn kho',
    icon: 'fas fa-warehouse',
    gradient: 'from-teal-500 to-green-500',
    path: '/admin/inventory',
    stats: '5 sắp hết'
  },
  {
    title: 'Cài đặt',
    description: 'Cấu hình hệ thống',
    icon: 'fas fa-cog',
    gradient: 'from-gray-500 to-gray-600',
    path: '/admin/settings',
    stats: 'Cập nhật mới'
  }
]

const handleAction = async (path) => {
  try {
    await router.push(path)
  } catch (error) {
    console.error('Navigation error:', error)
    // Fallback - reload page if dynamic import fails
    if (error.message.includes('Failed to fetch dynamically imported module')) {
      window.location.href = path
    }
  }
}
</script>

<template>
  <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6">
    <!-- Header -->
    <div class="flex items-center space-x-3 mb-6">
      <div class="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center text-white text-xl">
        <i class="fas fa-bolt"></i>
      </div>
      <div>
        <h3 class="text-xl font-bold text-gray-800 dark:text-white">Thao tác nhanh</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">Các chức năng thường dùng</p>
      </div>
    </div>

    <!-- Actions Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="(action, index) in quickActions"
        :key="index"
        @click="handleAction(action.path)"
        class="group relative overflow-hidden cursor-pointer transform transition-all duration-200 hover:scale-105 hover:z-10"
        :style="`animation-delay: ${index * 100}ms`"
      >
        <!-- Background with glassmorphism -->
        <div class="absolute inset-0 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-xl border border-white/30 dark:border-gray-600/30 group-hover:bg-white/80 dark:group-hover:bg-gray-700/80 transition-all duration-200"></div>
        
        <!-- Gradient overlay -->
        <div :class="`absolute inset-0 bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-200`"></div>
        
        <!-- Content -->
        <div class="relative p-4">
          <!-- Icon -->
          <div :class="`w-12 h-12 bg-gradient-to-r ${action.gradient} rounded-xl flex items-center justify-center text-white text-xl mb-3 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-200`">
            <i :class="action.icon"></i>
          </div>
          
          <!-- Text Content -->
          <div class="mb-3">
            <h4 class="font-semibold text-gray-800 dark:text-white group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              {{ action.title }}
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
              {{ action.description }}
            </p>
          </div>
          
          <!-- Stats -->
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600/50 px-2 py-1 rounded-full">
              {{ action.stats }}
            </span>
            
            <!-- Arrow Icon -->
            <div class="w-6 h-6 flex items-center justify-center text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transform group-hover:translate-x-1 transition-all duration-200">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
        
        <!-- Shine effect -->
        <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  opacity: 0;
}
</style>