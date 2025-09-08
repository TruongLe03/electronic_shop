<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()

const orders = ref([])
const loading = ref(false)
const searchTerm = ref('')
const selectedStatus = ref('')
const selectedDateRange = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const totalPages = ref(0)

const orderStatuses = ref([
  { value: 'pending', label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
  { value: 'processing', label: 'Đang xử lý', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'shipped', label: 'Đã gửi hàng', color: 'bg-purple-100 text-purple-800' },
  { value: 'delivered', label: 'Đã giao hàng', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Đã hủy', color: 'bg-red-100 text-red-800' }
])

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
    
    // Mock orders data - replace with real API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    orders.value = [
      {
        id: 'ORD-001',
        customer: {
          name: 'Nguyễn Văn A',
          email: 'nguyenvana@email.com',
          phone: '0901234567'
        },
        items: [
          { 
            name: 'Arduino Uno R3', 
            quantity: 2, 
            price: 350000,
            image: 'https://example.com/arduino.jpg'
          },
          { 
            name: 'Cảm biến nhiệt độ DS18B20', 
            quantity: 5, 
            price: 45000,
            image: 'https://example.com/sensor.jpg'
          }
        ],
        total: 925000,
        status: 'pending',
        paymentMethod: 'COD',
        shippingAddress: '123 Đường ABC, Quận 1, TP.HCM',
        orderDate: '2025-09-06T08:30:00',
        notes: 'Giao hàng trong giờ hành chính'
      },
      {
        id: 'ORD-002',
        customer: {
          name: 'Trần Thị B',
          email: 'tranthib@email.com',
          phone: '0902345678'
        },
        items: [
          { 
            name: 'Raspberry Pi 4 Model B', 
            quantity: 1, 
            price: 1250000,
            image: 'https://example.com/rpi.jpg'
          }
        ],
        total: 1250000,
        status: 'confirmed',
        paymentMethod: 'Bank Transfer',
        shippingAddress: '456 Đường XYZ, Quận 3, TP.HCM',
        orderDate: '2025-09-06T09:15:00',
        notes: ''
      },
      {
        id: 'ORD-003',
        customer: {
          name: 'Lê Văn C',
          email: 'levanc@email.com',
          phone: '0903456789'
        },
        items: [
          { 
            name: 'Module ESP32', 
            quantity: 3, 
            price: 180000,
            image: 'https://example.com/esp32.jpg'
          }
        ],
        total: 540000,
        status: 'shipped',
        paymentMethod: 'COD',
        shippingAddress: '789 Đường DEF, Quận 7, TP.HCM',
        orderDate: '2025-09-05T14:20:00',
        notes: 'Khách yêu cầu gọi trước khi giao'
      }
    ]
    
    totalPages.value = Math.ceil(orders.value.length / itemsPerPage)
  } catch (error) {
    console.error('Error loading orders:', error)
  } finally {
    loading.value = false
  }
}

