<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@stores/auth";
import { useCartStore } from "@stores/cart";
import { useNotification } from "@composables/useNotification";
import { useSearch } from "@composables/useSearch";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const cartStore = useCartStore();
const { user, isAuthenticated } = storeToRefs(authStore);
const { cartCount } = storeToRefs(cartStore);
const { notifyLogout, notifyClearCart } = useNotification();
const {
  searchQuery,
  searchResults,
  isSearching,
  showResults,
  onSearchInput,
  selectProduct,
  clearSearch,
  goToSearchPage,
  formatPrice,
} = useSearch();

// State
const isMobileMenuOpen = ref(false);
const showUserMenu = ref(false);

// Methods
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeAllMenus = () => {
  showUserMenu.value = false;
  showResults.value = false;
};

const handleLogout = () => {
  try {
    authStore.logout();
    cartStore.clearCart();
    closeAllMenus();
    notifyLogout();
    router.push("/");
  } catch (error) {
    console.error("Logout error:", error);
    router.push("/");
  }
};

// Navigation helpers
const isActiveRoute = (routeName) => {
  if (routeName === "/" || routeName === "/home") {
    return route.path === "/" || route.path === "/home";
  }
  return route.path.startsWith(routeName);
};

const getNavLinkClass = (routeName) => {
  const baseClass =
    "text-gray-700 hover:text-blue-600 font-medium transition-all duration-200 relative px-4 py-2 rounded-lg";
  const activeClass =
    "text-blue-600 font-semibold bg-blue-50 border border-blue-200 shadow-sm";

  return isActiveRoute(routeName) ? `${baseClass} ${activeClass}` : baseClass;
};

const getMobileNavLinkClass = (routeName) => {
  const baseClass =
    "block py-3 px-4 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200";
  const activeClass =
    "bg-blue-50 text-blue-600 font-semibold border border-blue-200";

  return isActiveRoute(routeName) ? `${baseClass} ${activeClass}` : baseClass;
};

// Click outside handler
onMounted(() => {
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".dropdown-container")) {
      closeAllMenus();
    }
  });
});
</script>

