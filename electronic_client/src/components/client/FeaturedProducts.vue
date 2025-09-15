<script setup>
import { ref, computed, onMounted } from 'vue';
import productCard from '@components/client/productCard.vue';
import { getProducts } from '@api/productService';

// Active tab state
const activeTab = ref('bestsellers');

// Loading states
const loading = ref({
  bestsellers: false,
  newarrivals: false,
  featured: false
});

// Product data
const products = ref({
  bestsellers: [],
  newarrivals: [],
  featured: []
});

// Error states
const errors = ref({
  bestsellers: null,
  newarrivals: null,
  featured: null
});

// Tab configuration
const tabs = [
  {
    id: 'bestsellers',
    label: 'Bán chạy nhất',
    icon: 'fas fa-fire',
    color: 'text-red-500'
  },
  {
    id: 'newarrivals',
    label: 'Hàng mới',
    icon: 'fas fa-sparkles',
    color: 'text-green-500'
  },
  {
    id: 'featured',
    label: 'Nổi bật',
    icon: 'fas fa-star',
    color: 'text-yellow-500'
  }
];

// Computed properties
const currentProducts = computed(() => {
  return products.value[activeTab.value] || [];
});

const currentLoading = computed(() => {
  return loading.value[activeTab.value] || false;
});

const currentError = computed(() => {
  return errors.value[activeTab.value];
});

// Methods
const changeTab = async (tabId) => {
  if (activeTab.value === tabId) return;
  
  activeTab.value = tabId;
  
  // Load products if not already loaded
  if (products.value[tabId].length === 0) {
    await loadProducts(tabId);
  }
};

const loadProducts = async (category) => {
  try {
    loading.value[category] = true;
    errors.value[category] = null;
    
    let response;
    
    switch (category) {
      case 'bestsellers':
        // Load best selling products (you can modify the API call as needed)
        response = await getProducts(1, 8);
        break;
        
      case 'newarrivals':
        // Load newest products
        response = await getProducts(1, 8);
        break;
        
      case 'featured':
        // Load featured products (you can add a featured flag to your products)
        response = await getProducts(1, 8);
        break;
        
      default:
        response = await getProducts(1, 8);
    }
    
    if (response?.data) {
      products.value[category] = Array.isArray(response.data) ? response.data : [];
    }
    
  } catch (error) {
    console.error(`Error loading ${category} products:`, error);
    errors.value[category] = 'Không thể tải sản phẩm. Vui lòng thử lại.';
  } finally {
    loading.value[category] = false;
  }
};

// Lifecycle
onMounted(async () => {
  // Load initial tab (bestsellers)
  await loadProducts('bestsellers');
});
</script>

<template>
  <section class="py-16 bg-gray-50">
    <div class="container mx-auto px-4">
      <!-- Section Header -->
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Sản phẩm nổi bật
        </h2>
        <p class="text-gray-600 max-w-2xl mx-auto">
          Khám phá những sản phẩm electronics chất lượng cao, được yêu thích nhất tại cửa hàng của chúng tôi
        </p>
      </div>

      <!-- Tab Navigation -->
      <div class="flex justify-center mb-8">
        <div class="bg-white rounded-xl p-2 shadow-lg">
          <div class="flex space-x-1">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="changeTab(tab.id)"
              :class="[
                'relative px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2',
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              ]"
            >
              <i :class="[tab.icon, activeTab === tab.id ? 'text-white' : tab.color]"></i>
              <span>{{ tab.label }}</span>
              
              <!-- Active indicator -->
              <div
                v-if="activeTab === tab.id"
                class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 w-2 h-2 bg-blue-600 rotate-45"
              ></div>
            </button>
          </div>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="relative">
        <!-- Loading State -->
        <div
          v-if="currentLoading"
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          <div
            v-for="i in 8"
            :key="i"
            class="bg-white rounded-xl overflow-hidden shadow-md animate-pulse"
          >
            <div class="aspect-square bg-gray-200"></div>
            <div class="p-4 space-y-3">
              <div class="h-4 bg-gray-200 rounded"></div>
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-6 bg-gray-200 rounded w-1/2"></div>
              <div class="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div
          v-else-if="currentError"
          class="text-center py-12"
        >
          <div class="text-red-500 text-6xl mb-4">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h3>
          <p class="text-gray-600 mb-4">{{ currentError }}</p>
          <button
            @click="loadProducts(activeTab)"
            class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i class="fas fa-redo mr-2"></i>
            Thử lại
          </button>
        </div>

        <!-- Products Grid -->
        <div
          v-else-if="currentProducts.length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          <div
            v-for="(product, index) in currentProducts"
            :key="product._id"
            class="opacity-0 animate-fade-in"
            :style="{ animationDelay: `${index * 100}ms` }"
          >
            <productCard
              :product="product"
              :showQuickView="true"
              :showCompare="true"
              :showWishlist="true"
            />
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="text-center py-12"
        >
          <div class="text-gray-400 text-6xl mb-4">
            <i class="fas fa-box-open"></i>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Không có sản phẩm</h3>
          <p class="text-gray-600">Hiện tại chưa có sản phẩm nào trong danh mục này.</p>
        </div>
      </div>

      <!-- View All Button -->
      <div class="text-center mt-12">
        <router-link
          to="/products"
          class="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 hover:shadow-lg transform hover:scale-105"
        >
          <span>Xem tất cả sản phẩm</span>
          <i class="fas fa-arrow-right"></i>
        </router-link>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Custom animations */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out forwards;
}

/* Tab transition effects */
.tab-content-enter-active,
.tab-content-leave-active {
  transition: all 0.3s ease;
}

.tab-content-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.tab-content-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Pulse animation for loading */
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

/* Smooth hover transitions */
button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Custom shadow for active tab */
.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>