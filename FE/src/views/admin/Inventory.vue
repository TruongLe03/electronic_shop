<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import ModernStatsCard from '@/components/admin/ModernStatsCard.vue'

const router = useRouter()
const authStore = useAuthStore()

const inventory = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedStatus = ref('all')
const selectedCategory = ref('all')

const stats = ref({
  totalProducts: 0,
  inStock: 0,
  lowStock: 0,
  outOfStock: 0
})

const statusOptions = [
  { id: 'all', name: 'Tất cả trạng thái' },
  { id: 'in-stock', name: 'Còn hàng' },
  { id: 'low-stock', name: 'Sắp hết hàng' },
  { id: 'out-of-stock', name: 'Hết hàng' }
]

const categoryOptions = [
  { id: 'all', name: 'Tất cả danh mục' },
  { id: 'smartphone', name: 'Điện thoại' },
  { id: 'laptop', name: 'Laptop' },
  { id: 'tablet', name: 'Máy tính bảng' },
  { id: 'accessories', name: 'Phụ kiện' },
  { id: 'headphones', name: 'Tai nghe' }
]

// Computed filtered inventory
const filteredInventory = computed(() => {
  let filtered = inventory.value

  // Filter by status
  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter(item => {
      if (selectedStatus.value === 'in-stock') return item.quantity > item.lowStockThreshold
      if (selectedStatus.value === 'low-stock') return item.quantity > 0 && item.quantity <= item.lowStockThreshold
      if (selectedStatus.value === 'out-of-stock') return item.quantity === 0
      return true
    })
  }

  // Filter by category
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(item => item.category === selectedCategory.value)
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.sku.toLowerCase().includes(query) ||
      item.brand.toLowerCase().includes(query)
    )
  }

  return filtered
})

onMounted(async () => {
  if (!authStore.isAuthenticated || authStore.user?.role !== 'admin') {
    router.push('/login')
    return
  }
  
  await loadInventory()
})

