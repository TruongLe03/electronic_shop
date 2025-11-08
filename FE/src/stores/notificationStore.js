import { defineStore } from "pinia";
import { ref, computed } from "vue";
import notificationService from "../api/notificationService";

export const useNotificationStore = defineStore("notification", () => {
  // State
  const notifications = ref([]);
  const unreadCount = ref(0);
  const loading = ref(false);
  const error = ref(null);
  const currentPage = ref(1);
  const totalPages = ref(1);

  // Getters
  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.is_read)
  );

  const readNotifications = computed(() => 
    notifications.value.filter(n => n.is_read)
  );

  // Actions
  const fetchNotifications = async (page = 1) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await notificationService.getNotifications(page);
      
      if (response.success) {
        notifications.value = response.data.notifications;
        unreadCount.value = response.data.unreadCount;
        currentPage.value = response.data.pagination.page;
        totalPages.value = response.data.pagination.totalPages;
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      error.value = err.message || "Không thể tải thông báo";
    } finally {
      loading.value = false;
    }
  };

  const fetchUnreadCount = async () => {
    try {
      console.log("Fetching unread count...");
      const response = await notificationService.getUnreadCount();
      console.log("Unread count response:", response);
      if (response.success) {
        unreadCount.value = response.data.unreadCount;
        console.log("Unread count:", unreadCount.value);
      }
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await notificationService.markAsRead(notificationId);
      
      if (response.success) {
        // Update local state
        const notification = notifications.value.find(n => n._id === notificationId);
        if (notification) {
          notification.is_read = true;
          unreadCount.value = Math.max(0, unreadCount.value - 1);
        }
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
      throw err;
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();
      
      if (response.success) {
        // Update local state
        notifications.value.forEach(n => {
          n.is_read = true;
        });
        unreadCount.value = 0;
      }
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      throw err;
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await notificationService.deleteNotification(notificationId);
      
      if (response.success) {
        // Remove from local state
        const index = notifications.value.findIndex(n => n._id === notificationId);
        if (index !== -1) {
          const wasUnread = !notifications.value[index].is_read;
          notifications.value.splice(index, 1);
          if (wasUnread) {
            unreadCount.value = Math.max(0, unreadCount.value - 1);
          }
        }
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
      throw err;
    }
  };

  const reset = () => {
    notifications.value = [];
    unreadCount.value = 0;
    loading.value = false;
    error.value = null;
    currentPage.value = 1;
    totalPages.value = 1;
  };

  return {
    // State
    notifications,
    unreadCount,
    loading,
    error,
    currentPage,
    totalPages,

    // Getters
    unreadNotifications,
    readNotifications,

    // Actions
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    reset,
  };
});
