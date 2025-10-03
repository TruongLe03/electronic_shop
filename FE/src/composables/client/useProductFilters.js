import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'

export function useProductFilters() {
  const route = useRoute()
  const selectedCategory = ref('all')
  const searchQuery = ref('')
  const isSearchMode = ref(false)

  // Watch route changes for search functionality
  watch(() => route.query.search, (newSearch) => {
    if (newSearch) {
      searchQuery.value = newSearch
      isSearchMode.value = true
      selectedCategory.value = 'all'
    } else {
      isSearchMode.value = false
      searchQuery.value = ''
    }
  }, { immediate: true })

  // Watch route changes for category filter
  watch(() => route.query.categoryId, (newCategoryId) => {
    if (newCategoryId && !isSearchMode.value) {
      selectedCategory.value = newCategoryId
    } else if (!newCategoryId && !isSearchMode.value) {
      selectedCategory.value = 'all'
    }
  }, { immediate: true })

  const setCategory = (categoryId) => {
    selectedCategory.value = categoryId
    // Clear search mode when selecting category
    isSearchMode.value = false
    searchQuery.value = ''
  }

  const setSearchQuery = (query) => {
    searchQuery.value = query
    isSearchMode.value = !!query
    if (query) {
      selectedCategory.value = 'all'
    }
  }

  const clearFilters = () => {
    selectedCategory.value = 'all'
    searchQuery.value = ''
    isSearchMode.value = false
  }

  const filterState = computed(() => ({
    selectedCategory: selectedCategory.value,
    searchQuery: searchQuery.value,
    isSearchMode: isSearchMode.value
  }))

  return {
    selectedCategory,
    searchQuery,
    isSearchMode,
    filterState,
    setCategory,
    setSearchQuery,
    clearFilters
  }
}