<template>
  <!-- Top Bar -->
  <div class="bg-gray-900 text-white py-2 text-sm">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center">
        <!-- Left Side -->
        <div class="hidden md:flex items-center space-x-4">
          <span class="flex items-center">
            <i class="fas fa-phone mr-2"></i>
            +84 123 456 789
          </span>
          <span class="flex items-center">
            <i class="fas fa-envelope mr-2"></i>
            info@electronics.com
          </span>
        </div>

        <!-- Right Side -->
        <div class="flex items-center space-x-4">
          <div class="hidden md:flex items-center space-x-2">
            <span>Follow Us:</span>
            <a href="#" class="hover:text-blue-400 transition-colors">
              <i class="fab fa-facebook-f"></i>
            </a>
            <a href="#" class="hover:text-blue-400 transition-colors">
              <i class="fab fa-twitter"></i>
            </a>
            <a href="#" class="hover:text-blue-400 transition-colors">
              <i class="fab fa-instagram"></i>
            </a>
          </div>
          <span class="hidden md:inline">|</span>
          <div class="flex items-center space-x-2">
            <i class="fas fa-globe"></i>
            <select
              class="bg-transparent text-white text-sm focus:outline-none"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Main Header -->
  <header class="bg-white shadow-md sticky top-0 z-50">
    <div class="container mx-auto px-4">
      <!-- Header Top -->
      <div class="py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <div class="flex items-center">
            <router-link to="/" class="flex items-center space-x-2">
              <div
                class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center"
              >
                <i class="fas fa-bolt text-white text-xl"></i>
              </div>
              <div>
                <h1 class="text-2xl font-bold text-gray-900">Electro</h1>
                <p class="text-xs text-gray-500">Electronics Store</p>
              </div>
            </router-link>
          </div>

          <!-- Search Bar -->
          <div class="flex-1 mx-8 max-w-2xl relative dropdown-container">
            <div class="relative">
              <div class="flex">
                <input
                  v-model="searchQuery"
                  @input="onSearchInput"
                  @focus="showResults = true"
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  class="flex-1 border border-gray-300 px-4 py-3 rounded-l-lg focus:outline-none focus:border-blue-500"
                />
                <button
                  @click="goToSearchPage"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-r-lg transition-colors"
                >
                  <i class="fas fa-search"></i>
                </button>
              </div>

              <!-- Search Results Dropdown -->
              <div
                v-if="showResults && searchResults.length > 0"
                class="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-lg shadow-lg z-50 max-h-96 overflow-y-auto"
              >
                <div
                  v-for="product in searchResults.slice(0, 5)"
                  :key="product._id"
                  @click="selectProduct(product)"
                  class="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <img
                    :src="product.main_image || '/images/placeholder.jpg'"
                    :alt="product.name"
                    class="w-12 h-12 object-cover rounded mr-3"
                  />
                  <div class="flex-1">
                    <h4 class="text-sm font-medium text-gray-900 truncate">
                      {{ product.name }}
                    </h4>
                    <p class="text-sm text-blue-600 font-semibold">
                      {{ formatPrice(product.price) }}
                    </p>
                  </div>
                </div>
                <div
                  v-if="searchResults.length > 5"
                  @click="goToSearchPage"
                  class="p-3 text-center text-blue-600 hover:bg-gray-50 cursor-pointer text-sm font-medium"
                >
                  Xem tất cả {{ searchResults.length }} kết quả
                </div>
              </div>
            </div>
          </div>

          <!-- Header Actions -->
          <div class="flex items-center space-x-4">
            <!-- Wishlist -->
            <div
              class="hidden md:flex flex-col items-center cursor-pointer group"
            >
              <div class="relative">
                <i
                  class="fas fa-heart text-xl text-gray-600 group-hover:text-red-500 transition-colors"
                ></i>
                <span
                  class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  >0</span
                >
              </div>
              <span class="text-xs text-gray-600 mt-1">Yêu thích</span>
            </div>

            <!-- Cart -->
            <router-link to="/cart" class="flex flex-col items-center group">
              <div class="relative">
                <i
                  class="fas fa-shopping-cart text-xl text-gray-600 group-hover:text-blue-600 transition-colors"
                ></i>
                <span
                  v-if="cartCount > 0"
                  class="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {{ cartCount }}
                </span>
              </div>
              <span class="text-xs text-gray-600 mt-1">Giỏ hàng</span>
            </router-link>

            <!-- User Account -->
            <div class="relative dropdown-container">
              <div
                v-if="!isAuthenticated"
                class="hidden md:flex items-center space-x-2"
              >
                <router-link
                  to="/login"
                  class="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Đăng nhập
                </router-link>
                <span class="text-gray-400">|</span>
                <router-link
                  to="/signup"
                  class="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Đăng ký
                </router-link>
              </div>

              <div
                v-else
                class="flex flex-col items-center cursor-pointer group"
                @click="showUserMenu = !showUserMenu"
              >
                <div class="flex items-center space-x-1">
                  <i
                    class="fas fa-user text-xl text-gray-600 group-hover:text-blue-600 transition-colors"
                  ></i>
                  <i class="fas fa-chevron-down text-xs text-gray-600"></i>
                </div>
                <span class="text-xs text-gray-600 mt-1">Tài khoản</span>
              </div>

              <!-- User Dropdown Menu -->
              <div
                v-if="showUserMenu && isAuthenticated"
                class="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
              >
                <div class="p-3 border-b border-gray-200">
                  <p class="text-sm font-medium text-gray-900">
                    {{ user?.name || user?.email }}
                  </p>
                  <p class="text-xs text-gray-500">{{ user?.email }}</p>
                </div>
                <div class="py-1">
                  <router-link
                    to="/account"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    @click="showUserMenu = false"
                  >
                    <i class="fas fa-user mr-2"></i>
                    Thông tin tài khoản
                  </router-link>
                  <router-link
                    to="/orders"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    @click="showUserMenu = false"
                  >
                    <i class="fas fa-shopping-bag mr-2"></i>
                    Đơn hàng của tôi
                  </router-link>
                  <router-link
                    v-if="user?.role === 'admin'"
                    to="/admin"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    @click="showUserMenu = false"
                  >
                    <i class="fas fa-cog mr-2"></i>
                    Quản trị
                  </router-link>
                  <hr class="my-1" />
                  <button
                    @click="handleLogout"
                    class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <i class="fas fa-sign-out-alt mr-2"></i>
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>

            <!-- Mobile Menu Button -->
            <button
              @click="toggleMobileMenu"
              class="md:hidden text-gray-600 hover:text-gray-900 p-2"
            >
              <i class="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="py-3 hidden md:block">
        <div class="flex items-center justify-between">
          <!-- Main Navigation -->
          <div class="flex items-center space-x-2">
            <router-link to="/" :class="getNavLinkClass('/')">
              <i class="fas fa-home mr-2"></i>
              Trang chủ
            </router-link>
            <router-link to="/products" :class="getNavLinkClass('/products')">
              <i class="fas fa-box mr-2"></i>
              Sản phẩm
            </router-link>
            <router-link to="/deals" :class="getNavLinkClass('/deals')">
              <i class="fas fa-fire mr-2"></i>
              Khuyến mãi
            </router-link>
            <router-link to="/brands" :class="getNavLinkClass('/brands')">
              <i class="fas fa-tags mr-2"></i>
              Thương hiệu
            </router-link>
            <router-link to="/support" :class="getNavLinkClass('/support')">
              <i class="fas fa-headset mr-2"></i>
              Hỗ trợ
            </router-link>
          </div>

          <!-- Special Offers -->
          <div class="flex items-center space-x-2 text-sm">
            <span class="text-red-600 font-medium">🔥 Hot Deal:</span>
            <span class="text-gray-700">Giảm giá đến 50% cho Arduino Kit!</span>
          </div>
        </div>
      </nav>
    </div>

    <!-- Mobile Menu -->
    <div
      v-if="isMobileMenuOpen"
      class="md:hidden bg-white border-t border-gray-200"
    >
      <div class="container mx-auto px-4 py-4">
        <div class="space-y-4">
          <!-- Mobile Search -->
          <div class="relative">
            <input
              v-model="searchQuery"
              @input="onSearchInput"
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
            />
            <button
              @click="goToSearchPage"
              class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <i class="fas fa-search"></i>
            </button>
          </div>

          <!-- Mobile Navigation Links -->
          <div class="space-y-2">
            <router-link
              to="/"
              :class="getMobileNavLinkClass('/')"
              @click="isMobileMenuOpen = false"
            >
              <i class="fas fa-home mr-3"></i>
              Trang chủ
            </router-link>
            <router-link
              to="/products"
              :class="getMobileNavLinkClass('/products')"
              @click="isMobileMenuOpen = false"
            >
              <i class="fas fa-box mr-3"></i>
              Sản phẩm
            </router-link>
            <router-link
              to="/deals"
              :class="getMobileNavLinkClass('/deals')"
              @click="isMobileMenuOpen = false"
            >
              <i class="fas fa-fire mr-3"></i>
              Khuyến mãi
            </router-link>
            <router-link
              to="/brands"
              :class="getMobileNavLinkClass('/brands')"
              @click="isMobileMenuOpen = false"
            >
              <i class="fas fa-tags mr-3"></i>
              Thương hiệu
            </router-link>
            <router-link
              to="/support"
              :class="getMobileNavLinkClass('/support')"
              @click="isMobileMenuOpen = false"
            >
              <i class="fas fa-headset mr-3"></i>
              Hỗ trợ
            </router-link>
          </div>

          <!-- Mobile User Actions -->
          <div
            v-if="!isAuthenticated"
            class="space-y-2 pt-4 border-t border-gray-200"
          >
            <router-link
              to="/login"
              class="block py-3 px-4 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              @click="isMobileMenuOpen = false"
            >
              Đăng nhập
            </router-link>
            <router-link
              to="/signup"
              class="block py-3 px-4 text-center border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              @click="isMobileMenuOpen = false"
            >
              Đăng ký
            </router-link>
          </div>

          <div v-else class="pt-4 border-t border-gray-200">
            <div class="mb-3">
              <p class="text-sm font-medium text-gray-900">
                {{ user?.name || user?.email }}
              </p>
              <p class="text-xs text-gray-500">{{ user?.email }}</p>
            </div>
            <div class="space-y-2">
              <router-link
                to="/account"
                class="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-lg"
                @click="isMobileMenuOpen = false"
              >
                <i class="fas fa-user mr-2"></i>
                Thông tin tài khoản
              </router-link>
              <router-link
                to="/orders"
                class="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-lg"
                @click="isMobileMenuOpen = false"
              >
                <i class="fas fa-shopping-bag mr-2"></i>
                Đơn hàng của tôi
              </router-link>
              <router-link
                v-if="user?.role === 'admin'"
                to="/admin"
                class="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-lg"
                @click="isMobileMenuOpen = false"
              >
                <i class="fas fa-cog mr-2"></i>
                Quản trị
              </router-link>
              <button
                @click="handleLogout"
                class="block w-full text-left py-2 px-4 text-red-600 hover:bg-gray-100 rounded-lg"
              >
                <i class="fas fa-sign-out-alt mr-2"></i>
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* Custom styles for the header */
.container {
  max-width: 1200px;
}

/* Navigation active state indicator */
.router-link-active::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  border-radius: 1px;
}

/* Smooth hover animations */
.nav-link {
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(59, 130, 246, 0.1),
    transparent
  );
  transition: left 0.5s;
}

.nav-link:hover::before {
  left: 100%;
}

/* Active nav item pulse effect */
@keyframes pulse-blue {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

.router-link-exact-active {
  animation: pulse-blue 2s infinite;
}
</style>
