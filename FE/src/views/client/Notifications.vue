<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white shadow-lg rounded-lg overflow-hidden">
        <!-- Header -->
        <div class="bg-blue-600 px-6 py-4">
          <h1 class="text-2xl font-bold text-white">Thông báo</h1>
        </div>

        <!-- Notifications List -->
        <div class="divide-y divide-gray-200">
          <div
            v-for="notification in notifications"
            :key="notification._id"
            class="p-6 hover:bg-gray-50 transition-colors duration-200"
            :class="{ 'bg-blue-50': !notification.is_read }"
          >
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center"
                  :class="getNotificationIconClass(notification.type)"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      v-if="notification.type.includes('order')"
                      d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
                    />
                    <path
                      v-else-if="notification.type.includes('payment')"
                      d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                    />
                    <path
                      v-else
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              
              <div class="ml-4 flex-1 cursor-pointer" @click="viewDetail(notification._id)">
                <div class="flex items-center justify-between">
                  <h3 class="text-sm font-medium text-gray-900">
                    {{ notification.title }}
                  </h3>
                  <div class="flex items-center space-x-2">
                    <span class="text-xs text-gray-500">
                      {{ formatDate(notification.createdAt) }}
                    </span>
                    <div
                      v-if="!notification.is_read"
                      class="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
                    ></div>
                  </div>
                </div>
                <p class="mt-1 text-sm text-gray-600 line-clamp-2">
                  {{ notification.message }}
                </p>
                <div class="mt-2 flex space-x-2">
                  <button
                    @click.stop="viewDetail(notification._id)"
                    class="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    <i class="fas fa-eye"></i>
                    Xem chi tiết
                  </button>
                  <button
                    v-if="!notification.is_read"
                    @click.stop="markAsRead(notification._id)"
                    class="text-xs text-green-600 hover:text-green-800"
                  >
                    <i class="fas fa-check"></i>
                    Đánh dấu đã đọc
                  </button>
                  <button
                    v-if="notification.order_id"
                    @click.stop="viewOrder(notification.order_id)"
                    class="text-xs text-purple-600 hover:text-purple-800 font-medium"
                  >
                    <i class="fas fa-shopping-cart"></i>
                    Xem đơn hàng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="notifications.length === 0" class="p-8 text-center">
          <svg
            class="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 17h5l-5 5v-5zM7 7h.01M7 3h5l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"
            />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Không có thông báo</h3>
          <p class="mt-1 text-sm text-gray-500">
            Bạn chưa có thông báo nào.
          </p>
        </div>

        <!-- Actions -->
        <div class="bg-gray-50 px-6 py-3">
          <div class="flex justify-between items-center">
            <button
              @click="markAllAsRead"
              class="text-sm text-blue-600 hover:text-blue-800"
              :disabled="!hasUnreadNotifications"
            >
              Đánh dấu tất cả đã đọc
            </button>
            <button
              @click="clearAll"
              class="text-sm text-red-600 hover:text-red-800"
            >
              Xóa tất cả
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notificationStore'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

const router = useRouter()
const notificationStore = useNotificationStore()

const notifications = computed(() => notificationStore.notifications)

const hasUnreadNotifications = computed(() => {
  return notificationStore.unreadCount > 0
})

const getNotificationIconClass = (type) => {
  const typeMap = {
    'order_created': 'bg-blue-100 text-blue-600',
    'order_confirmed': 'bg-green-100 text-green-600',
    'order_processing': 'bg-purple-100 text-purple-600',
    'order_shipping': 'bg-indigo-100 text-indigo-600',
    'order_delivered': 'bg-green-100 text-green-600',
    'order_cancelled': 'bg-red-100 text-red-600',
    'payment_success': 'bg-emerald-100 text-emerald-600',
    'payment_failed': 'bg-red-100 text-red-600'
  }
  return typeMap[type] || 'bg-gray-100 text-gray-600'
}

const formatDate = (date) => {
  if (!date) return '';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi })
  } catch (error) {
    console.error('Error formatting date:', date, error);
    return 'Vừa xong';
  }
}

const markAsRead = async (id) => {
  await notificationStore.markAsRead(id)
}

const markAllAsRead = async () => {
  await notificationStore.markAllAsRead()
}

const clearAll = async () => {
  if (confirm('Bạn có chắc chắn muốn xóa tất cả thông báo?')) {
    // Delete all notifications one by one
    const allNotifications = [...notifications.value]
    for (const notification of allNotifications) {
      await notificationStore.deleteNotification(notification._id)
    }
  }
}

const viewDetail = (id) => {
  router.push(`/notifications/${id}`)
}

const viewOrder = (orderId) => {
  // Convert ObjectId to string if needed
  let id = orderId
  
  if (typeof orderId === 'object') {
    // Nếu là object (được populate), lấy _id
    id = orderId._id || orderId.id || String(orderId)
  }
  
  console.log('Navigating to order:', id, 'from:', orderId)
  router.push(`/order-detail/${id}`)
}

const handleAction = (notification) => {
  // Click vào thông báo sẽ xem chi tiết
  viewDetail(notification._id)
}

onMounted(async () => {
  await notificationStore.fetchNotifications()
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
