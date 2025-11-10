<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Back Button -->
      <button
        @click="goBack"
        class="mb-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
      >
        <i class="fas fa-arrow-left"></i>
        <span>Quay lại</span>
      </button>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-xl shadow-lg p-12 text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
        <p class="text-gray-600">Đang tải thông báo...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-xl shadow-lg p-12 text-center">
        <i class="fas fa-exclamation-circle text-5xl text-red-500 mb-4"></i>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Không tìm thấy thông báo</h3>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <button
          @click="goBack"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Quay lại danh sách
        </button>
      </div>

      <!-- Notification Detail -->
      <div v-else-if="notification" class="bg-white rounded-xl shadow-lg overflow-hidden">
        <!-- Header with Status Badge -->
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-4xl">{{ getNotificationIcon(notification.type) }}</span>
                <div>
                  <h1 class="text-2xl font-bold text-white">
                    {{ notification.title }}
                  </h1>
                  <p class="text-blue-100 text-sm mt-1">
                    {{ formatDate(notification.createdAt) }}
                  </p>
                </div>
              </div>
            </div>
            <span
              v-if="!notification.is_read"
              class="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-full"
            >
              Mới
            </span>
          </div>
        </div>

        <!-- Content -->
        <div class="p-8">
          <!-- Main Message -->
          <div class="mb-8">
            <h2 class="text-lg font-semibold text-gray-900 mb-3">Nội dung thông báo</h2>
            <p class="text-gray-700 leading-relaxed text-base">
              {{ notification.message }}
            </p>
          </div>

          <!-- Notification Details -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-tag text-blue-600"></i>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Loại thông báo</p>
                  <p class="font-semibold text-gray-900">{{ getNotificationTypeName(notification.type) }}</p>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-clock text-green-600"></i>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Thời gian</p>
                  <p class="font-semibold text-gray-900">{{ formatFullDate(notification.createdAt) }}</p>
                </div>
              </div>
            </div>

            <div v-if="notification.order_id" class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-shopping-cart text-purple-600"></i>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Mã đơn hàng</p>
                  <p class="font-semibold text-gray-900">
                    {{ notification.metadata?.orderId || '#' + notification.order_id }}
                  </p>
                </div>
              </div>
            </div>

            <div v-if="notification.metadata?.total" class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-dollar-sign text-yellow-600"></i>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Tổng giá trị</p>
                  <p class="font-semibold text-gray-900">{{ formatPrice(notification.metadata.total) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Additional Metadata -->
          <div v-if="hasAdditionalInfo" class="mb-8">
            <h2 class="text-lg font-semibold text-gray-900 mb-3">Thông tin bổ sung</h2>
            <div class="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div class="space-y-2">
                <div v-if="notification.metadata?.customerName">
                  <span class="text-sm text-gray-600">Khách hàng:</span>
                  <span class="ml-2 font-medium text-gray-900">{{ notification.metadata.customerName }}</span>
                </div>
                <div v-if="notification.metadata?.cancelReason">
                  <span class="text-sm text-gray-600">Lý do hủy:</span>
                  <span class="ml-2 font-medium text-gray-900">{{ notification.metadata.cancelReason }}</span>
                </div>
                <div v-if="notification.metadata?.cancelledBy">
                  <span class="text-sm text-gray-600">Hủy bởi:</span>
                  <span class="ml-2 font-medium text-gray-900">{{ notification.metadata.cancelledBy }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-wrap gap-3">
            <button
              v-if="notification.order_id"
              @click="viewOrder"
              class="flex-1 sm:flex-initial px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <i class="fas fa-eye"></i>
              Xem đơn hàng
            </button>

            <button
              v-if="!notification.is_read"
              @click="markAsRead"
              class="flex-1 sm:flex-initial px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <i class="fas fa-check"></i>
              Đánh dấu đã đọc
            </button>

            <button
              @click="deleteNotification"
              class="flex-1 sm:flex-initial px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <i class="fas fa-trash-alt"></i>
              Xóa thông báo
            </button>
          </div>
        </div>
      </div>

      <!-- Related Notifications -->
      <div v-if="relatedNotifications.length > 0" class="mt-8">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Thông báo liên quan</h2>
        <div class="space-y-3">
          <button
            v-for="related in relatedNotifications"
            :key="related._id"
            @click="viewNotification(related._id)"
            class="w-full bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-4 text-left"
            :class="{ 'border-l-4 border-blue-500': !related.is_read }"
          >
            <div class="flex items-start gap-3">
              <span class="text-2xl">{{ getNotificationIcon(related.type) }}</span>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-900 mb-1">{{ related.title }}</h3>
                <p class="text-sm text-gray-600 line-clamp-2">{{ related.message }}</p>
                <p class="text-xs text-gray-400 mt-2">{{ formatDate(related.createdAt) }}</p>
              </div>
              <i class="fas fa-chevron-right text-gray-400"></i>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notificationStore'
import { format, formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

const route = useRoute()
const router = useRouter()
const notificationStore = useNotificationStore()

const notification = ref(null)
const loading = ref(true)
const error = ref(null)

const notificationId = computed(() => route.params.id)

const hasAdditionalInfo = computed(() => {
  const meta = notification.value?.metadata
  return meta?.customerName || meta?.cancelReason || meta?.cancelledBy
})

const relatedNotifications = computed(() => {
  if (!notification.value) return []
  
  // Lấy các thông báo cùng đơn hàng
  return notificationStore.notifications
    .filter(n => 
      n._id !== notification.value._id && 
      n.order_id === notification.value.order_id
    )
    .slice(0, 3)
})

const getNotificationIcon = (type) => {
  const icons = {
    order_created: "🛍️",
    order_confirmed: "✅",
    order_processing: "📦",
    order_shipping: "🚚",
    order_delivered: "🎉",
    order_cancelled: "❌",
    payment_success: "💳",
    payment_failed: "⚠️",
  }
  return icons[type] || "🔔"
}

const getNotificationTypeName = (type) => {
  const names = {
    'order_created': 'Đơn hàng mới',
    'order_confirmed': 'Đã xác nhận',
    'order_processing': 'Đang xử lý',
    'order_shipping': 'Đang giao',
    'order_delivered': 'Đã giao',
    'order_cancelled': 'Đã hủy',
    'payment_success': 'Thanh toán thành công',
    'payment_failed': 'Thanh toán thất bại'
  }
  return names[type] || 'Thông báo'
}

const formatDate = (date) => {
  if (!date) return '';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi })
  } catch (error) {
    return 'Vừa xong';
  }
}

const formatFullDate = (date) => {
  if (!date) return '';
  try {
    return format(new Date(date), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi })
  } catch (error) {
    return '';
  }
}

