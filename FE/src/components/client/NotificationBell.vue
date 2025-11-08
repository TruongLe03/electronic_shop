<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useNotificationStore } from "../../stores/notificationStore";
import { useRouter } from "vue-router";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { clickOutside as vClickOutside } from "../../directives/clickOutside";

const notificationStore = useNotificationStore();
const router = useRouter();

const showDropdown = ref(false);
let pollInterval = null;

// Computed
const hasUnread = computed(() => notificationStore.unreadCount > 0);
const displayCount = computed(() => {
  const count = notificationStore.unreadCount;
  return count > 99 ? "99+" : count;
});

// Methods
const toggleDropdown = () => {
  console.log("Toggle dropdown clicked. Current state:", showDropdown.value);
  showDropdown.value = !showDropdown.value;
  console.log("New state:", showDropdown.value);
  
  if (showDropdown.value && notificationStore.notifications.length === 0) {
    console.log("Fetching notifications...");
    notificationStore.fetchNotifications();
  }
};

const closeDropdown = () => {
  showDropdown.value = false;
};

const formatTime = (date) => {
  return formatDistanceToNow(new Date(date), { 
    addSuffix: true, 
    locale: vi 
  });
};

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
  };
  return icons[type] || "🔔";
};

const handleNotificationClick = async (notification) => {
  try {
    // Đánh dấu đã đọc
    if (!notification.is_read) {
      await notificationStore.markAsRead(notification._id);
    }

    // Điều hướng đến trang chi tiết đơn hàng
    if (notification.order_id) {
      closeDropdown();
      router.push(`/orders/${notification.order_id}`);
    }
  } catch (error) {
    console.error("Error handling notification click:", error);
  }
};

const handleMarkAllAsRead = async () => {
  try {
    await notificationStore.markAllAsRead();
  } catch (error) {
    console.error("Error marking all as read:", error);
  }
};

const handleDelete = async (notificationId, event) => {
  event.stopPropagation();
  try {
    await notificationStore.deleteNotification(notificationId);
  } catch (error) {
    console.error("Error deleting notification:", error);
  }
};

// Lifecycle
onMounted(() => {
  console.log("NotificationBell mounted");
  // Fetch unread count on mount
  notificationStore.fetchUnreadCount();

  // Poll for new notifications every 30 seconds
  pollInterval = setInterval(() => {
    notificationStore.fetchUnreadCount();
  }, 30000);
});

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval);
  }
});
</script>

<template>
  <div class="relative flex flex-col items-center">
    <!-- Bell Icon with Label - Same style as Cart -->
    <button
      @click.stop="toggleDropdown"
      class="flex flex-col items-center group"
      aria-label="Thông báo"
      type="button"
    >
      <div class="relative">
        <i
          class="fas fa-bell text-lg md:text-xl text-gray-600 group-hover:text-blue-600 transition-colors"
        ></i>
        <!-- Badge -->
        <span
          v-if="hasUnread"
          class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center"
        >
          {{ displayCount }}
        </span>
      </div>
      <span
        class="text-xs text-gray-600 mt-1 hidden md:block group-hover:text-blue-600 transition-colors"
      >
        Thông báo
      </span>
    </button>

    <!-- Dropdown Modal -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 scale-95 translate-y-2"
      enter-to-class="transform opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="transform opacity-100 scale-100 translate-y-0"
      leave-to-class="transform opacity-0 scale-95 translate-y-2"
    >
      <div
        v-if="showDropdown"
        v-click-outside="closeDropdown"
        class="absolute right-0 mt-3 w-[380px] max-w-[calc(100vw-1rem)] md:w-[420px] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[9999]"
        style="top: 100%;"
      >
        <!-- Header với gradient -->
        <div class="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div class="flex items-center gap-2">
            <i class="fas fa-bell text-lg"></i>
            <h3 class="text-lg font-bold">Thông báo</h3>
            <span v-if="hasUnread" class="ml-2 px-2 py-0.5 bg-white bg-opacity-30 rounded-full text-xs font-semibold">
              {{ displayCount }} mới
            </span>
          </div>
          <button
            v-if="hasUnread"
            @click.stop="handleMarkAllAsRead"
            class="text-sm text-white hover:text-blue-100 transition-colors font-medium flex items-center gap-1"
            title="Đánh dấu tất cả đã đọc"
          >
            <i class="fas fa-check-double text-xs"></i>
            <span class="hidden sm:inline">Đọc hết</span>
          </button>
        </div>

        <!-- Notifications List -->
        <div class="max-h-[420px] overflow-y-auto custom-scrollbar bg-gray-50">
          <!-- Loading State -->
          <div v-if="notificationStore.loading" class="p-10 text-center">
            <div class="animate-spin rounded-full h-10 w-10 border-3 border-blue-500 border-t-transparent mx-auto mb-3"></div>
            <p class="text-sm text-gray-500">Đang tải thông báo...</p>
          </div>

          <!-- Empty State -->
          <div
            v-else-if="notificationStore.notifications.length === 0"
            class="p-12 text-center"
          >
            <div class="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <i class="fas fa-bell-slash text-3xl text-gray-300"></i>
            </div>
            <p class="text-gray-600 font-medium mb-1">Chưa có thông báo</p>
            <p class="text-sm text-gray-400">Thông báo của bạn sẽ hiển thị tại đây</p>
          </div>

          <!-- Notifications Items -->
          <div v-else class="divide-y divide-gray-100">
            <button
              v-for="notification in notificationStore.notifications"
              :key="notification._id"
              @click.stop="handleNotificationClick(notification)"
              class="w-full text-left px-5 py-4 bg-white hover:bg-blue-50 transition-all duration-200 group"
              :class="{ 
                'bg-blue-50 bg-opacity-50 border-l-4 border-blue-500': !notification.is_read,
                'hover:shadow-sm': true
              }"
            >
              <div class="flex items-start gap-3">
                <!-- Icon with background -->
                <div class="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  <span class="text-xl">
                    {{ getNotificationIcon(notification.type) }}
                  </span>
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2 mb-1">
                    <p class="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {{ notification.title }}
                    </p>
                    <span
                      v-if="!notification.is_read"
                      class="flex-shrink-0 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"
                    ></span>
                  </div>
                  <p class="text-sm text-gray-600 mb-2 line-clamp-2 leading-relaxed">
                    {{ notification.message }}
                  </p>
                  <div class="flex items-center justify-between">
                    <p class="text-xs text-gray-400 flex items-center gap-1">
                      <i class="far fa-clock"></i>
                      {{ formatTime(notification.createdAt) }}
                    </p>
                    <button
                      @click.stop="handleDelete(notification._id, $event)"
                      class="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Xóa thông báo"
                    >
                      <i class="fas fa-trash-alt text-xs"></i>
                    </button>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Footer - Show notification count -->
        <div v-if="notificationStore.notifications.length > 0" class="px-5 py-2 bg-gray-50 border-t border-gray-100 text-center">
          <p class="text-xs text-gray-500">
            Hiển thị {{ notificationStore.notifications.length }} thông báo gần nhất
          </p>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Animation cho unread badge */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
