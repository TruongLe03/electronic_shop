<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import ModernStatsCard from '@/components/admin/ModernStatsCard.vue'

const router = useRouter()
const authStore = useAuthStore()

const orders = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedStatus = ref('all')
const selectedDateRange = ref('all')

const stats = ref({
  totalOrders: 0,
  pendingOrders: 0,
  completedOrders: 0,
  totalRevenue: 0
})

const statusOptions = [
  { id: 'all', name: 'Tất cả', color: 'gray' },
  { id: 'pending', name: 'Chờ xác nhận', color: 'yellow' },
  { id: 'confirmed', name: 'Đã xác nhận', color: 'blue' },
  { id: 'processing', name: 'Đang xử lý', color: 'indigo' },
  { id: 'shipping', name: 'Đang giao', color: 'purple' },
  { id: 'completed', name: 'Hoàn thành', color: 'green' },
  { id: 'cancelled', name: 'Đã hủy', color: 'red' }
]

onMounted(async () => {
  if (!authStore.isAuthenticated || authStore.user?.role !== 'admin') {
    router.push('/login')
    return
  }
  
  await loadOrders()
})

const loadOrders = async () => {
  try {
    loading.value = true
    
    // Mock data - replace with real API calls
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    orders.value = [
      {
        id: '#12345',
        customerName: 'Nguyễn Văn A',
        customerEmail: 'nguyen.va@email.com',
        customerAvatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=random',
        total: 2340000,
        status: 'completed',
        paymentMethod: 'Thẻ tín dụng',
        createdAt: '2025-10-01T10:30:00Z',
        items: [
          { name: 'iPhone 15 Pro', quantity: 1, price: 2340000 }
        ]
      },
      {
        id: '#12346',
        customerName: 'Trần Thị B',
        customerEmail: 'tran.tb@email.com',
        customerAvatar: 'https://ui-avatars.com/api/?name=Tran+Thi+B&background=random',
        total: 1560000,
        status: 'pending',
        paymentMethod: 'COD',
        createdAt: '2025-10-01T14:15:00Z',
        items: [
          { name: 'Samsung Galaxy A54', quantity: 1, price: 1560000 }
        ]
      },
      {
        id: '#12347',
        customerName: 'Lê Văn C',
        customerEmail: 'le.vc@email.com',
        customerAvatar: 'https://ui-avatars.com/api/?name=Le+Van+C&background=random',
        total: 890000,
        status: 'processing',
        paymentMethod: 'VNPay',
        createdAt: '2025-09-30T16:45:00Z',
        items: [
          { name: 'AirPods 3rd Gen', quantity: 1, price: 890000 }
        ]
      },
      {
        id: '#12348',
        customerName: 'Phạm Thị D',
        customerEmail: 'pham.td@email.com',
        customerAvatar: 'https://ui-avatars.com/api/?name=Pham+Thi+D&background=random',
        total: 3200000,
        status: 'shipping',
        paymentMethod: 'Chuyển khoản',
        createdAt: '2025-09-30T09:20:00Z',
        items: [
          { name: 'MacBook Air M2', quantity: 1, price: 3200000 }
        ]
      },
      {
        id: '#12349',
        customerName: 'Hoàng Văn E',
        customerEmail: 'hoang.ve@email.com',
        customerAvatar: 'https://ui-avatars.com/api/?name=Hoang+Van+E&background=random',
        total: 670000,
        status: 'cancelled',
        paymentMethod: 'COD',
        createdAt: '2025-09-29T11:10:00Z',
        items: [
          { name: 'Apple Watch SE', quantity: 1, price: 670000 }
        ]
      }
    ]
    
    stats.value = {
      totalOrders: orders.value.length,
      pendingOrders: orders.value.filter(o => o.status === 'pending').length,
      completedOrders: orders.value.filter(o => o.status === 'completed').length,
      totalRevenue: orders.value.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total, 0)
    }
    
  } catch (error) {
    console.error('Error loading orders:', error)
  } finally {
    loading.value = false
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusColor = (status) => {
  const colors = {
    pending: 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
    confirmed: 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
    processing: 'text-indigo-700 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30',
    shipping: 'text-purple-700 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
    completed: 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
    cancelled: 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
  }
  return colors[status] || 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30'
}

const getStatusText = (status) => {
  const statusText = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    processing: 'Đang xử lý',
    shipping: 'Đang giao',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy'
  }
  return statusText[status] || status
}