const formatPrice = (price) => {
  if (!price) return '0đ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

const goBack = () => {
  // Kiểm tra xem có lịch sử trước đó không
  if (window.history.length > 1) {
    router.back()
  } else {
    // Nếu không có lịch sử, quay về trang chủ
    router.push('/')
  }
}

const viewOrder = () => {
  if (notification.value?.order_id) {
    // Convert ObjectId to string if needed
    const orderId = notification.value.order_id
    const id = typeof orderId === 'object' ? orderId._id || orderId.toString() : orderId
    router.push(`/order-detail/${id}`)
  }
}

const viewNotification = (id) => {
  router.push(`/notifications/${id}`)
}

const markAsRead = async () => {
  try {
    await notificationStore.markAsRead(notification.value._id)
    notification.value.is_read = true
  } catch (error) {
    console.error('Error marking as read:', error)
  }
}

const deleteNotification = async () => {
  if (!confirm('Bạn có chắc chắn muốn xóa thông báo này?')) return
  
  try {
    await notificationStore.deleteNotification(notification.value._id)
    router.push('/notifications')
  } catch (error) {
    console.error('Error deleting notification:', error)
  }
}

const loadNotification = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Tìm trong store trước
    const found = notificationStore.notifications.find(n => n._id === notificationId.value)
    
    if (found) {
      notification.value = found
      
      // Tự động đánh dấu đã đọc
      if (!found.is_read) {
        await notificationStore.markAsRead(found._id)
      }
    } else {
      // Nếu không có trong store, fetch lại
      await notificationStore.fetchNotifications()
      const found2 = notificationStore.notifications.find(n => n._id === notificationId.value)
      
      if (found2) {
        notification.value = found2
        if (!found2.is_read) {
          await notificationStore.markAsRead(found2._id)
        }
      } else {
        error.value = 'Thông báo không tồn tại hoặc đã bị xóa'
      }
    }
  } catch (err) {
    console.error('Error loading notification:', err)
    error.value = 'Có lỗi xảy ra khi tải thông báo'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadNotification()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
