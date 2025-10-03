import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { searchProducts } from '@/api/productService'

export function useSearch() {
  const router = useRouter()
  const searchQuery = ref('')
  const searchResults = ref([])
  const isSearching = ref(false)
  const showResults = ref(false)

  // Debounced search
  let searchTimeout = null
  
  const search = async (query) => {
    if (!query || query.trim().length < 2) {
      searchResults.value = []
      showResults.value = false
      return
    }

    isSearching.value = true
    
    try {
      // Call API to search products
      const response = await searchProducts(query)
      searchResults.value = response.data || []
      showResults.value = true
    } catch (error) {
      console.error('Search error:', error)
      searchResults.value = []
      showResults.value = false
    } finally {
      isSearching.value = false
    }
  }

  const debouncedSearch = (query) => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      search(query)
    }, 300) // 300ms delay
  }

  const onSearchInput = (event) => {
    const query = event.target.value
    searchQuery.value = query
    
    if (query.trim().length >= 2) {
      debouncedSearch(query)
    } else {
      searchResults.value = []
      showResults.value = false
    }
  }

  const selectProduct = (product) => {
    router.push(`/product/${product._id}`)
    clearSearch()
  }

  const clearSearch = () => {
    searchQuery.value = ''
    searchResults.value = []
    showResults.value = false
  }

  const goToSearchPage = () => {
    if (searchQuery.value.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.value.trim())}`)
      clearSearch()
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  return {
    searchQuery,
    searchResults,
    isSearching,
    showResults,
    onSearchInput,
    selectProduct,
    clearSearch,
    goToSearchPage,
    formatPrice
  }
}
