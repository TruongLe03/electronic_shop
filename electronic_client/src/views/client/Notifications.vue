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
            :key="notification.id"
            class="p-6 hover:bg-gray-50 transition-colors duration-200"
            :class="{ 'bg-blue-50': !notification.read }"
          >
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center"
                  :class="getNotificationIconClass(notification.type)"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      v-if="notification.type === 'order'"
                      d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
                    />
                    <path
                      v-else-if="notification.type === 'promotion'"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                    <path
                      v-else
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              
              <div class="ml-4 flex-1">
                <div class="flex items-center justify-between">
                  <h3 class="text-sm font-medium text-gray-900">
                    {{ notification.title }}
                  </h3>
                  <div class="flex items-center space-x-2">
                    <span class="text-xs text-gray-500">
                      {{ formatDate(notification.createdAt) }}
                    </span>
                    <div
                      v-if="!notification.read"
                      class="w-2 h-2 bg-blue-600 rounded-full"
                    ></div>
                  </div>
                </div>
                <p class="mt-1 text-sm text-gray-600">
                  {{ notification.message }}
                </p>
                <div class="mt-2 flex space-x-2">
                  <button
                    v-if="!notification.read"
                    @click="markAsRead(notification.id)"
                    class="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Đánh dấu đã đọc
                  </button>
                  <button
                    v-if="notification.actionUrl"
                    @click="handleAction(notification.actionUrl)"
                    class="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Xem chi tiết
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const notifications = ref([
  {
    id: 1,
    type: 'order',
    title: 'Đơn hàng đã được xác nhận',
    message: 'Đơn hàng #12345 của bạn đã được xác nhận và đang được chuẩn bị.',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    actionUrl: '/orders/12345'
  },
  {
    id: 2,
    type: 'promotion',
    title: 'Khuyến mãi đặc biệt',
    message: 'Giảm giá 20% cho tất cả sản phẩm điện tử. Áp dụng đến hết ngày mai!',
    read: false,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    actionUrl: '/products'
  },
  {
    id: 3,
    type: 'info',
    title: 'Cập nhật thông tin tài khoản',
    message: 'Vui lòng cập nhật thông tin liên hệ để được hỗ trợ tốt hơn.',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    actionUrl: '/profile'
  }
])

const hasUnreadNotifications = computed(() => {
  return notifications.value.some(n => !n.read)
})

const getNotificationIconClass = (type) => {
  switch (type) {
    case 'order':
      return 'bg-green-100 text-green-600'
    case 'promotion':
      return 'bg-yellow-100 text-yellow-600'
    case 'info':
      return 'bg-blue-100 text-blue-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

const formatDate = (date) => {
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) {
    return `${minutes} phút trước`
  } else if (hours < 24) {
    return `${hours} giờ trước`
  } else {
    return `${days} ngày trước`
  }
}

const markAsRead = (id) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.read = true
  }
}

const markAllAsRead = () => {
  notifications.value.forEach(notification => {
    notification.read = true
  })
}

const clearAll = () => {
  if (confirm('Bạn có chắc chắn muốn xóa tất cả thông báo?')) {
    notifications.value = []
  }
}

const handleAction = (url) => {
  router.push(url)
}

onMounted(() => {
  // Load notifications from API here
})
</script>
