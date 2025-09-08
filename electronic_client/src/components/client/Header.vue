<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@stores/auth";
import { useCartStore } from "@stores/cart";
import { useNotification } from "@composables/useNotification";

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();
const { user, isAuthenticated } = storeToRefs(authStore);
const { cartCount } = storeToRefs(cartStore);
const { notifyLogout, notifyClearCart } = useNotification();

const isMobileMenuOpen = ref(false);
const isMobileSearchOpen = ref(false);
const showUserMenu = ref(false);
const showNotificationMenu = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const toggleMobileSearch = () => {
  isMobileSearchOpen.value = !isMobileSearchOpen.value;
};

const handleLogout = () => {
  try {
    // Clear auth store
    authStore.logout();

    // Clear cart store
    cartStore.clearCart();

    // Close any open menus
    showUserMenu.value = false;
    showNotificationMenu.value = false;
    isMobileMenuOpen.value = false;

    // Show notification
    notifyLogout();

    // Navigate to home page
    router.push("/");
  } catch (error) {
    console.error("Logout error:", error);
    // Even if there's an error, still try to navigate to home
    router.push("/");
  }
};
const navigateToHome = () => {
  router.push("/");
};

const navigateToProfile = () => {
  router.push("/account");
  showUserMenu.value = false;
};

const navigateToCart = () => {
  router.push("/cart");
};

const navigateToNotifications = () => {
  router.push("/notifications");
  showNotificationMenu.value = false;
};

// Sample notifications data
const notifications = ref([
  {
    id: 1,
    title: "Đơn hàng đã được xác nhận",
    message: "Đơn hàng #12345 đã được xác nhận",
    time: "2 giờ trước",
    read: false,
  },
  {
    id: 2,
    title: "Khuyến mãi đặc biệt",
    message: "Giảm giá 20% cho tất cả sản phẩm",
    time: "6 giờ trước",
    read: false,
  },
  {
    id: 3,
    title: "Cập nhật thông tin",
    message: "Vui lòng cập nhật thông tin tài khoản",
    time: "1 ngày trước",
    read: true,
  },
]);

const unreadCount = computed(() => {
  return notifications.value.filter((n) => !n.read).length;
});

const markAsRead = (id) => {
  const notification = notifications.value.find((n) => n.id === id);
  if (notification) {
    notification.read = true;
  }
};

const toggleUserMenu = (event) => {
  event.stopPropagation();
  showUserMenu.value = !showUserMenu.value;
  showNotificationMenu.value = false;
};

const navigateToAdmin = () => {
  router.push("/admin");
  showUserMenu.value = false;
};

const toggleNotificationMenu = (event) => {
  event.stopPropagation();
  showNotificationMenu.value = !showNotificationMenu.value;
  showUserMenu.value = false;
};

// Add click outside handler
onMounted(() => {
  document.addEventListener("click", () => {
    if (showUserMenu.value) {
      showUserMenu.value = false;
    }
    if (showNotificationMenu.value) {
      showNotificationMenu.value = false;
    }
  });
});
</script>

