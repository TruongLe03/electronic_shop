<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@stores/auth.js'
import StatsCard from '@components/admin/StatsCard.vue'
import DataCard from '@components/admin/DataCard.vue'
import QuickAction from '@components/admin/QuickAction.vue'

const router = useRouter()
const authStore = useAuthStore()

// Dashboard stats
const stats = ref({
  totalProducts: 0,
  totalUsers: 0,
  totalOrders: 0,
  totalRevenue: 0,
  loading: true
})

const recentOrders = ref([])
const recentUsers = ref([])

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
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    stats.value = {
      totalProducts: 156,
      totalUsers: 2843,
      totalOrders: 1247,
      totalRevenue: 58420000,
      loading: false
    }
    
    recentOrders.value = [
      { id: '#12345', customer: 'Nguyễn Văn A', amount: 2340000, status: 'completed', date: '2025-09-06' },
      { id: '#12346', customer: 'Trần Thị B', amount: 1560000, status: 'pending', date: '2025-09-06' },
      { id: '#12347', customer: 'Lê Văn C', amount: 890000, status: 'processing', date: '2025-09-05' },
      { id: '#12348', customer: 'Phạm Thị D', amount: 3200000, status: 'completed', date: '2025-09-05' },
      { id: '#12349', customer: 'Hoàng Văn E', amount: 670000, status: 'cancelled', date: '2025-09-04' }
    ]
    
    recentUsers.value = [
      { id: 1, name: 'Nguyễn Minh F', email: 'minht@email.com', joinDate: '2025-09-06', status: 'active' },
      { id: 2, name: 'Trần Thị G', email: 'trang@email.com', joinDate: '2025-09-06', status: 'active' },
      { id: 3, name: 'Lê Văn H', email: 'leh@email.com', joinDate: '2025-09-05', status: 'inactive' },
      { id: 4, name: 'Phạm Thị I', email: 'phami@email.com', joinDate: '2025-09-05', status: 'active' }
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
    completed: 'text-green-600 bg-green-100',
    pending: 'text-yellow-600 bg-yellow-100',
    processing: 'text-blue-600 bg-blue-100',
    cancelled: 'text-red-600 bg-red-100',
    active: 'text-green-600 bg-green-100',
    inactive: 'text-gray-600 bg-gray-100'
  }
  return colors[status] || 'text-gray-600 bg-gray-100'
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-gray-900">🏪 Admin Dashboard</h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <button class="p-2 text-gray-500 hover:text-gray-700 transition-colors">
              🔔
              <span class="sr-only">Notifications</span>
            </button>
            
            <div class="flex items-center space-x-2">
              <img class="h-8 w-8 rounded-full bg-gray-300" 
                   src="https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff" 
                   alt="Admin">
              <span class="text-sm font-medium text-gray-700">{{ authStore.user?.name || 'Admin' }}</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Navigation -->
    <nav class="bg-indigo-600">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex space-x-8">
          <router-link to="/admin" 
                       class="text-white px-3 py-4 text-sm font-medium border-b-2 border-indigo-300">
            📊 Dashboard
          </router-link>
          <router-link to="/admin/products" 
                       class="text-indigo-200 hover:text-white px-3 py-4 text-sm font-medium hover:border-b-2 hover:border-white transition-all">
            📦 Sản phẩm
          </router-link>
          <router-link to="/admin/orders" 
                       class="text-indigo-200 hover:text-white px-3 py-4 text-sm font-medium hover:border-b-2 hover:border-white transition-all">
            🛒 Đơn hàng
          </router-link>
          <router-link to="/admin/users" 
                       class="text-indigo-200 hover:text-white px-3 py-4 text-sm font-medium hover:border-b-2 hover:border-white transition-all">
            👥 Người dùng
          </router-link>
          <router-link to="/admin/analytics" 
                       class="text-indigo-200 hover:text-white px-3 py-4 text-sm font-medium hover:border-b-2 hover:border-white transition-all">
            📈 Thống kê
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard 
          title="Tổng sản phẩm"
          :value="stats.totalProducts.toLocaleString()"
          icon="📦"
          color="blue"
          trend="+12% so với tháng trước"
          :loading="stats.loading" />
          
        <StatsCard 
          title="Tổng người dùng"
          :value="stats.totalUsers.toLocaleString()"
          icon="👥"
          color="green"
          trend="+8% so với tháng trước"
          :loading="stats.loading" />
          
        <StatsCard 
          title="Tổng đơn hàng"
          :value="stats.totalOrders.toLocaleString()"
          icon="🛒"
          color="yellow"
          trend="+24% so với tháng trước"
          :loading="stats.loading" />
          
        <StatsCard 
          title="Tổng doanh thu"
          :value="formatCurrency(stats.totalRevenue)"
          icon="💰"
          color="purple"
          trend="+18% so với tháng trước"
          :loading="stats.loading" />
      </div>

      <!-- Charts and Tables -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Recent Orders -->
        <DataCard title="Đơn hàng gần đây" view-all-link="/admin/orders">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mã đơn</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="order in recentOrders" :key="order.id" class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ order.id }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ order.customer }}</td>
                  <td class="px-4 py-3 text-sm text-gray-900 font-medium">{{ formatCurrency(order.amount) }}</td>
                  <td class="px-4 py-3">
                    <span :class="`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`">
                      {{ order.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </DataCard>

        <!-- Recent Users -->
        <DataCard title="Người dùng mới" view-all-link="/admin/users">
          <div class="space-y-4">
            <div v-for="user in recentUsers" :key="user.id" 
                 class="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div class="flex items-center space-x-3">
                <img :src="`https://ui-avatars.com/api/?name=${user.name}&background=random`" 
                     :alt="user.name"
                     class="h-8 w-8 rounded-full">
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
                  <p class="text-xs text-gray-500">{{ user.email }}</p>
                </div>
              </div>
              <div class="text-right">
                <span :class="`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`">
                  {{ user.status }}
                </span>
                <p class="text-xs text-gray-500 mt-1">{{ user.joinDate }}</p>
              </div>
            </div>
          </div>
        </DataCard>
      </div>

      <!-- Quick Actions -->
      <div class="mt-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction 
            to="/admin/products/add"
            icon="➕"
            title="Thêm sản phẩm"
            description="Thêm sản phẩm mới"
            color="blue" />
            
          <QuickAction 
            to="/admin/orders"
            icon="📋"
            title="Quản lý đơn hàng"
            description="Xem và xử lý đơn hàng"
            color="green" />
            
          <QuickAction 
            to="/admin/analytics"
            icon="📊"
            title="Xem báo cáo"
            description="Thống kê và phân tích"
            color="yellow" />
            
          <QuickAction 
            to="/admin/settings"
            icon="⚙️"
            title="Cài đặt"
            description="Cấu hình hệ thống"
            color="purple" />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.router-link-active {
  @apply text-white border-b-2 border-white;
}
</style>
