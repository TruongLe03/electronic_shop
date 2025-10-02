<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import ModernStatsCard from '@/components/admin/ModernStatsCard.vue'
import RevenueChart from '@/components/admin/RevenueChart.vue'
import OrdersChart from '@/components/admin/OrdersChart.vue'
import ActivityFeed from '@/components/admin/ActivityFeed.vue'
import QuickActions from '@/components/admin/QuickActions.vue'

const router = useRouter()
const authStore = useAuthStore()

// Dashboard stats
const stats = ref({
  totalProducts: 0,
  totalUsers: 0,
  totalOrders: 0,
  totalRevenue: 0,
  loading: true,
  trends: {
    products: '+12%',
    users: '+8%',
    orders: '+23%',
    revenue: '+15%'
  }
})

const recentOrders = ref([])
const recentUsers = ref([])
const recentActivities = ref([])
const salesData = ref([])
const ordersData = ref([])

// Check admin permissions
onMounted(async () => {
  if (!authStore.isAuthenticated || authStore.user?.role !== 'admin') {
    router.push('/login')
    return
  }
  
  await loadDashboardData()
})

const loadDashboardData = async () => {
  try {
    stats.value.loading = true
    
    // Mock data - replace with real API calls
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    stats.value = {
      totalProducts: 156,
      totalUsers: 2843,
      totalOrders: 1247,
      totalRevenue: 58420000,
      loading: false,
      trends: {
        products: '+12%',
        users: '+8%',
        orders: '+23%',
        revenue: '+15%'
      }
    }
    
    recentOrders.value = [
      { id: '#12345', customer: 'Nguyễn Văn A', amount: 2340000, status: 'completed', date: '2025-09-06', avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=random' },
      { id: '#12346', customer: 'Trần Thị B', amount: 1560000, status: 'pending', date: '2025-09-06', avatar: 'https://ui-avatars.com/api/?name=Tran+Thi+B&background=random' },
      { id: '#12347', customer: 'Lê Văn C', amount: 890000, status: 'processing', date: '2025-09-05', avatar: 'https://ui-avatars.com/api/?name=Le+Van+C&background=random' },
      { id: '#12348', customer: 'Phạm Thị D', amount: 3200000, status: 'completed', date: '2025-09-05', avatar: 'https://ui-avatars.com/api/?name=Pham+Thi+D&background=random' },
      { id: '#12349', customer: 'Hoàng Văn E', amount: 670000, status: 'cancelled', date: '2025-09-04', avatar: 'https://ui-avatars.com/api/?name=Hoang+Van+E&background=random' }
    ]
    
    recentUsers.value = [
      { id: 1, name: 'Nguyễn Minh F', email: 'minht@email.com', joinDate: '2025-09-06', status: 'active', avatar: 'https://ui-avatars.com/api/?name=Nguyen+Minh+F&background=random' },
      { id: 2, name: 'Trần Thị G', email: 'trang@email.com', joinDate: '2025-09-06', status: 'active', avatar: 'https://ui-avatars.com/api/?name=Tran+Thi+G&background=random' },
      { id: 3, name: 'Lê Văn H', email: 'leh@email.com', joinDate: '2025-09-05', status: 'inactive', avatar: 'https://ui-avatars.com/api/?name=Le+Van+H&background=random' },
      { id: 4, name: 'Phạm Thị I', email: 'phami@email.com', joinDate: '2025-09-05', status: 'active', avatar: 'https://ui-avatars.com/api/?name=Pham+Thi+I&background=random' }
    ]

    recentActivities.value = [
      { id: 1, type: 'order', message: 'Đơn hàng #12345 đã được xác nhận', time: '2 phút trước', icon: '🛒' },
      { id: 2, type: 'user', message: 'Người dùng mới Trần Thị G đã đăng ký', time: '5 phút trước', icon: '👤' },
      { id: 3, type: 'product', message: 'Sản phẩm iPhone 15 đã được cập nhật', time: '10 phút trước', icon: '📱' },
      { id: 4, type: 'payment', message: 'Thanh toán đơn hàng #12344 thành công', time: '15 phút trước', icon: '💳' },
      { id: 5, type: 'inventory', message: 'Cảnh báo: Sản phẩm AirPods sắp hết hàng', time: '20 phút trước', icon: '⚠️' }
    ]

    // Mock chart data
    salesData.value = [
      { month: 'T1', revenue: 45000000, orders: 1200 },
      { month: 'T2', revenue: 52000000, orders: 1350 },
      { month: 'T3', revenue: 48000000, orders: 1180 },
      { month: 'T4', revenue: 61000000, orders: 1580 },
      { month: 'T5', revenue: 55000000, orders: 1420 },
      { month: 'T6', revenue: 67000000, orders: 1650 },
      { month: 'T7', revenue: 58000000, orders: 1500 }
    ]

    ordersData.value = [
      { status: 'Hoàn thành', count: 856, color: '#10b981' },
      { status: 'Đang xử lý', count: 234, color: '#f59e0b' },
      { status: 'Chờ xác nhận', count: 127, color: '#3b82f6' },
      { status: 'Đã hủy', count: 30, color: '#ef4444' }
    ]
  } catch (error) {
    console.error('Error loading dashboard data:', error)
    stats.value.loading = false
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

const getStatusColor = (status) => {
  const colors = {
    completed: 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
    pending: 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
    processing: 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
    cancelled: 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
    active: 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
    inactive: 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30'
  }
  return colors[status] || 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30'
}

const getStatusText = (status) => {
  const statusText = {
    completed: 'Hoàn thành',
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    cancelled: 'Đã hủy',
    active: 'Hoạt động',
    inactive: 'Không hoạt động'
  }
  return statusText[status] || status
}
</script>

<template>
  <AdminLayout>
    <div class="space-y-8">
      <!-- Stats Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModernStatsCard 
          title="Tổng sản phẩm"
          :value="stats.totalProducts"
          icon="fas fa-box"
          gradient="from-blue-500 to-cyan-500"
          :trend="stats.trends.products"
          :loading="stats.loading"
        />
        
        <ModernStatsCard 
          title="Tổng người dùng"
          :value="stats.totalUsers"
          icon="fas fa-users"
          gradient="from-green-500 to-emerald-500"
          :trend="stats.trends.users"
          :loading="stats.loading"
        />
        
        <ModernStatsCard 
          title="Tổng đơn hàng"
          :value="stats.totalOrders"
          icon="fas fa-shopping-cart"
          gradient="from-purple-500 to-pink-500"
          :trend="stats.trends.orders"
          :loading="stats.loading"
        />
        
        <ModernStatsCard 
          title="Doanh thu"
          :value="stats.totalRevenue"
          icon="fas fa-dollar-sign"
          gradient="from-orange-500 to-red-500"
          :trend="stats.trends.revenue"
          :loading="stats.loading"
          :is-currency="true"
        />
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Revenue Chart -->
        <div class="lg:col-span-2">
          <RevenueChart :data="salesData" :loading="stats.loading" />
        </div>
        
        <!-- Orders Chart -->
        <div class="lg:col-span-1">
          <OrdersChart :data="ordersData" :loading="stats.loading" />
        </div>
      </div>

      <!-- Quick Actions -->
      <QuickActions />

      <!-- Activity and Data Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Activity Feed -->
        <div class="lg:col-span-1">
          <ActivityFeed :activities="recentActivities" :loading="stats.loading" />
        </div>

        <!-- Recent Orders -->
        <div class="lg:col-span-2">
          <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl">
                  🛒
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-800 dark:text-white">Đơn hàng gần đây</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Danh sách đơn hàng mới nhất</p>
                </div>
              </div>
              <router-link 
                to="/admin/orders"
                class="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm"
              >
                Xem tất cả
              </router-link>
            </div>

            <div class="overflow-hidden">
              <div class="space-y-3">
                <div v-for="order in recentOrders.slice(0, 5)" :key="order.id" 
                     class="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer group">
                  <div class="flex items-center space-x-4">
                    <img 
                      class="w-12 h-12 rounded-full ring-2 ring-blue-500/20"
                      :src="order.avatar"
                      :alt="order.customer"
                    >
                    <div>
                      <p class="font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {{ order.customer }}
                      </p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">{{ order.id }}</p>
                    </div>
                  </div>
                  
                  <div class="text-right">
                    <p class="font-semibold text-gray-800 dark:text-white">
                      {{ formatCurrency(order.amount) }}
                    </p>
                    <span :class="`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`">
                      {{ getStatusText(order.status) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>


