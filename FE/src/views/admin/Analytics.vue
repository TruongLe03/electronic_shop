<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import ModernStatsCard from '@/components/admin/ModernStatsCard.vue'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const selectedPeriod = ref('30days')
const selectedChart = ref('revenue')

const stats = ref({
  totalRevenue: 0,
  totalOrders: 0,
  avgOrderValue: 0,
  conversionRate: 0
})

const revenueData = ref([])
const ordersData = ref([])
const topProducts = ref([])
const topCustomers = ref([])
const categoryStats = ref([])

const periodOptions = [
  { id: '7days', name: '7 ngày qua' },
  { id: '30days', name: '30 ngày qua' },
  { id: '90days', name: '3 tháng qua' },
  { id: 'year', name: 'Năm nay' }
]

const chartOptions = [
  { id: 'revenue', name: 'Doanh thu', icon: '💰' },
  { id: 'orders', name: 'Đơn hàng', icon: '📋' },
  { id: 'products', name: 'Sản phẩm', icon: '📦' },
  { id: 'customers', name: 'Khách hàng', icon: '👥' }
]

onMounted(async () => {
  if (!authStore.isAuthenticated || authStore.user?.role !== 'admin') {
    router.push('/login')
    return
  }
  
  await loadAnalytics()
})

const loadAnalytics = async () => {
  try {
    loading.value = true
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    // Mock analytics data
    stats.value = {
      totalRevenue: 485600000,
      totalOrders: 156,
      avgOrderValue: 3112820,
      conversionRate: 12.4
    }
    
    // Revenue chart data (last 7 days)
    revenueData.value = [
      { date: '2025-09-26', revenue: 45600000, orders: 18 },
      { date: '2025-09-27', revenue: 62300000, orders: 24 },
      { date: '2025-09-28', revenue: 38900000, orders: 15 },
      { date: '2025-09-29', revenue: 71200000, orders: 28 },
      { date: '2025-09-30', revenue: 54800000, orders: 21 },
      { date: '2025-10-01', revenue: 89400000, orders: 35 },
      { date: '2025-10-02', revenue: 67200000, orders: 26 }
    ]
    
    // Top selling products
    topProducts.value = [
      {
        id: 1,
        name: 'iPhone 15 Pro Max 256GB',
        image: 'https://via.placeholder.com/150/007BFF/FFFFFF?text=iPhone+15',
        sales: 45,
        revenue: 1143000000,
        growth: 15.2
      },
      {
        id: 2,
        name: 'MacBook Air M3 13"',
        image: 'https://via.placeholder.com/150/28A745/FFFFFF?text=MacBook',
        sales: 23,
        revenue: 736000000,
        growth: 8.7
      },
      {
        id: 3,
        name: 'Samsung Galaxy S24 Ultra',
        image: 'https://via.placeholder.com/150/DC3545/FFFFFF?text=Galaxy+S24',
        sales: 31,
        revenue: 926900000,
        growth: -2.1
      },
      {
        id: 4,
        name: 'iPad Air 5th Gen',
        image: 'https://via.placeholder.com/150/6F42C1/FFFFFF?text=iPad+Air',
        sales: 18,
        revenue: 304200000,
        growth: 22.5
      },
      {
        id: 5,
        name: 'AirPods Pro 2nd Gen',
        image: 'https://via.placeholder.com/150/FD7E14/FFFFFF?text=AirPods',
        sales: 67,
        revenue: 462300000,
        growth: 35.8
      }
    ]
    
    // Top customers
    topCustomers.value = [
      {
        id: 1,
        name: 'Nguyễn Văn An',
        email: 'nguyenvanan@gmail.com',
        avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+An&background=4f46e5&color=fff',
        totalSpent: 85600000,
        orders: 12,
        lastOrder: '2025-10-01'
      },
      {
        id: 2,
        name: 'Trần Thị Bình',
        email: 'tranthibinh@gmail.com',
        avatar: 'https://ui-avatars.com/api/?name=Tran+Thi+Binh&background=059669&color=fff',
        totalSpent: 72400000,
        orders: 8,
        lastOrder: '2025-09-30'
      },
      {
        id: 3,
        name: 'Lê Văn Cường',
        email: 'levancuong@gmail.com',
        avatar: 'https://ui-avatars.com/api/?name=Le+Van+Cuong&background=dc2626&color=fff',
        totalSpent: 63200000,
        orders: 15,
        lastOrder: '2025-10-02'
      },
      {
        id: 4,
        name: 'Phạm Thị Dung',
        email: 'phamthidung@gmail.com',
        avatar: 'https://ui-avatars.com/api/?name=Pham+Thi+Dung&background=7c3aed&color=fff',
        totalSpent: 45800000,
        orders: 6,
        lastOrder: '2025-09-28'
      }
    ]
    
    // Category performance
    categoryStats.value = [
      { name: 'Điện thoại', sales: 89, revenue: 2165400000, percentage: 45.2 },
      { name: 'Laptop', sales: 34, revenue: 1088000000, percentage: 22.8 },
      { name: 'Phụ kiện', sales: 156, revenue: 685200000, percentage: 14.3 },
      { name: 'Tablet', sales: 28, revenue: 475600000, percentage: 9.9 },
      { name: 'Tai nghe', sales: 98, revenue: 372800000, percentage: 7.8 }
    ]
    
  } catch (error) {
    console.error('Error loading analytics:', error)
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
    month: '2-digit',
    day: '2-digit'
  })
}

