<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";
import { useNotification } from "@/composables/client/useNotification";
import { useNotificationStore } from "@/stores/notificationStore";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const sidebarOpen = ref(true);
const darkMode = ref(false);
const showNotifications = ref(false);
const showProfileMenu = ref(false);

let pollInterval = null;

// Computed để lấy data thật
const notifications = computed(() => notificationStore.notifications.slice(0, 5)); // Chỉ lấy 5 thông báo gần nhất
const unreadCount = computed(() => notificationStore.unreadCount);

const formatTime = (date) => {
  if (!date) return '';
  try {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: vi 
    });
  } catch (error) {
    console.error('Error formatting date:', date, error);
    return 'Vừa xong';
  }
};

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
  if (showNotifications.value && notificationStore.notifications.length === 0) {
    notificationStore.fetchNotifications();
  }
};

const handleNotificationClick = async (notification) => {
  // Đánh dấu đã đọc
  if (!notification.is_read) {
    await notificationStore.markAsRead(notification._id);
  }
  
  // Chuyển đến trang đơn hàng
  showNotifications.value = false;
  if (notification.order_id) {
    router.push(`/admin/orders`);
  }
};

// Lifecycle
onMounted(() => {
  notificationStore.fetchUnreadCount();
  
  // Poll mỗi 30 giây
  pollInterval = setInterval(() => {
    notificationStore.fetchUnreadCount();
  }, 30000);
});

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval);
  }
});

const menuItems = [
  {
    name: "Dashboard",
    icon: "fas fa-tachometer-alt",
    path: "/admin",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name: "Sản phẩm",
    icon: "fas fa-box",
    path: "/admin/products",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    name: "Danh mục",
    icon: "fas fa-tags",
    path: "/admin/categories",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    name: "Đơn hàng",
    icon: "fas fa-shopping-cart",
    path: "/admin/orders",
    gradient: "from-orange-500 to-red-500",
  },
  {
    name: "Người dùng",
    icon: "fas fa-users",
    path: "/admin/users",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    name: "Kho hàng",
    icon: "fas fa-warehouse",
    path: "/admin/inventory",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    name: "Thanh toán",
    icon: "fas fa-credit-card",
    path: "/admin/payments",
    gradient: "from-pink-500 to-red-500",
  },
  {
    name: "Thống kê",
    icon: "fas fa-chart-bar",
    path: "/admin/statistics",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    name: "Cài đặt",
    icon: "fas fa-cog",
    path: "/admin/settings",
    gradient: "from-gray-500 to-gray-600",
  },
];

const currentPageTitle = computed(() => {
  const item = menuItems.find((item) => item.path === route.path);
  return item?.name || "Admin Panel";
});

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value;
  document.documentElement.classList.toggle("dark", darkMode.value);
  // Close profile menu after toggling
  showProfileMenu.value = false;
};

const logout = async () => {
  // Close profile menu
  showProfileMenu.value = false;

  // Thông báo đăng xuất
  const { notifyLogout } = useNotification();
  notifyLogout();

  // Đăng xuất
  authStore.logout();

  // Delay 2.5 giây trước khi chuyển về trang đăng nhập
  setTimeout(() => {
    router.push("/login");
  }, 2500);
};

const isActiveRoute = (path) => {
  // Exact match for dashboard
  if (path === "/admin" && route.path === "/admin") {
    return true;
  }

  // For other routes, check if current path starts with the menu path
  // but avoid matching dashboard with other admin routes
  if (path !== "/admin" && route.path.startsWith(path)) {
    return true;
  }

  return false;
};