<template>
  <header class="shadow">
    <!-- Top section -->
    <div class="bg-blue-300 text-white px-4 sm:px-6 py-3">
      <!-- Mobile Header -->
      <div
        @click="navigateToHome"
        class="flex items-center justify-between lg:hidden"
      >
        <div class="flex items-center gap-2">
          <img
            src="https://via.placeholder.com/40"
            alt="Logo"
            class="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
          />
          <span class="font-bold text-base sm:text-lg">Electronic Shop</span>
        </div>
        <div class="flex items-center gap-4">
          <button class="text-2xl" @click="toggleMobileSearch">🔍</button>
          <button class="text-2xl" @click="toggleMobileMenu">☰</button>
        </div>
      </div>

      <!-- Desktop Header -->
      <div class="hidden lg:flex items-center justify-between">
        <!-- Logo + Shop name -->
        <div @click="navigateToHome" class="flex items-center gap-2">
          <img
            src="https://via.placeholder.com/40"
            alt="Logo"
            class="rounded-full w-10 h-10"
          />
          <span class="font-bold text-lg">Electronic Shop</span>
        </div>

        <!-- Search bar -->
        <div class="flex-1 mx-12">
          <div class="max-w-xl mx-auto relative">
            <input
              type="text"
              placeholder="Search products..."
              class="w-full px-4 py-2 rounded-lg text-gray-800 focus:outline-none"
            />
            <button
              class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
            >
              🔍
            </button>
          </div>
        </div>
        <!-- Cart + Auth -->
        <div class="flex items-center gap-4">
          <!-- Notification Menu -->
          <div class="relative" v-if="isAuthenticated">
            <button
              @click="toggleNotificationMenu"
              class="flex items-center hover:opacity-80 relative focus:outline-none"
            >
              <img
                src="/assets/icons/notification.png"
                alt="Notification Icon"
                class="w-6 h-6"
              />
              <span
                v-if="unreadCount > 0"
                class="bg-red-500 text-white rounded-full px-1.5 py-0.5 text-xs font-semibold absolute -top-2 -right-2"
              >
                {{ unreadCount }}
              </span>
            </button>

            <!-- Notification Dropdown -->
            <div
              v-if="showNotificationMenu"
              class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl py-2 z-50 max-h-96 overflow-y-auto"
              @click.stop
            >
              <div class="px-4 py-2 border-b border-gray-200">
                <h3 class="text-sm font-semibold text-gray-900">Thông báo</h3>
              </div>

              <div v-if="notifications.length > 0">
                <div
                  v-for="notification in notifications"
                  :key="notification.id"
                  class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  :class="{ 'bg-blue-50': !notification.read }"
                  @click="markAsRead(notification.id)"
                >
                  <div class="flex items-start">
                    <div class="flex-1">
                      <p class="text-sm font-medium text-gray-900">
                        {{ notification.title }}
                      </p>
                      <p class="text-xs text-gray-600 mt-1">
                        {{ notification.message }}
                      </p>
                      <p class="text-xs text-gray-400 mt-1">
                        {{ notification.time }}
                      </p>
                    </div>
                    <div
                      v-if="!notification.read"
                      class="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-1"
                    ></div>
                  </div>
                </div>
              </div>

              <div v-else class="px-4 py-6 text-center">
                <p class="text-sm text-gray-500">Không có thông báo nào</p>
              </div>

              <div class="px-4 py-2 border-t border-gray-200">
                <button
                  @click="navigateToNotifications"
                  class="text-sm text-blue-600 hover:text-blue-800 w-full text-center"
                >
                  Xem tất cả thông báo
                </button>
              </div>
            </div>
          </div>

          <!-- Cart Button -->
          <button
            @click="navigateToCart"
            class="flex items-center hover:opacity-80 relative"
          >
            <span class="text-2xl">🛒</span>
            <span
              class="bg-white text-blue-700 rounded-full px-2 py-0.5 text-sm font-semibold absolute -top-2 -right-2"
            >
              {{ cartCount }}
            </span>
          </button>

          <!-- Guest Menu -->
          <div v-if="!isAuthenticated" class="flex gap-4">
            <RouterLink to="/login" class="hover:underline font-semibold"
              >Đăng nhập</RouterLink
            >
            <RouterLink to="/signup" class="hover:underline font-semibold"
              >Đăng ký</RouterLink
            >
          </div>

          <!-- User Menu -->
          <div v-else class="relative" style="position: relative">
            <button
              @click="toggleUserMenu"
              class="flex items-center gap-2 focus:outline-none"
            >
              <img
                src="/assets/icons/user.png"
                alt="User Avatar"
                class="w-8 h-8 rounded-full object-cover"
              />
              <span class="font-semibold">
                {{ user?.name || user?.username }}</span
              >
              <span>▼</span>
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50"
              style="position: absolute; min-width: 200px"
              @click.stop
            >
              <!-- Admin Dashboard Link (only for admin users) -->
              <button
                v-if="user?.role === 'admin'"
                @click="navigateToAdmin"
                class="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 border-b border-gray-200"
              >
                <span class="text-purple-600 font-medium"
                  >🏪 Admin Dashboard</span
                >
              </button>

              <button
                @click="navigateToProfile"
                class="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
              >
                Tài khoản của tôi
              </button>
              <button
                @click="navigateToCart"
                class="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
              >
                Đơn hàng
              </button>
              <button
                @click="handleLogout"
                class="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Search (shown when search is toggled) -->
    <div
      v-if="isMobileSearchOpen"
      class="p-4 bg-blue-200 lg:hidden transition-all duration-300 ease-in-out"
    >
      <div class="relative">
        <input
          type="text"
          placeholder="Search products..."
          class="w-full px-4 py-2 rounded-lg text-gray-800 focus:outline-none"
          autofocus
        />
        <button
          class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
          @click="toggleMobileSearch"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Mobile Menu (can be toggled) -->
    <div v-if="isMobileMenuOpen" class="lg:hidden bg-blue-200 text-blue-900">
      <div class="flex flex-col py-2">
        <RouterLink
          to="/"
          class="px-6 py-2 hover:bg-blue-300"
          @click="toggleMobileMenu"
          >Home</RouterLink
        >
        <RouterLink
          to="/products"
          class="px-6 py-2 hover:bg-blue-300"
          @click="toggleMobileMenu"
          >Sản phẩm</RouterLink
        >
        <RouterLink
          to="/categories"
          class="px-6 py-2 hover:bg-blue-300"
          @click="toggleMobileMenu"
          >Danh mục</RouterLink
        >
        <RouterLink
          to="/deals"
          class="px-6 py-2 hover:bg-blue-300"
          @click="toggleMobileMenu"
          >Khuyến mãi</RouterLink
        >
        <RouterLink
          to="/support"
          class="px-6 py-2 hover:bg-blue-300"
          @click="toggleMobileMenu"
          >Hỗ trợ</RouterLink
        >
        <!-- Thêm phần đăng nhập/đăng ký -->
        <div class="border-t border-blue-300 mt-2 pt-2">
          <RouterLink
            to="/login"
            class="px-6 py-2 hover:bg-blue-300 block font-semibold"
            @click="toggleMobileMenu"
            >Đăng nhập</RouterLink
          >
          <RouterLink
            to="/signup"
            class="px-6 py-2 hover:bg-blue-300 block font-semibold"
            @click="toggleMobileMenu"
            >Đăng ký</RouterLink
          >
        </div>
      </div>
    </div>

    <!-- Bottom section - Navigation (desktop only) -->
    <nav class="hidden lg:block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 shadow-md">
      <div class="max-w-7xl mx-auto flex gap-8 justify-center items-center">
        <RouterLink 
          to="/" 
          class="hover:text-blue-200 font-medium transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-white/10"
        >
          Trang chủ
        </RouterLink>
        <RouterLink 
          to="/products" 
          class="hover:text-blue-200 font-medium transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-white/10"
        >
          Sản phẩm
        </RouterLink>
        <RouterLink 
          to="/categories" 
          class="hover:text-blue-200 font-medium transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-white/10"
        >
          Danh mục
        </RouterLink>
        <RouterLink 
          to="/deals" 
          class="hover:text-blue-200 font-medium transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-white/10"
        >
          Khuyến mãi
        </RouterLink>
        <RouterLink 
          to="/brands" 
          class="hover:text-blue-200 font-medium transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-white/10"
        >
          Thương hiệu
        </RouterLink>
        <RouterLink 
          to="/support" 
          class="hover:text-blue-200 font-medium transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-white/10"
        >
          Hỗ trợ
        </RouterLink>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.total {
  margin-left: -10px;
}
</style>