const filteredOrders = computed(() => {
  let filtered = orders.value
  
  if (searchTerm.value) {
    filtered = filtered.filter(order => 
      order.id.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }
  
  if (selectedStatus.value) {
    filtered = filtered.filter(order => order.status === selectedStatus.value)
  }
  
  return filtered
})

const updateOrderStatus = async (orderId, newStatus) => {
  try {
    // Mock API call
    const orderIndex = orders.value.findIndex(order => order.id === orderId)
    if (orderIndex !== -1) {
      orders.value[orderIndex].status = newStatus
      alert(`Đã cập nhật trạng thái đơn hàng ${orderId} thành ${getStatusLabel(newStatus)}`)
    }
  } catch (error) {
    console.error('Error updating order status:', error)
    alert('Có lỗi xảy ra khi cập nhật trạng thái')
  }
}

const getStatusLabel = (status) => {
  const statusObj = orderStatuses.value.find(s => s.value === status)
  return statusObj ? statusObj.label : status
}

const getStatusColor = (status) => {
  const statusObj = orderStatuses.value.find(s => s.value === status)
  return statusObj ? statusObj.color : 'bg-gray-100 text-gray-800'
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('vi-VN')
}

const viewOrderDetail = (orderId) => {
  // Navigate to order detail page or open modal
  router.push(`/admin/orders/${orderId}`)
}

const exportOrders = () => {
  // Mock export functionality
  alert('Tính năng xuất báo cáo đang được phát triển')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <router-link to="/admin" class="text-indigo-600 hover:text-indigo-700 mr-4">
              ← Dashboard
            </router-link>
            <h1 class="text-2xl font-bold text-gray-900">🛒 Quản lý đơn hàng</h1>
          </div>
          
          <button @click="exportOrders"
                  class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
            📊 Xuất báo cáo
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <span class="text-xl">⏳</span>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Chờ xử lý</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ orders.filter(o => o.status === 'pending').length }}
              </p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <span class="text-xl">🔄</span>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Đang xử lý</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ orders.filter(o => ['confirmed', 'processing'].includes(o.status)).length }}
              </p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <span class="text-xl">✅</span>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Hoàn thành</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ orders.filter(o => o.status === 'delivered').length }}
              </p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 rounded-lg">
              <span class="text-xl">💰</span>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Tổng doanh thu</p>
              <p class="text-lg font-bold text-gray-900">
                {{ formatCurrency(orders.reduce((sum, order) => sum + order.total, 0)) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
            <input v-model="searchTerm"
                   type="text"
                   placeholder="Mã đơn hàng, tên khách hàng..."
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          
          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <select v-model="selectedStatus"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">Tất cả trạng thái</option>
              <option v-for="status in orderStatuses" :key="status.value" :value="status.value">
                {{ status.label }}
              </option>
            </select>
          </div>
          
          <!-- Date Range -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Thời gian</label>
            <select v-model="selectedDateRange"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">Tất cả thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
            </select>
          </div>
          
          <!-- Actions -->
          <div class="flex items-end">
            <button @click="loadOrders"
                    class="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors">
              🔄 Làm mới
            </button>
          </div>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          <span class="ml-2 text-gray-600">Đang tải...</span>
        </div>

        <!-- Orders List -->
        <div v-else class="divide-y divide-gray-200">
          <div v-for="order in filteredOrders" :key="order.id" 
               class="p-6 hover:bg-gray-50 transition-colors">
            <!-- Order Header -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-4">
                <h3 class="text-lg font-semibold text-gray-900">{{ order.id }}</h3>
                <span :class="`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`">
                  {{ getStatusLabel(order.status) }}
                </span>
              </div>
              
              <div class="flex items-center space-x-2">
                <select :value="order.status" 
                        @change="updateOrderStatus(order.id, $event.target.value)"
                        class="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-indigo-500 focus:border-indigo-500">
                  <option v-for="status in orderStatuses" :key="status.value" :value="status.value">
                    {{ status.label }}
                  </option>
                </select>
                
                <button @click="viewOrderDetail(order.id)"
                        class="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                  Chi tiết →
                </button>
              </div>
            </div>

            <!-- Customer Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <p class="text-sm text-gray-500">Khách hàng</p>
                <p class="font-medium text-gray-900">{{ order.customer.name }}</p>
                <p class="text-sm text-gray-600">{{ order.customer.email }}</p>
                <p class="text-sm text-gray-600">{{ order.customer.phone }}</p>
              </div>
              
              <div>
                <p class="text-sm text-gray-500">Tổng tiền</p>
                <p class="text-lg font-bold text-gray-900">{{ formatCurrency(order.total) }}</p>
                <p class="text-sm text-gray-600">{{ order.paymentMethod }}</p>
              </div>
              
              <div>
                <p class="text-sm text-gray-500">Ngày đặt</p>
                <p class="font-medium text-gray-900">{{ formatDate(order.orderDate) }}</p>
              </div>
              
              <div>
                <p class="text-sm text-gray-500">Địa chỉ giao hàng</p>
                <p class="text-sm text-gray-600">{{ order.shippingAddress }}</p>
              </div>
            </div>

            <!-- Order Items -->
            <div class="border-t border-gray-100 pt-4">
              <p class="text-sm font-medium text-gray-700 mb-3">Sản phẩm đã đặt:</p>
              <div class="space-y-2">
                <div v-for="item in order.items" :key="item.name" 
                     class="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                  <div class="flex items-center space-x-3">
                    <img :src="item.image || '/assets/images/placeholder.jpg'" 
                         :alt="item.name"
                         class="h-10 w-10 rounded object-cover">
                    <div>
                      <p class="font-medium text-gray-900">{{ item.name }}</p>
                      <p class="text-sm text-gray-600">{{ formatCurrency(item.price) }} x {{ item.quantity }}</p>
                    </div>
                  </div>
                  <p class="font-medium text-gray-900">
                    {{ formatCurrency(item.price * item.quantity) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div v-if="order.notes" class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p class="text-sm text-yellow-800">
                <strong>Ghi chú:</strong> {{ order.notes }}
              </p>
            </div>
          </div>
          
          <!-- Empty State -->
          <div v-if="filteredOrders.length === 0" class="text-center py-12">
            <div class="text-gray-400 text-lg mb-2">📋</div>
            <div class="text-gray-500">Không tìm thấy đơn hàng nào</div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.router-link-active {
  @apply text-indigo-600;
}
</style>
