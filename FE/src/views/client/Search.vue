<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Search Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Tìm kiếm sản phẩm</h1>
        
        <!-- Search Input -->
        <div class="max-w-2xl">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Nhập tên sản phẩm bạn muốn tìm..."
              class="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @keyup.enter="performSearch"
            >
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <button
              @click="performSearch"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <span class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Tìm kiếm
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Search Results -->
      <div v-if="searchPerformed">
        <!-- Results Header -->
        <div class="mb-6">
          <p class="text-gray-600">
            <span v-if="searchResults.length > 0">
              Tìm thấy {{ searchResults.length }} sản phẩm cho "<strong>{{ currentSearchQuery }}</strong>"
            </span>
            <span v-else>
              Không tìm thấy sản phẩm nào cho "<strong>{{ currentSearchQuery }}</strong>"
            </span>
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Đang tìm kiếm...</p>
        </div>

        <!-- Search Results Grid -->
        <div v-else-if="searchResults.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div
            v-for="product in searchResults"
            :key="product._id"
            class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            @click="viewProduct(product._id)"
          >
            <div class="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
              <img
                :src="product.images?.[0] || '/placeholder.jpg'"
                :alt="product.name"
                class="w-full h-48 object-cover object-center hover:scale-105 transition-transform duration-300"
              >
            </div>
            <div class="p-4">
              <h3 class="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
                {{ product.name }}
              </h3>
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-xl font-bold text-blue-600">
                    {{ formatPrice(product.price) }}
                  </span>
                  <span v-if="product.discount_percent > 0" class="ml-2 text-sm text-gray-500 line-through">
                    {{ formatPrice(product.original_price) }}
                  </span>
                </div>
                <span v-if="product.discount_percent > 0" class="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                  -{{ product.discount_percent }}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- No Results -->
        <div v-else class="text-center py-12">
          <div class="mb-4">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
          <p class="text-gray-600 mb-4">Hãy thử tìm kiếm với từ khóa khác</p>
          <button
            @click="clearSearch"
            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Xóa tìm kiếm
          </button>
        </div>
      </div>

      <!-- Popular Searches -->
      <div v-else class="mt-12">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Tìm kiếm phổ biến</h2>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="term in popularSearches"
            :key="term"
            @click="searchQuery = term; performSearch()"
            class="bg-gray-100 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            {{ term }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { searchProducts } from '@/api/productService'

const router = useRouter()
const route = useRoute()

// Reactive data
const searchQuery = ref('')
const currentSearchQuery = ref('')
const searchResults = ref([])
const loading = ref(false)
const searchPerformed = ref(false)

// Popular search terms
const popularSearches = ref([
  'Arduino',
  'Raspberry Pi',
  'Cảm biến',
  'LED',
  'Motor',
  'Breadboard',
  'Resistor',
  'Capacitor'
])

// Methods
const performSearch = async () => {
  if (!searchQuery.value.trim()) return
  
  loading.value = true
  currentSearchQuery.value = searchQuery.value
  searchPerformed.value = true
  
  try {
    const response = await searchProducts(searchQuery.value)
    searchResults.value = response.products || []
  } catch (error) {
    console.error('Search error:', error)
    searchResults.value = []
  } finally {
    loading.value = false
  }
}

const viewProduct = (productId) => {
  router.push(`/product/${productId}`)
}

const clearSearch = () => {
  searchQuery.value = ''
  currentSearchQuery.value = ''
  searchResults.value = []
  searchPerformed.value = false
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

// Initialize search from URL query
onMounted(() => {
  if (route.query.q) {
    searchQuery.value = route.query.q
    performSearch()
  }
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