<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Search Header -->
      <div class="mb-8">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Kết quả tìm kiếm
        </h1>
        <p class="text-gray-600">
          <span v-if="searchQuery">Tìm kiếm cho: "<span class="font-semibold">{{ searchQuery }}</span>"</span>
          <span v-if="totalResults > 0" class="ml-2">({{ totalResults }} sản phẩm)</span>
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-r-transparent rounded-full"></div>
        <p class="mt-4 text-gray-600">Đang tìm kiếm...</p>
      </div>

      <!-- No Results -->
      <div v-else-if="!loading && products.length === 0 && searchQuery" class="text-center py-12">
        <svg class="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3 class="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy sản phẩm</h3>
        <p class="text-gray-500 mb-6">Không có sản phẩm nào phù hợp với từ khóa "{{ searchQuery }}"</p>
        <router-link 
          to="/" 
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Về trang chủ
        </router-link>
      </div>

      <!-- Results Grid -->
      <div v-else-if="products.length > 0" class="space-y-6">
        <!-- Results count and basic sort -->
        <div class="flex justify-between items-center">
          <p class="text-gray-600">Hiển thị {{ products.length }} sản phẩm</p>
          <select 
            v-model="sortBy"
            @change="applySorting"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="relevance">Liên quan nhất</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
            <option value="name-asc">Tên A-Z</option>
          </select>
        </div>

        <!-- Products Grid -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          <ProductCard 
            v-for="product in sortedProducts" 
            :key="product._id" 
            :product="product" 
          />
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center">
          <div class="flex items-center space-x-2">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage <= 1"
              class="px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
            >
              ‹ Trước
            </button>
            
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'px-3 py-2 rounded-lg',
                page === currentPage 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              ]"
            >
              {{ page }}
            </button>
            
            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage >= totalPages"
              class="px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
            >
              Sau ›
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { searchProducts } from '@api/productService'
import ProductCard from '@components/client/productCard.vue'

const route = useRoute()
const router = useRouter()

const searchQuery = ref('')
const products = ref([])
const loading = ref(false)
const currentPage = ref(1)
const totalResults = ref(0)
const totalPages = ref(0)
const limit = 20

// Filters
const sortBy = ref('relevance')
const priceRange = ref('')

// Computed
const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Methods
const searchProducts = async () => {
  if (!searchQuery.value.trim()) {
    products.value = []
    totalResults.value = 0
    totalPages.value = 0
    return
  }

  loading.value = true
  
  try {
    const response = await searchProducts(
      searchQuery.value.trim(),
      currentPage.value,
      limit
    )
    
    let searchResults = response.data || []
    
    // Apply client-side filtering if needed
    if (priceRange.value) {
      searchResults = filterByPrice(searchResults)
    }
    
    // Apply client-side sorting
    searchResults = sortProducts(searchResults)
    
    products.value = searchResults
    totalResults.value = response.total || searchResults.length
    totalPages.value = Math.ceil(totalResults.value / limit)
    
  } catch (error) {
    console.error('Search error:', error)
    products.value = []
    totalResults.value = 0
    totalPages.value = 0
  } finally {
    loading.value = false
  }
}

const filterByPrice = (products) => {
  if (!priceRange.value) return products
  
  const [min, max] = priceRange.value.split('-').map(p => p.replace('+', ''))
  const minPrice = parseInt(min) || 0
  const maxPrice = max ? parseInt(max) : Infinity
  
  return products.filter(product => {
    const price = product.price || 0
    return price >= minPrice && (maxPrice === Infinity || price <= maxPrice)
  })
}

const sortProducts = (products) => {
  const sorted = [...products]
  
  switch (sortBy.value) {
    case 'price-asc':
      return sorted.sort((a, b) => (a.price || 0) - (b.price || 0))
    case 'price-desc':
      return sorted.sort((a, b) => (b.price || 0) - (a.price || 0))
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name))
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    default:
      return sorted
  }
}

const applyFilters = () => {
  currentPage.value = 1
  searchProducts()
}

const clearFilters = () => {
  sortBy.value = 'relevance'
  priceRange.value = ''
  applyFilters()
}

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  searchProducts()
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Watch route query changes
watch(() => route.query.q, (newQuery) => {
  if (newQuery) {
    searchQuery.value = newQuery
    currentPage.value = 1
    searchProducts()
  }
}, { immediate: true })

onMounted(() => {
  searchQuery.value = route.query.q || ''
  if (searchQuery.value) {
    searchProducts()
  }
})
</script>