const formatGrowth = (growth) => {
  return growth >= 0 ? `+${growth}%` : `${growth}%`
}

const getGrowthColor = (growth) => {
  return growth >= 0 ? 'text-green-600' : 'text-red-600'
}

const maxRevenue = computed(() => {
  return Math.max(...revenueData.value.map(d => d.revenue))
})
</script>

<template>
  <AdminLayout>
    <div class="space-y-8">
      <!-- Header with filters -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-xl">
            <i class="fas fa-chart-bar"></i>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Báo cáo thống kê</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">Phân tích hiệu suất kinh doanh và xu hướng</p>
          </div>
        </div>
        
        <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <!-- Period Filter -->
          <select
            v-model="selectedPeriod"
            @change="loadAnalytics"
            class="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
          >
            <option v-for="period in periodOptions" :key="period.id" :value="period.id">
              {{ period.name }}
            </option>
          </select>
          
          <!-- Chart Type Filter -->
          <select
            v-model="selectedChart"
            class="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
          >
            <option v-for="chart in chartOptions" :key="chart.id" :value="chart.id">
              {{ chart.icon }} {{ chart.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Main Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModernStatsCard 
          title="Tổng doanh thu"
          :value="stats.totalRevenue"
          icon="fas fa-dollar-sign"
          gradient="from-emerald-500 to-teal-500"
          :loading="loading"
          :is-currency="true"
        />
        
        <ModernStatsCard 
          title="Tổng đơn hàng"
          :value="stats.totalOrders"
          icon="fas fa-clipboard-list"
          gradient="from-blue-500 to-indigo-500"
          :loading="loading"
        />
        
        <ModernStatsCard 
          title="Giá trị TB/đơn"
          :value="stats.avgOrderValue"
          icon="fas fa-shopping-cart"
          gradient="from-purple-500 to-pink-500"
          :loading="loading"
          :is-currency="true"
        />
        
        <ModernStatsCard 
          title="Tỷ lệ chuyển đổi"
          :value="stats.conversionRate"
          icon="fas fa-chart-line"
          gradient="from-orange-500 to-red-500"
          :loading="loading"
          suffix="%"
        />
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Revenue Chart -->
        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Doanh thu 7 ngày qua</h3>
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">Doanh thu</span>
            </div>
          </div>
          
          <!-- Loading State -->
          <div v-if="loading" class="animate-pulse">
            <div class="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          
          <!-- Chart -->
          <div v-else class="h-64 flex items-end justify-between space-x-2">
            <div 
              v-for="data in revenueData" 
              :key="data.date"
              class="flex-1 flex flex-col items-center"
            >
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
                <div 
                  class="bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all duration-700 ease-out rounded-t-lg"
                  :style="{ height: `${(data.revenue / maxRevenue) * 200}px` }"
                ></div>
              </div>
              <div class="mt-2 text-xs text-gray-600 dark:text-gray-400 text-center">
                <div class="font-semibold">{{ formatDate(data.date) }}</div>
                <div class="text-emerald-600 dark:text-emerald-400">{{ Math.round(data.revenue / 1000000) }}M</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Category Performance -->
        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-6">Hiệu suất theo danh mục</h3>
          
          <!-- Loading State -->
          <div v-if="loading" class="animate-pulse space-y-4">
            <div v-for="i in 5" :key="i" class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
          
          <!-- Category Stats -->
          <div v-else class="space-y-4">
            <div 
              v-for="(category, index) in categoryStats" 
              :key="category.name"
              class="flex items-center space-x-4"
            >
              <div 
                class="w-12 h-12 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                :class="{
                  'bg-gradient-to-r from-blue-500 to-blue-600': index === 0,
                  'bg-gradient-to-r from-green-500 to-green-600': index === 1,
                  'bg-gradient-to-r from-purple-500 to-purple-600': index === 2,
                  'bg-gradient-to-r from-orange-500 to-orange-600': index === 3,
                  'bg-gradient-to-r from-pink-500 to-pink-600': index === 4
                }"
              >
                {{ category.percentage }}%
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <h4 class="font-semibold text-gray-800 dark:text-white">{{ category.name }}</h4>
                  <span class="text-sm font-semibold text-gray-600 dark:text-gray-400">{{ category.sales }} SP</span>
                </div>
                <div class="flex items-center justify-between mt-1">
                  <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                    <div 
                      class="h-2 rounded-full transition-all duration-500"
                      :class="{
                        'bg-gradient-to-r from-blue-500 to-blue-600': index === 0,
                        'bg-gradient-to-r from-green-500 to-green-600': index === 1,
                        'bg-gradient-to-r from-purple-500 to-purple-600': index === 2,
                        'bg-gradient-to-r from-orange-500 to-orange-600': index === 3,
                        'bg-gradient-to-r from-pink-500 to-pink-600': index === 4
                      }"
                      :style="{ width: `${category.percentage}%` }"
                    ></div>
                  </div>
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    {{ Math.round(category.revenue / 1000000) }}M
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Products and Customers -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Top Products -->
        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Top sản phẩm bán chạy</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Dựa trên doanh thu trong 30 ngày qua</p>
          </div>
          
          <div class="p-6">
            <!-- Loading State -->
            <div v-if="loading" class="animate-pulse space-y-4">
              <div v-for="i in 5" :key="i" class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
            
            <!-- Products List -->
            <div v-else class="space-y-4">
              <div 
                v-for="(product, index) in topProducts" 
                :key="product.id"
                class="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div class="relative">
                  <img
                    :src="product.image"
                    :alt="product.name"
                    class="w-12 h-12 rounded-lg object-cover"
                  >
                  <div class="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {{ index + 1 }}
                  </div>
                </div>
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-800 dark:text-white text-sm">{{ product.name }}</h4>
                  <div class="flex items-center space-x-4 mt-1">
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ product.sales }} đã bán</span>
                    <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {{ Math.round(product.revenue / 1000000) }}M
                    </span>
                    <span 
                      class="text-xs font-semibold"
                      :class="getGrowthColor(product.growth)"
                    >
                      {{ formatGrowth(product.growth) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Customers -->
        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Top khách hàng VIP</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Khách hàng có giá trị cao nhất</p>
          </div>
          
          <div class="p-6">
            <!-- Loading State -->
            <div v-if="loading" class="animate-pulse space-y-4">
              <div v-for="i in 4" :key="i" class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
            
            <!-- Customers List -->
            <div v-else class="space-y-4">
              <div 
                v-for="(customer, index) in topCustomers" 
                :key="customer.id"
                class="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div class="relative">
                  <img
                    :src="customer.avatar"
                    :alt="customer.name"
                    class="w-12 h-12 rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
                  >
                  <div class="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {{ index + 1 }}
                  </div>
                </div>
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-800 dark:text-white text-sm">{{ customer.name }}</h4>
                  <div class="flex items-center space-x-4 mt-1">
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ customer.orders }} đơn</span>
                    <span class="text-xs font-semibold text-purple-600 dark:text-purple-400">
                      {{ formatCurrency(customer.totalSpent) }}
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