const loadInventory = async () => {
  try {
    loading.value = true
    
    // Simulate API call with mock data
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    inventory.value = [
      {
        id: 1,
        sku: 'IP15PM256',
        name: 'iPhone 15 Pro Max 256GB',
        brand: 'Apple',
        category: 'smartphone',
        image: 'https://via.placeholder.com/150/007BFF/FFFFFF?text=iPhone+15',
        quantity: 45,
        lowStockThreshold: 10,
        price: 25400000,
        cost: 22000000,
        location: 'Kho A - Kệ 1',
        lastUpdated: '2025-10-01T10:30:00Z'
      },
      {
        id: 2,
        sku: 'MBA13M3',
        name: 'MacBook Air 13" M3',
        brand: 'Apple',
        category: 'laptop',
        image: 'https://via.placeholder.com/150/28A745/FFFFFF?text=MacBook',
        quantity: 8,
        lowStockThreshold: 15,
        price: 32000000,
        cost: 28000000,
        location: 'Kho B - Kệ 2',
        lastUpdated: '2025-09-30T16:45:00Z'
      },
      {
        id: 3,
        sku: 'SGS24U',
        name: 'Samsung Galaxy S24 Ultra',
        brand: 'Samsung',
        category: 'smartphone',
        image: 'https://via.placeholder.com/150/DC3545/FFFFFF?text=Galaxy+S24',
        quantity: 0,
        lowStockThreshold: 5,
        price: 29900000,
        cost: 26000000,
        location: 'Kho A - Kệ 3',
        lastUpdated: '2025-09-29T14:20:00Z'
      },
      {
        id: 4,
        sku: 'IPADAIR5',
        name: 'iPad Air 5th Gen 256GB',
        brand: 'Apple',
        category: 'tablet',
        image: 'https://via.placeholder.com/150/6F42C1/FFFFFF?text=iPad+Air',
        quantity: 23,
        lowStockThreshold: 8,
        price: 16900000,
        cost: 14500000,
        location: 'Kho C - Kệ 1',
        lastUpdated: '2025-10-02T08:15:00Z'
      },
      {
        id: 5,
        sku: 'APP2NG',
        name: 'AirPods Pro 2nd Gen',
        brand: 'Apple',
        category: 'headphones',
        image: 'https://via.placeholder.com/150/FD7E14/FFFFFF?text=AirPods',
        quantity: 3,
        lowStockThreshold: 12,
        price: 6900000,
        cost: 5800000,
        location: 'Kho D - Kệ 4',
        lastUpdated: '2025-09-28T11:30:00Z'
      },
      {
        id: 6,
        sku: 'AWSERIES9',
        name: 'Apple Watch Series 9',
        brand: 'Apple',
        category: 'accessories',
        image: 'https://via.placeholder.com/150/E83E8C/FFFFFF?text=Watch',
        quantity: 18,
        lowStockThreshold: 10,
        price: 9900000,
        cost: 8500000,
        location: 'Kho D - Kệ 2',
        lastUpdated: '2025-10-01T15:45:00Z'
      }
    ]
    
    // Calculate stats
    stats.value = {
      totalProducts: inventory.value.length,
      inStock: inventory.value.filter(item => item.quantity > item.lowStockThreshold).length,
      lowStock: inventory.value.filter(item => item.quantity > 0 && item.quantity <= item.lowStockThreshold).length,
      outOfStock: inventory.value.filter(item => item.quantity === 0).length
    }
    
  } catch (error) {
    console.error('Error loading inventory:', error)
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

const getStockStatus = (item) => {
  if (item.quantity === 0) {
    return { text: 'Hết hàng', class: 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30' }
  } else if (item.quantity <= item.lowStockThreshold) {
    return { text: 'Sắp hết', class: 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30' }
  } else {
    return { text: 'Còn hàng', class: 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30' }
  }
}

const getCategoryText = (category) => {
  const categoryText = {
    smartphone: 'Điện thoại',
    laptop: 'Laptop',
    tablet: 'Máy tính bảng',
    accessories: 'Phụ kiện',
    headphones: 'Tai nghe'
  }
  return categoryText[category] || category
}

const updateStock = (item, newQuantity) => {
  if (newQuantity >= 0) {
    item.quantity = newQuantity
    item.lastUpdated = new Date().toISOString()
    
    // Recalculate stats
    stats.value = {
      totalProducts: inventory.value.length,
      inStock: inventory.value.filter(item => item.quantity > item.lowStockThreshold).length,
      lowStock: inventory.value.filter(item => item.quantity > 0 && item.quantity <= item.lowStockThreshold).length,
      outOfStock: inventory.value.filter(item => item.quantity === 0).length
    }
    
    console.log(`Updated ${item.sku} quantity to ${newQuantity}`)
  }
}

const reorderProduct = (item) => {
  console.log('Reorder product:', item.sku)
  // Implement reorder logic
}

const viewProductDetail = (item) => {
  console.log('View product:', item.id)
  router.push(`/admin/products/edit/${item.id}`)
}
</script>

<template>
  <AdminLayout>
    <div class="space-y-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModernStatsCard 
          title="Tổng sản phẩm"
          :value="stats.totalProducts"
          icon="fas fa-boxes"
          gradient="from-blue-500 to-cyan-500"
          :loading="loading"
        />
        
        <ModernStatsCard 
          title="Còn hàng"
          :value="stats.inStock"
          icon="fas fa-check-circle"
          gradient="from-green-500 to-emerald-500"
          :loading="loading"
        />
        
        <ModernStatsCard 
          title="Sắp hết hàng"
          :value="stats.lowStock"
          icon="fas fa-exclamation-triangle"
          gradient="from-yellow-500 to-orange-500"
          :loading="loading"
        />
        
        <ModernStatsCard 
          title="Hết hàng"
          :value="stats.outOfStock"
          icon="fas fa-times-circle"
          gradient="from-red-500 to-pink-500"
          :loading="loading"
        />
      </div>

      <!-- Inventory Management -->
      <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50">
        <!-- Header -->
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl">
                <i class="fas fa-warehouse"></i>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-800 dark:text-white">Quản lý tồn kho</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Theo dõi và quản lý số lượng sản phẩm</p>
              </div>
            </div>
            
            <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <!-- Search -->
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  class="w-full sm:w-64 pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                >
                <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <!-- Category Filter -->
              <select
                v-model="selectedCategory"
                class="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              >
                <option v-for="category in categoryOptions" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
              
              <!-- Status Filter -->
              <select
                v-model="selectedStatus"
                class="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
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
                <div class="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
                <div class="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div class="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredInventory.length === 0" class="p-12 text-center">
            <div class="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {{ searchQuery.trim() || selectedStatus !== 'all' || selectedCategory !== 'all' ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm trong kho' }}
            </h3>
            <p class="text-gray-500 dark:text-gray-400">
              {{ searchQuery.trim() || selectedStatus !== 'all' || selectedCategory !== 'all' ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm' : 'Thêm sản phẩm để bắt đầu quản lý tồn kho' }}
            </p>
          </div>

          <!-- Inventory Table -->
          <table v-else class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  SKU
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Danh mục
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Số lượng
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Giá bán
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Vị trí
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
                v-for="item in filteredInventory" 
                :key="item.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
              >
                <!-- Product Info -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center space-x-4">
                    <img
                      class="w-16 h-16 rounded-xl object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                      :src="item.image"
                      :alt="item.name"
                    >
                    <div>
                      <div class="text-sm font-semibold text-gray-900 dark:text-white">
                        {{ item.name }}
                      </div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">
                        {{ item.brand }}
                      </div>
                    </div>
                  </div>
                </td>
                
                <!-- SKU -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {{ item.sku }}
                  </span>
                </td>
                
                <!-- Category -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-600 dark:text-gray-300">
                    {{ getCategoryText(item.category) }}
                  </span>
                </td>
                
                <!-- Quantity -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center space-x-2">
                    <input
                      type="number"
                      :value="item.quantity"
                      @change="updateStock(item, parseInt($event.target.value))"
                      class="w-20 px-2 py-1 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      min="0"
                    >
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                      / {{ item.lowStockThreshold }}
                    </span>
                  </div>
                </td>
                
                <!-- Price -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-semibold text-gray-900 dark:text-white">
                    {{ formatCurrency(item.price) }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    Cost: {{ formatCurrency(item.cost) }}
                  </div>
                </td>
                
                <!-- Location -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-600 dark:text-gray-300">
                    {{ item.location }}
                  </span>
                </td>
                
                <!-- Status -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStockStatus(item).class}`">
                    {{ getStockStatus(item).text }}
                  </span>
                </td>
                
                <!-- Actions -->
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      @click="viewProductDetail(item)"
                      class="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                      title="Xem chi tiết"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    
                    <button
                      v-if="item.quantity <= item.lowStockThreshold"
                      @click="reorderProduct(item)"
                      class="p-2 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/50 rounded-lg transition-colors"
                      title="Đặt hàng bổ sung"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Summary Footer -->
        <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Hiển thị <span class="font-semibold">{{ Math.min(filteredInventory.length, 10) }}</span> của <span class="font-semibold">{{ filteredInventory.length }}</span> sản phẩm
            </div>
            
            <div class="flex items-center space-x-4">
              <div class="text-sm">
                <span class="text-gray-500 dark:text-gray-400">Cập nhật lần cuối:</span>
                <span class="font-semibold text-gray-900 dark:text-white ml-1">
                  {{ formatDate(new Date().toISOString()) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>