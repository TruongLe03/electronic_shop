import { ref, computed } from 'vue'
import axios from '@utils/axiosConfig'

export function useInventory() {
  const inventories = ref([])
  const inventory = ref(null)
  const stockMovements = ref([])
  const inventoryStats = ref({})
  const loading = ref(false)
  const error = ref(null)

  // Pagination
  const currentPage = ref(1)
  const totalPages = ref(0)
  const totalItems = ref(0)

  // Filters
  const filters = ref({
    stockStatus: '',
    warehouse: '',
    lowStock: false,
    search: ''
  })

  // Get all inventories with filters
  const getInventories = async (page = 1, limit = 20) => {
    try {
      loading.value = true
      error.value = null

      const params = {
        page,
        limit,
        ...filters.value
      }

      const response = await axios.get('/api/inventory', { params })
      
      if (response.data.success) {
        inventories.value = response.data.data
        currentPage.value = response.data.pagination.page
        totalPages.value = response.data.pagination.pages
        totalItems.value = response.data.pagination.total
      }
    } catch (err) {
      console.error('Error fetching inventories:', err)
      error.value = err.response?.data?.message || 'Failed to fetch inventories'
    } finally {
      loading.value = false
    }
  }

  // Get inventory by product ID
  const getInventoryByProduct = async (productId) => {
    try {
      loading.value = true
      error.value = null

      const response = await axios.get(`/api/inventory/product/${productId}`)
      
      if (response.data.success) {
        inventory.value = response.data.data
      }
    } catch (err) {
      console.error('Error fetching inventory:', err)
      error.value = err.response?.data?.message || 'Failed to fetch inventory'
    } finally {
      loading.value = false
    }
  }

  // Update inventory
  const updateInventory = async (productId, inventoryData) => {
    try {
      loading.value = true
      error.value = null

      const response = await axios.put(`/api/inventory/product/${productId}`, inventoryData)
      
      if (response.data.success) {
        inventory.value = response.data.data
        return true
      }
    } catch (err) {
      console.error('Error updating inventory:', err)
      error.value = err.response?.data?.message || 'Failed to update inventory'
      return false
    } finally {
      loading.value = false
    }
  }

  // Add stock
  const addStock = async (productId, stockData) => {
    try {
      loading.value = true
      error.value = null

      const response = await axios.post(`/api/inventory/add/${productId}`, stockData)
      
      if (response.data.success) {
        inventory.value = response.data.data
        return true
      }
    } catch (err) {
      console.error('Error adding stock:', err)
      error.value = err.response?.data?.message || 'Failed to add stock'
      return false
    } finally {
      loading.value = false
    }
  }

  // Remove stock
  const removeStock = async (productId, stockData) => {
    try {
      loading.value = true
      error.value = null

      const response = await axios.post(`/api/inventory/remove/${productId}`, stockData)
      
      if (response.data.success) {
        inventory.value = response.data.data
        return true
      }
    } catch (err) {
      console.error('Error removing stock:', err)
      error.value = err.response?.data?.message || 'Failed to remove stock'
      return false
    } finally {
      loading.value = false
    }
  }

  // Check stock availability
  const checkStock = async (productId, quantity = 1) => {
    try {
      const response = await axios.get(`/api/inventory/check/${productId}`, {
        params: { quantity }
      })
      
      if (response.data.success) {
        return response.data.data
      }
    } catch (err) {
      console.error('Error checking stock:', err)
      return {
        available: false,
        currentStock: 0,
        message: 'Failed to check stock'
      }
    }
  }

  // Get stock movements
  const getStockMovements = async (productId, page = 1, limit = 50) => {
    try {
      loading.value = true
      error.value = null

      const response = await axios.get(`/api/inventory/movements/${productId}`, {
        params: { page, limit }
      })
      
      if (response.data.success) {
        stockMovements.value = response.data.data
      }
    } catch (err) {
      console.error('Error fetching stock movements:', err)
      error.value = err.response?.data?.message || 'Failed to fetch stock movements'
    } finally {
      loading.value = false
    }
  }

  // Get inventory stats
  const getInventoryStats = async () => {
    try {
      const response = await axios.get('/api/inventory/stats')
      
      if (response.data.success) {
        inventoryStats.value = response.data.data
      }
    } catch (err) {
      console.error('Error fetching inventory stats:', err)
    }
  }

  // Set filters
  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  // Reset filters
  const resetFilters = () => {
    filters.value = {
      stockStatus: '',
      warehouse: '',
      lowStock: false,
      search: ''
    }
  }

  // Computed properties
  const hasInventories = computed(() => inventories.value.length > 0)
  const hasNextPage = computed(() => currentPage.value < totalPages.value)
  const hasPrevPage = computed(() => currentPage.value > 1)

  // Stock status helpers
  const getStockStatusColor = (status) => {
    switch (status) {
      case 'OUT_OF_STOCK':
        return 'text-red-600 bg-red-100'
      case 'LOW_STOCK':
        return 'text-orange-600 bg-orange-100'
      case 'MINIMUM_STOCK':
        return 'text-yellow-600 bg-yellow-100'
      case 'IN_STOCK':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStockStatusText = (status) => {
    switch (status) {
      case 'OUT_OF_STOCK':
        return 'Hết hàng'
      case 'LOW_STOCK':
        return 'Sắp hết'
      case 'MINIMUM_STOCK':
        return 'Tồn kho thấp'
      case 'IN_STOCK':
        return 'Còn hàng'
      default:
        return 'Không xác định'
    }
  }

  const getMovementTypeText = (type) => {
    switch (type) {
      case 'IN':
        return 'Nhập kho'
      case 'OUT':
        return 'Xuất kho'
      case 'ADJUSTMENT':
        return 'Điều chỉnh'
      case 'RESERVED':
        return 'Đặt trước'
      case 'RELEASED':
        return 'Hủy đặt trước'
      default:
        return type
    }
  }

  return {
    // State
    inventories,
    inventory,
    stockMovements,
    inventoryStats,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    filters,

    // Actions
    getInventories,
    getInventoryByProduct,
    updateInventory,
    addStock,
    removeStock,
    checkStock,
    getStockMovements,
    getInventoryStats,
    setFilters,
    resetFilters,

    // Computed
    hasInventories,
    hasNextPage,
    hasPrevPage,

    // Helpers
    getStockStatusColor,
    getStockStatusText,
    getMovementTypeText
  }
}