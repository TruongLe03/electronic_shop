<template>
  <!-- Top Bar -->
  <div class="bg-gray-800 text-white text-sm py-2 hidden md:block">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between">
        <!-- Left Side -->
        <div class="flex items-center space-x-4">
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
        <div class="flex items-center justify-between gap-4">
          <!-- Logo -->
          <div class="flex items-center flex-shrink-0">
            <router-link to="/" class="flex items-center space-x-2">
              <div
                class="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-lg flex items-center justify-center"
              >
                <i class="fas fa-bolt text-white text-lg md:text-xl"></i>
              </div>
              <div>
                <h1 class="text-lg md:text-2xl font-bold text-gray-900">
                  Electro
                </h1>
                <p class="text-xs text-gray-500 hidden md:block">
                  Electronics Store
                </p>
              </div>
            </router-link>
          </div>

          <!-- Desktop Search Bar -->
          <div
            class="hidden md:flex flex-1 mx-8 max-w-2xl relative dropdown-container"
          >
            <div class="relative w-full">
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

              <!-- Desktop Search Results -->
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
          <div class="flex items-center space-x-2 md:space-x-4">
            <!-- Wishlist -->
            <div
              class="hidden lg:flex flex-col items-center cursor-pointer group"
            >
              <div class="relative">
                <i
                  class="fas fa-heart text-lg md:text-xl text-gray-600 group-hover:text-red-500 transition-colors"
                ></i>
                <span
                  class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center"
                  >0</span
                >
              </div>
              <span class="text-xs text-gray-600 mt-1 hidden md:block"
                >Yêu thích</span
              >
            </div>

            <!-- Cart -->
            <router-link to="/cart" class="flex flex-col items-center group">
              <div class="relative">
                <i
                  class="fas fa-shopping-cart text-lg md:text-xl text-gray-600 group-hover:text-blue-600 transition-colors"
                ></i>
                <span
                  v-if="cartCount > 0"
                  class="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center"
                >
                  {{ cartCount }}
                </span>
              </div>
              <span class="text-xs text-gray-600 mt-1 hidden md:block"
                >Giỏ hàng</span
              >
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
                    class="fas fa-user text-lg md:text-xl text-gray-600 group-hover:text-blue-600 transition-colors"
                  ></i>
                  <i
                    class="fas fa-chevron-down text-xs text-gray-600 hidden md:block"
                  ></i>
                </div>
                <span class="text-xs text-gray-600 mt-1 hidden md:block"
                  >Tài khoản</span
                >
              </div>

              <!-- User Dropdown Menu -->
              <div
                v-if="showUserMenu && isAuthenticated"
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
              >
                <div class="py-2">
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

      <!-- Mobile Search Bar -->
      <div class="md:hidden py-3 border-b border-gray-200">
        <div class="relative dropdown-container">
          <div class="flex">
            <input
              v-model="searchQuery"
              @input="onSearchInput"
              @focus="showResults = true"
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              class="flex-1 border border-gray-300 px-4 py-2 rounded-l-lg focus:outline-none focus:border-blue-500 text-sm"
            />
            <button
              @click="goToSearchPage"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg transition-colors"
            >
              <i class="fas fa-search"></i>
            </button>
          </div>

          <!-- Mobile Search Results -->
          <div
            v-if="showResults && searchResults.length > 0"
            class="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-lg shadow-lg z-50 max-h-80 overflow-y-auto"
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
                class="w-10 h-10 object-cover rounded mr-3"
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

      <!-- Navigation Menu -->
      <nav class="py-3 hidden md:block">
        <div class="flex items-center justify-center">
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
      </nav>
    </div>

    <!-- Mobile Menu Overlay -->
    <div
      v-if="isMobileMenuOpen"
      @click="isMobileMenuOpen = false"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
    ></div>

    <!-- Mobile Menu -->
    <div
      v-if="isMobileMenuOpen"
      class="fixed top-0 left-0 w-80 h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 md:hidden overflow-y-auto"
    >
      <!-- Mobile Menu Header -->
      <div class="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h2 class="text-lg font-semibold">Menu</h2>
        <button
          @click="isMobileMenuOpen = false"
          class="text-white hover:text-gray-200 text-2xl"
        >
          ×
        </button>
      </div>

      <div class="p-4">
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
              class="block py-3 px-4 text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
              @click="isMobileMenuOpen = false"
            >
              <i class="fas fa-sign-in-alt mr-3"></i>
              Đăng nhập
            </router-link>
            <router-link
              to="/signup"
              class="block py-3 px-4 text-green-600 hover:bg-green-50 rounded-lg font-medium"
              @click="isMobileMenuOpen = false"
            >
              <i class="fas fa-user-plus mr-3"></i>
              Đăng ký
            </router-link>
          </div>

          <div v-else class="space-y-2 pt-4 border-t border-gray-200">
            <div class="px-4 py-2 text-sm text-gray-500">
              Xin chào, {{ user?.name || user?.email }}
            </div>
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
  </header>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import { useCartStore } from "../../stores/cart";
import { useSearch } from "../../composables/client/useSearch";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const cartStore = useCartStore();

// Use search composable
const { searchQuery, searchResults, showResults, onSearchInput, clearResults } =
  useSearch();

// Reactive state
const showUserMenu = ref(false);
const isMobileMenuOpen = ref(false);

// Computed properties
const isAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);
const cartCount = computed(() => cartStore.totalItems);

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const selectProduct = (product) => {
  router.push(`/products/${product._id}`);
  showResults.value = false;
  searchQuery.value = "";
};

const goToSearchPage = () => {
  if (searchQuery.value.trim()) {
    router.push(`/filter?q=${encodeURIComponent(searchQuery.value.trim())}`);
  }
  showResults.value = false;
  isMobileMenuOpen.value = false;
};

const handleLogout = () => {
  authStore.logout();
  showUserMenu.value = false;
  isMobileMenuOpen.value = false;
  router.push("/");
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const getNavLinkClass = (path) => {
  const baseClass =
    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors";
  const activeClass = "bg-blue-100 text-blue-700";
  const inactiveClass = "text-gray-700 hover:text-blue-600 hover:bg-gray-100";

  return route.path === path
    ? `${baseClass} ${activeClass}`
    : `${baseClass} ${inactiveClass}`;
};

const getMobileNavLinkClass = (path) => {
  const baseClass = "block py-2 px-4 rounded-lg font-medium";
  const activeClass = "bg-blue-100 text-blue-700";
  const inactiveClass = "text-gray-700 hover:bg-gray-100";

  return route.path === path
    ? `${baseClass} ${activeClass}`
    : `${baseClass} ${inactiveClass}`;
};

// Click outside handler
const handleClickOutside = (event) => {
  if (!event.target.closest(".dropdown-container")) {
    showResults.value = false;
    showUserMenu.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

// Watch route changes to close mobile menu
watch(route, () => {
  isMobileMenuOpen.value = false;
});
</script>

<style scoped>
.dropdown-container {
  position: relative;
}

/* Prevent body scroll when mobile menu is open */
body:has(.mobile-menu-open) {
  overflow: hidden;
}
</style>
