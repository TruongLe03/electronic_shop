<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="max-w-2xl mx-auto">
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div class="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-red-800 mb-2">Không thể tải thông tin đơn hàng</h2>
          <p class="text-red-600 mb-4">{{ error }}</p>
          <router-link 
            to="/"
            class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Về trang chủ
          </router-link>
        </div>
      </div>

      <!-- Order Detail Content -->
      <div v-else-if="order" class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-800 mb-2">Chi tiết đơn hàng</h1>
              <p class="text-gray-600">Mã đơn hàng: <span class="font-semibold">#{{ orderId }}</span></p>
            </div>
            <div class="mt-4 md:mt-0">
              <span :class="getStatusBadgeClass(order.status)" class="px-3 py-1 rounded-full text-sm font-semibold">
                {{ getStatusText(order.status) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Order Info -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- Customer Info -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-bold text-gray-800 mb-4">Thông tin khách hàng</h3>
            <div class="space-y-3">
              <div>
                <span class="text-sm text-gray-600">Họ tên:</span>
                <p class="font-semibold">{{ order.shipping_address?.name || 'N/A' }}</p>
              </div>
              <div>
                <span class="text-sm text-gray-600">Số điện thoại:</span>
                <p class="font-semibold">{{ order.shipping_address?.phone || 'N/A' }}</p>
              </div>
              <div>
                <span class="text-sm text-gray-600">Địa chỉ:</span>
                <p class="font-semibold">{{ order.shipping_address?.address || 'N/A' }}</p>
              </div>
            </div>
          </div>

          <!-- Shipping Info -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-bold text-gray-800 mb-4">Thông tin giao hàng</h3>
            <div class="space-y-3">
              <div>
                <span class="text-sm text-gray-600">Địa chỉ:</span>
                <p class="font-semibold">{{ order.shipping_address?.address || 'N/A' }}</p>
              </div>
              <div v-if="order.notes">
                <span class="text-sm text-gray-600">Ghi chú:</span>
                <p class="font-semibold">{{ order.notes }}</p>
              </div>
              <div>
                <span class="text-sm text-gray-600">Phương thức thanh toán:</span>
                <p class="font-semibold">{{ getPaymentMethodText(order.payment_method) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Sản phẩm đã đặt</h3>
          <div class="space-y-4">
            <div 
              v-for="item in order.products" 
              :key="item.productId || item._id"
              class="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
            >
              <img
                :src="getFullImage(item.image)"
                :alt="item.name"
                class="w-16 h-16 object-contain bg-gray-50 rounded-md"
                @error="e => e.target.src = getFullImage(null)"
              />
              <div class="flex-1">
                <h4 class="font-semibold text-gray-800">{{ item.name }}</h4>
                <p class="text-sm text-gray-600">
                  {{ formatPrice(item.discount_price || item.price) }} x {{ item.quantity }}
                </p>
              </div>
              <div class="text-right">
                <p class="font-bold text-gray-900">
                  {{ formatPrice((item.discount_price || item.price) * item.quantity) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Tổng cộng</h3>
          <div class="space-y-2">
            <div class="flex justify-between text-gray-600">
              <span>Tạm tính:</span>
              <span>{{ formatPrice(order.subtotal || calculateSubtotal()) }}</span>
            </div>
            <div class="flex justify-between text-gray-600">
              <span>Phí vận chuyển:</span>
              <span>{{ formatPrice(order.shipping_fee || 30000) }}</span>
            </div>
            <hr class="border-gray-200">
            <div class="flex justify-between text-lg font-bold text-gray-800">
              <span>Tổng cộng:</span>
              <span class="text-blue-600">{{ formatPrice(order.total) }}</span>
            </div>
          </div>
        </div>

        <!-- Order Timeline -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Trạng thái đơn hàng</h3>
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p class="font-semibold">Đơn hàng đã được tạo</p>
                <p class="text-sm text-gray-600">{{ formatDate(order.createdAt) }}</p>
              </div>
            </div>
            <div v-if="order.status !== 'pending'" class="flex items-center gap-3">
              <div :class="order.status === 'cancelled' ? 'bg-red-500' : 'bg-green-500'" class="w-3 h-3 rounded-full"></div>
              <div>
                <p class="font-semibold">{{ getStatusText(order.status) }}</p>
                <p class="text-sm text-gray-600">{{ formatDate(order.updatedAt) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4">
          <router-link 
            to="/"
            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold text-center transition-colors"
          >
            Tiếp tục mua sắm
          </router-link>
          
          <button 
            v-if="order.status === 'pending'"
            @click="cancelOrder"
            :disabled="cancelling"
            class="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
          >
            {{ cancelling ? 'Đang hủy...' : 'Hủy đơn hàng' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Cancel Order Modal -->
  <Teleport to="body">
    <div v-if="showCancelModal" class="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" @click="showCancelModal = false">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md" @click.stop>
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Hủy đơn hàng</h3>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Vui lòng chọn lý do hủy đơn hàng:
            </label>
            <select 
              v-model="cancelReason" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Chọn lý do --</option>
              <option value="Thay đổi ý định mua hàng">Thay đổi ý định mua hàng</option>
              <option value="Tìm được sản phẩm rẻ hơn">Tìm được sản phẩm rẻ hơn</option>
              <option value="Không cần thiết nữa">Không cần thiết nữa</option>
              <option value="Sai thông tin đặt hàng">Sai thông tin đặt hàng</option>
              <option value="Thời gian giao hàng quá lâu">Thời gian giao hàng quá lâu</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          <div v-if="cancelReason === 'Khác'" class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Lý do khác:
            </label>
            <textarea 
              v-model="customCancelReason"
              placeholder="Nhập lý do hủy..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
            ></textarea>
          </div>

          <div class="flex space-x-3">
            <button 
              @click="showCancelModal = false"
              class="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md font-medium transition-colors"
            >
              Hủy bỏ
            </button>
            <button 
              @click="confirmCancelOrder"
              :disabled="!cancelReason || cancelling"
              class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors"
            >
              {{ cancelling ? 'Đang hủy...' : 'Xác nhận hủy' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Ensure modal appears above all other content */
.modal-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  z-index: 9999 !important;
}
</style>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { orderService } from '@api/orderService'
import { useNotification } from '@composables/client/useNotification'
import { getFullImage } from '@utils/imageUtils'

const route = useRoute()
const router = useRouter()
const { showSuccess, showError } = useNotification()

// State
const order = ref(null)
const loading = ref(true)
const error = ref('')
const cancelling = ref(false)
const orderId = route.params.orderId

// Cancel modal state
const showCancelModal = ref(false)
const cancelReason = ref('')
const customCancelReason = ref('')

// Methods
const fetchOrderDetail = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await orderService.getOrderById(orderId)
    if (response.success) {
      order.value = response.data
    } else {
      error.value = response.message || 'Không thể tải thông tin đơn hàng'
    }
  } catch (err) {
    console.error('Error fetching order detail:', err)
    error.value = 'Có lỗi xảy ra khi tải thông tin đơn hàng'
  } finally {
    loading.value = false
  }
}

const cancelOrder = () => {
  showCancelModal.value = true
  cancelReason.value = ''
  customCancelReason.value = ''
}

const confirmCancelOrder = async () => {
  const finalReason = cancelReason.value === 'Khác' ? customCancelReason.value : cancelReason.value
  
  if (!finalReason.trim()) {
    showError('Vui lòng chọn hoặc nhập lý do hủy đơn hàng')
    return
  }
  
  try {
    cancelling.value = true
    const response = await orderService.cancelOrder(orderId, finalReason)
    
    if (response.success) {
      showSuccess('Đơn hàng đã được hủy thành công')
      order.value.status = 'cancelled'
      showCancelModal.value = false
    } else {
      showError(response.message || 'Không thể hủy đơn hàng')
    }
  } catch (error) {
    console.error('Error cancelling order:', error)
    showError('Có lỗi xảy ra khi hủy đơn hàng')
  } finally {
    cancelling.value = false
  }
}

const calculateSubtotal = () => {
  if (!order.value?.products) return 0
  return order.value.products.reduce((sum, item) => {
    const price = item.discount_price || item.price
    return sum + (price * item.quantity)
  }, 0)
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusText = (status) => {
  const statusMap = {
    'pending': 'Chờ xử lý',
    'confirmed': 'Đã xác nhận',
    'processing': 'Đang xử lý',
    'shipping': 'Đang giao hàng',
    'delivered': 'Đã giao hàng',
    'cancelled': 'Đã hủy'
  }
  return statusMap[status] || status
}

const getStatusBadgeClass = (status) => {
  const classMap = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'confirmed': 'bg-blue-100 text-blue-800',
    'processing': 'bg-purple-100 text-purple-800',
    'shipping': 'bg-orange-100 text-orange-800',
    'delivered': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800'
  }
  return classMap[status] || 'bg-gray-100 text-gray-800'
}

const getPaymentMethodText = (method) => {
  const methodMap = {
    'COD': 'Thanh toán khi nhận hàng (COD)',
    'cod': 'Thanh toán khi nhận hàng (COD)',
    'VNPay': 'VNPay',
    'vnpay': 'VNPay',
    'MoMo': 'MoMo',
    'momo': 'MoMo',
    'Bank': 'Chuyển khoản ngân hàng',
    'bank': 'Chuyển khoản ngân hàng'
  }
  return methodMap[method] || method
}

// Lifecycle
onMounted(() => {
  if (!orderId) {
    error.value = 'Mã đơn hàng không hợp lệ'
    loading.value = false
    return
  }
  
  fetchOrderDetail()
})
</script>