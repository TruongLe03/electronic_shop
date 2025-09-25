<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@stores/auth.js";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: "",
  },
  icon: {
    type: String,
    default: "fas fa-chart-line",
  },
});

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const sidebarOpen = ref(false);

// Navigation items
const navigation = [
  {
    name: "Dashboard",
    path: "/admin",
    icon: "fas fa-chart-line",
    current: false,
    gradient: "from-indigo-500 to-purple-600",
  },
  {
    name: "Sản phẩm",
    path: "/admin/products",
    icon: "fas fa-box",
    current: false,
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    name: "Đơn hàng",
    path: "/admin/orders",
    icon: "fas fa-shopping-cart",
    current: false,
    gradient: "from-orange-500 to-red-600",
  },
  {
    name: "Tồn kho",
    path: "/admin/inventory",
    icon: "fas fa-warehouse",
    current: false,
    gradient: "from-yellow-500 to-orange-400",
  },
  {
    name: "Người dùng",
    path: "/admin/users",
    icon: "fas fa-users",
    current: false,
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    name: "Thống kê",
    path: "/admin/analytics",
    icon: "fas fa-chart-bar",
    current: false,
    gradient: "from-purple-500 to-pink-600",
  },
];

// Update current navigation item based on route
const currentNavigation = computed(() => {
  return navigation.map((item) => ({
    ...item,
    current: route.path.startsWith(item.path),
  }));
});

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const logout = () => {
  authStore.logout();
  router.push("/login");
};
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
  >
    <!-- Mobile sidebar overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-40"
      @click="sidebarOpen = false"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="`fixed left-0 top-0 h-full w-72 bg-white/90 backdrop-blur-xl border-r border-white/20 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`"
    >
      <!-- Sidebar Header -->
      <div class="p-6 border-b border-gray-100">
        <div class="flex items-center space-x-3">
          <div
            class="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center"
          >
            <i class="fas fa-store text-white text-xl"></i>
          </div>
          <div>
            <h1
              class="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
            >
              ElectroShop
            </h1>
            <p class="text-sm text-gray-500">Admin Panel</p>
          </div>
        </div>
      </div>

      <!-- User Profile -->
      <div class="p-6 border-b border-gray-100">
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center"
          >
            <i class="fas fa-user text-white"></i>
          </div>
          <div class="flex-1">
            <div class="font-medium text-gray-900">
              {{ authStore.user?.name || "Admin" }}
            </div>
            <div class="text-sm text-gray-500">Quản trị viên</div>
          </div>
          <button
            @click="logout"
            class="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="p-4 flex-1">
        <ul class="space-y-2">
          <li v-for="item in currentNavigation" :key="item.name">
            <router-link
              :to="item.path"
              :class="`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                item.current
                  ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
              }`"
              @click="sidebarOpen = false"
            >
              <i :class="`${item.icon} mr-3 text-lg`"></i>
              {{ item.name }}
              <div v-if="item.current" class="ml-auto">
                <div class="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- Quick Stats -->
      <div class="p-4 border-t border-gray-100">
        <div
          class="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-4"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-600">Hệ thống</span>
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div class="text-xs text-gray-500">Trạng thái: Hoạt động tốt</div>
          <div class="text-xs text-gray-500">Phiên bản: v2.1.0</div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="lg:ml-72">
      <!-- Top Header -->
      <header
        class="backdrop-blur-md bg-white/80 border-b border-white/20 sticky top-0 z-30"
      >
        <div class="px-6">
          <div class="flex justify-between items-center py-4">
            <!-- Mobile menu button + Page title -->
            <div class="flex items-center space-x-3">
              <button
                @click="toggleSidebar"
                class="lg:hidden p-2 bg-white/60 hover:bg-white/80 rounded-xl transition-all"
              >
                <i class="fas fa-bars text-gray-600"></i>
              </button>

              <div class="flex items-center space-x-3">
                <div
                  :class="`w-10 h-10 bg-gradient-to-r ${
                    currentNavigation.find((n) => n.current)?.gradient ||
                    'from-indigo-500 to-purple-600'
                  } rounded-xl flex items-center justify-center`"
                >
                  <i :class="`${props.icon} text-white text-lg`"></i>
                </div>
                <div>
                  <h1
                    class="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                  >
                    {{ props.title }}
                  </h1>
                  <p v-if="props.subtitle" class="text-sm text-gray-500">
                    {{ props.subtitle }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Header Actions -->
            <div class="flex items-center space-x-4">
              <!-- Search -->
              <div class="hidden md:block relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  class="w-64 pl-10 pr-4 py-2 bg-white/60 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
                <i
                  class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                ></i>
              </div>

              <!-- Notifications -->
              <div class="relative">
                <button
                  class="relative p-2 bg-white/60 hover:bg-white/80 rounded-xl transition-all duration-200 group"
                >
                  <i
                    class="fas fa-bell text-gray-600 group-hover:text-indigo-600"
                  ></i>
                  <span
                    class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center"
                    >3</span
                  >
                </button>
              </div>

              <!-- User menu -->
              <div class="relative group">
                <button
                  class="flex items-center space-x-2 bg-white/60 rounded-xl px-3 py-2 hover:bg-white/80 transition-all"
                >
                  <div
                    class="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center"
                  >
                    <i class="fas fa-user text-white text-sm"></i>
                  </div>
                  <span
                    class="hidden md:block text-sm font-medium text-gray-900"
                    >{{ authStore.user?.name || "Admin" }}</span
                  >
                  <i class="fas fa-chevron-down text-xs text-gray-500"></i>
                </button>

                <!-- Dropdown -->
                <div
                  class="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                >
                  <div class="py-2">
                    <a
                      href="#"
                      class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <i class="fas fa-user"></i>
                      <span>Hồ sơ</span>
                    </a>
                    <a
                      href="#"
                      class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <i class="fas fa-cog"></i>
                      <span>Cài đặt</span>
                    </a>
                    <hr class="my-2" />
                    <button
                      @click="logout"
                      class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <i class="fas fa-sign-out-alt"></i>
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
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