const viewOrderDetail = (order) => {
  router.push(`/admin/orders/${order.id}`)
}

const updateOrderStatus = (order, newStatus) => {
  // Implement status update logic
  order.status = newStatus
  console.log(`Updated order ${order.id} to ${newStatus}`)
}
</script>

<template>
  <AdminLayout>
    <div class="space-y-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModernStatsCard 
          title="Tổng đơn hàng"
          :value="stats.totalOrders"
          icon="🛒"
          gradient="from-blue-500 to-cyan-500"
          :loading="loading"
        />
        
        <ModernStatsCard 
          title="Chờ xử lý"
          :value="stats.pendingOrders"
          icon="⏳"
          gradient="from-yellow-500 to-orange-500"
          :loading="loading"
        />
        
        <ModernStatsCard 
          title="Hoàn thành"
          :value="stats.completedOrders"
          icon="✅"
          gradient="from-green-500 to-emerald-500"
          :loading="loading"
        />
        
        <ModernStatsCard 
          title="Doanh thu"
          :value="stats.totalRevenue"
          icon="💰"
          gradient="from-purple-500 to-pink-500"
          :loading="loading"
          :is-currency="true"
        />
      </div>

      <!-- Orders Table -->
      <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50">
        <!-- Header -->
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white text-xl">
                📋
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-800 dark:text-white">Quản lý đơn hàng</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Danh sách tất cả đơn hàng</p>
              </div>
            </div>
            
            <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <!-- Search -->
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Tìm kiếm đơn hàng..."
                  class="w-full sm:w-64 pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                >
                <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <!-- Status Filter -->
              <select
                v-model="selectedStatus"
                class="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
              >
                <option v-for="status in statusOptions" :key="status.id" :value="status.id">
                  {{ status.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Table Content -->
        <div class="overflow-x-auto">
          <!-- Loading State -->
          <div v-if="loading" class="p-8">
            <div class="animate-pulse space-y-4">
              <div v-for="i in 5" :key="i" class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
                <div class="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div class="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>

          <!-- Orders Table -->
          <table v-else class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Đơn hàng
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Thanh toán
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th class="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr 
                v-for="order in orders" 
                :key="order.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
              >
                <!-- Customer Info -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center space-x-4">
                    <img
                      class="w-12 h-12 rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
                      :src="order.customerAvatar"
                      :alt="order.customerName"
                    >
                    <div>
                      <div class="text-sm font-semibold text-gray-900 dark:text-white">
                        {{ order.customerName }}
                      </div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">
                        {{ order.customerEmail }}
                      </div>
                    </div>
                  </div>
                </td>
                
                <!-- Order Info -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-semibold text-gray-900 dark:text-white">
                    {{ order.id }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ formatDate(order.createdAt) }}
                  </div>
                </td>
                
                <!-- Total Amount -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm font-semibold text-gray-900 dark:text-white">
                    {{ formatCurrency(order.total) }}
                  </span>
                </td>
                
                <!-- Payment Method -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-600 dark:text-gray-300">
                    {{ order.paymentMethod }}
                  </span>
                </td>
                
                <!-- Status -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`">
                    {{ getStatusText(order.status) }}
                  </span>
                </td>
                
                <!-- Actions -->
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      @click="viewOrderDetail(order)"
                      class="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                      title="Xem chi tiết"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    
                    <div class="relative">
                      <select
                        :value="order.status"
                        @change="updateOrderStatus(order, $event.target.value)"
                        class="text-xs px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 appearance-none pr-6"
                      >
                        <option v-for="status in statusOptions.slice(1)" :key="status.id" :value="status.id">
                          {{ status.name }}
                        </option>
                      </select>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Hiển thị <span class="font-semibold">1-{{ orders.length }}</span> của <span class="font-semibold">{{ orders.length }}</span> đơn hàng
            </div>
            
            <div class="flex items-center space-x-2">
              <button class="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors">
                Trước
              </button>
              <button class="px-3 py-1 text-sm bg-orange-500 text-white rounded-lg">
                1
              </button>
              <button class="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors">
                Sau
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