const navigateTo = async (path) => {
  try {
    console.log("Navigating to:", path);
    console.log("Current route:", route.path);

    // Check if we're already on this route
    if (route.path === path) {
      console.log("Already on target route");
      return;
    }

    console.log("Attempting router.push...");
    const result = await router.push(path);
    console.log("Navigation successful:", result);
  } catch (err) {
    console.error("Navigation error details:", {
      message: err.message,
      name: err.name,
      stack: err.stack,
      type: err.type,
    });

    // Fallback: try window.location if router fails
    if (path.startsWith("/admin")) {
      console.log("Fallback: using window.location");
      window.location.href = path;
    }
  }
};
</script>

<template>
  <div
    :class="[
      'min-h-screen transition-colors duration-300',
      darkMode ? 'dark bg-gray-900' : 'bg-white',
    ]"
  >
    <!-- Sidebar -->
    <div
      :class="[
        'fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out',
        sidebarOpen ? 'w-72' : 'w-20',
      ]"
    >
      <!-- Sidebar Background with Glassmorphism -->
      <div
        :class="[
          'h-full backdrop-blur-lg border-r shadow-2xl',
          darkMode
            ? 'bg-gray-800/90 border-gray-700'
            : 'bg-white/80 border-white/20',
        ]"
      >
        <!-- Logo Section -->
        <div class="flex items-center justify-between p-6">
          <div
            :class="[
              'flex items-center space-x-3 transition-all duration-300',
              sidebarOpen ? 'opacity-100' : 'opacity-0',
            ]"
          >
            <div
              class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            >
              ES
            </div>
            <div v-if="sidebarOpen">
              <h1
                :class="[
                  'font-bold text-lg',
                  darkMode ? 'text-white' : 'text-gray-800',
                ]"
              >
                Electronic Shop
              </h1>
              <p
                :class="[
                  'text-sm',
                  darkMode ? 'text-gray-400' : 'text-gray-500',
                ]"
              >
                Admin Panel
              </p>
            </div>
          </div>

          <button
            @click="toggleSidebar"
            :class="[
              'p-2 rounded-lg transition-colors hover:scale-110 transform duration-200',
              darkMode
                ? 'hover:bg-gray-700 text-gray-400'
                : 'hover:bg-gray-100 text-gray-600',
            ]"
          >
            <i
              :class="
                sidebarOpen ? 'fas fa-chevron-left' : 'fas fa-chevron-right'
              "
              class="text-lg"
            ></i>
          </button>
        </div>

        <!-- Navigation Menu -->
        <nav class="px-4 space-y-2">
          <button
            v-for="item in menuItems"
            :key="item.path"
            @click="navigateTo(item.path)"
            :class="[
              'group flex items-center px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden w-full text-left',
              isActiveRoute(item.path)
                ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg transform scale-105`
                : darkMode
                ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                : 'text-gray-600 hover:bg-white/60 hover:text-gray-800 hover:shadow-md',
            ]"
          >
            <!-- Active indicator -->
            <div
              v-if="isActiveRoute(item.path)"
              class="absolute inset-0 bg-white/10 backdrop-blur"
            ></div>

            <i :class="`${item.icon} text-xl mr-4 relative z-10`"></i>
            <span
              v-if="sidebarOpen"
              class="font-medium relative z-10 transition-all duration-300"
            >
              {{ item.name }}
            </span>

            <!-- Hover effect -->
            <div
              :class="[
                'absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300',
                item.gradient,
              ]"
            ></div>
          </button>
        </nav>
      </div>
    </div>

    <!-- Main Content -->
    <div
      :class="['transition-all duration-300', sidebarOpen ? 'ml-72' : 'ml-20']"
    >
      <!-- Top Header -->
      <header
        :class="[
          'backdrop-blur-lg border-b shadow-sm sticky top-0 z-40',
          darkMode
            ? 'bg-gray-800/90 border-gray-700'
            : 'bg-white/80 border-white/20',
        ]"
      >
        <div class="px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1
                :class="[
                  'text-2xl font-bold',
                  darkMode ? 'text-white' : 'text-gray-800',
                ]"
              >
                {{ currentPageTitle }}
              </h1>
              <p
                :class="[
                  'text-sm mt-1',
                  darkMode ? 'text-gray-400' : 'text-gray-500',
                ]"
              >
                Quản lý và theo dõi hoạt động cửa hàng
              </p>
            </div>

            <div class="flex items-center space-x-4">
              <!-- Search -->
              <div class="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  :class="[
                    'w-80 pl-10 pr-4 py-2 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500',
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white/80 border-gray-200 text-gray-800 placeholder-gray-500',
                  ]"
                />
                <i
                  class="fas fa-search absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                ></i>
              </div>

              <!-- Notifications -->
              <div class="relative">
                <button
                  @click.stop="toggleNotifications"
                  :class="[
                    'relative p-3 rounded-xl transition-all duration-200 hover:scale-110 transform',
                    darkMode
                      ? 'hover:bg-gray-700 text-gray-400'
                      : 'hover:bg-white/60 text-gray-600 hover:shadow-md',
                  ]"
                >
                  <i class="fas fa-bell text-xl"></i>
                  <span
                    v-if="unreadCount > 0"
                    class="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse"
                  >
                    {{ unreadCount > 99 ? '99+' : unreadCount }}
                  </span>
                </button>

                <!-- Notifications Dropdown -->
                <transition name="dropdown">
                  <div
                    v-if="showNotifications"
                    :class="[
                      'absolute right-0 mt-2 w-96 rounded-xl shadow-2xl border backdrop-blur-lg z-50 max-h-[500px] overflow-hidden',
                      darkMode
                        ? 'bg-gray-800/95 border-gray-700'
                        : 'bg-white/95 border-white/20',
                    ]"
                  >
                    <!-- Header -->
                    <div class="px-4 py-3 border-b bg-gradient-to-r from-blue-500 to-purple-600">
                      <h3 class="font-bold text-white flex items-center gap-2">
                        <i class="fas fa-bell"></i>
                        Thông báo Admin
                        <span v-if="unreadCount > 0" class="ml-auto px-2 py-0.5 bg-white/30 rounded-full text-xs">
                          {{ unreadCount }} mới
                        </span>
                      </h3>
                    </div>

                    <!-- Loading State -->
                    <div v-if="notificationStore.loading" class="p-8 text-center">
                      <div class="animate-spin rounded-full h-8 w-8 border-3 border-blue-500 border-t-transparent mx-auto mb-2"></div>
                      <p class="text-sm text-gray-500">Đang tải...</p>
                    </div>

                    <!-- Empty State -->
                    <div v-else-if="notifications.length === 0" class="p-8 text-center">
                      <i class="fas fa-bell-slash text-4xl text-gray-300 mb-2"></i>
                      <p :class="['text-sm', darkMode ? 'text-gray-400' : 'text-gray-600']">
                        Chưa có thông báo
                      </p>
                    </div>

                    <!-- Notifications List -->
                    <div v-else class="max-h-[400px] overflow-y-auto">
                      <button
                        v-for="notification in notifications"
                        :key="notification._id"
                        @click.stop="handleNotificationClick(notification)"
                        :class="[
                          'w-full p-4 border-b transition-colors cursor-pointer text-left hover:bg-blue-50/50',
                          darkMode
                            ? 'border-gray-700 hover:bg-gray-700/50'
                            : 'border-gray-100',
                          !notification.is_read ? 'bg-blue-50/30 dark:bg-gray-700/30 border-l-4 border-l-blue-500' : ''
                        ]"
                      >
                        <div class="flex items-start gap-3">
                          <div class="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center">
                            <i class="fas fa-shopping-cart text-blue-600 dark:text-blue-400"></i>
                          </div>
                          <div class="flex-1 min-w-0">
                            <p
                              :class="[
                                'text-sm font-semibold mb-1',
                                darkMode ? 'text-white' : 'text-gray-900',
                              ]"
                            >
                              {{ notification.title }}
                            </p>
                            <p
                              :class="[
                                'text-xs mb-1 line-clamp-2',
                                darkMode ? 'text-gray-300' : 'text-gray-600',
                              ]"
                            >
                              {{ notification.message }}
                            </p>
                            <p
                              :class="[
                                'text-xs flex items-center gap-1',
                                darkMode ? 'text-gray-400' : 'text-gray-400',
                              ]"
                            >
                              <i class="far fa-clock"></i>
                              {{ formatTime(notification.createdAt) }}
                            </p>
                          </div>
                          <span
                            v-if="!notification.is_read"
                            class="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                          ></span>
                        </div>
                      </button>
                    </div>
                  </div>
                </transition>
              </div>

              <!-- User Profile Section (moved from sidebar) -->
              <div class="relative">
                <button
                  @click="showProfileMenu = !showProfileMenu"
                  class="flex items-center space-x-3 p-2 rounded-xl transition-all duration-200 hover:bg-white/60 hover:shadow-md"
                >
                  <img
                    class="w-10 h-10 rounded-full ring-2 ring-blue-500/50"
                    :src="`https://ui-avatars.com/api/?name=${
                      authStore.user?.name || 'Admin'
                    }&background=6366f1&color=fff`"
                    :alt="authStore.user?.name || 'Admin'"
                  />
                  <div class="text-left">
                    <p
                      :class="[
                        'font-medium text-sm',
                        darkMode ? 'text-white' : 'text-gray-800',
                      ]"
                    >
                      {{ authStore.user?.name || "Admin" }}
                    </p>
                    <p
                      :class="[
                        'text-xs',
                        darkMode ? 'text-gray-400' : 'text-gray-500',
                      ]"
                    >
                      {{ authStore.user?.email || "admin@shop.com" }}
                    </p>
                  </div>
                  <i class="fas fa-chevron-down text-sm text-gray-400"></i>
                </button>

                <!-- Profile Dropdown -->
                <transition name="dropdown">
                  <div
                    v-if="showProfileMenu"
                    :class="[
                      'absolute right-0 mt-2 w-64 rounded-xl shadow-2xl border backdrop-blur-lg z-50',
                      darkMode
                        ? 'bg-gray-800/95 border-gray-700'
                        : 'bg-white/95 border-white/20',
                    ]"
                  >
                    <div class="p-4">
                      <div
                        class="flex items-center space-x-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-600"
                      >
                        <img
                          class="w-12 h-12 rounded-full ring-2 ring-blue-500/50"
                          :src="`https://ui-avatars.com/api/?name=${
                            authStore.user?.name || 'Admin'
                          }&background=6366f1&color=fff`"
                          :alt="authStore.user?.name || 'Admin'"
                        />
                        <div>
                          <p
                            :class="[
                              'font-medium',
                              darkMode ? 'text-white' : 'text-gray-800',
                            ]"
                          >
                            {{ authStore.user?.name || "Admin" }}
                          </p>
                          <p
                            :class="[
                              'text-sm',
                              darkMode ? 'text-gray-400' : 'text-gray-500',
                            ]"
                          >
                            {{ authStore.user?.email || "admin@shop.com" }}
                          </p>
                        </div>
                      </div>

                      <div class="space-y-2">
                        <button
                          @click="toggleDarkMode"
                          :class="[
                            'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
                            darkMode
                              ? 'hover:bg-gray-700 text-gray-300'
                              : 'hover:bg-gray-100 text-gray-700',
                          ]"
                        >
                          <i
                            :class="darkMode ? 'fas fa-sun' : 'fas fa-moon'"
                          ></i>
                          <span>{{
                            darkMode ? "Chế độ sáng" : "Chế độ tối"
                          }}</span>
                        </button>

                        <button
                          @click="logout"
                          class="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors text-left"
                        >
                          <i class="fas fa-sign-out-alt"></i>
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.dark ::-webkit-scrollbar-thumb {
  background: #4b5563;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
