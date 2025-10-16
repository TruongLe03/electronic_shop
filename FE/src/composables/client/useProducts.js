import { ref } from 'vue'
import { getProducts, getProductsByCategory, searchProducts } from '@/api/productService'

export function useProducts() {
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)
  const totalProducts = ref(0)
  const totalPages = ref(0)

  const loadProducts = async (page = 1, itemsPerPage = 20) => {
    try {
      loading.value = true
      error.value = null

      const result = await getProducts({ page, limit: itemsPerPage })
      console.log('API Response:', result)

      if (result && result.data) {
        products.value = result.data
        totalProducts.value = result.total
        totalPages.value = result.totalPages || Math.ceil(result.total / itemsPerPage)
      } else {
        throw new Error('Dữ liệu sản phẩm không hợp lệ')
      }
    } catch (err) {
      console.error('Error loading products:', err)
      error.value = err.message || 'Không thể tải sản phẩm'
      products.value = []
      totalProducts.value = 0
      totalPages.value = 0
    } finally {
      loading.value = false
    }
  }

  const loadProductsByCategory = async (categoryId, page = 1, itemsPerPage = 20) => {
    try {
      loading.value = true
      error.value = null

      let result
      if (categoryId === 'all') {
        result = await getProducts({ page, limit: itemsPerPage })
      } else {
        result = await getProductsByCategory(categoryId, page, itemsPerPage)
      }

      console.log('API Response:', result)
      console.log('Products data:', result?.data)
      console.log('Total:', result?.total)

      if (result && result.data) {
        products.value = result.data
        totalProducts.value = result.total
        totalPages.value = result.totalPages || Math.ceil(result.total / itemsPerPage)
        console.log('Products loaded successfully:', products.value.length, 'items')
      } else {
        console.error('Invalid product data structure:', result)
        throw new Error('Dữ liệu sản phẩm không hợp lệ')
      }
    } catch (err) {
      console.error('Error loading products by category:', err)
      error.value = err.message || 'Không thể tải sản phẩm'
      products.value = []
      totalProducts.value = 0
      totalPages.value = 0
    } finally {
      loading.value = false
    }
  }

  const searchProductsByQuery = async (query, page = 1, itemsPerPage = 20) => {
    try {
      loading.value = true
      error.value = null

      const result = await searchProducts(query, page, itemsPerPage)
      console.log('Search API Response:', result)

      if (result && result.data) {
        products.value = result.data
        totalProducts.value = result.total
        totalPages.value = result.totalPages || Math.ceil(result.total / itemsPerPage)
      } else {
        throw new Error('Dữ liệu tìm kiếm không hợp lệ')
      }
    } catch (err) {
      console.error('Error searching products:', err)
      error.value = err.message || 'Không thể tìm kiếm sản phẩm'
      products.value = []
      totalProducts.value = 0
      totalPages.value = 0
    } finally {
      loading.value = false
    }
  }

  const clearProducts = () => {
    products.value = []
    totalProducts.value = 0
    totalPages.value = 0
    error.value = null
  }

  const retryLoad = (type = 'products', ...args) => {
    switch (type) {
      case 'category':
        return loadProductsByCategory(...args)
      case 'search':
        return searchProductsByQuery(...args)
      default:
        return loadProducts(...args)
    }
  }

  return {
    products,
    loading,
    error,
    totalProducts,
    totalPages,
    loadProducts,
    loadProductsByCategory,
    searchProductsByQuery,
    clearProducts,
    retryLoad
  }
}