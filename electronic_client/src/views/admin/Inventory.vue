<script setup>
import { ref, onMounted, computed } from 'vue'
import { useInventory } from '@composables/useInventory'

const {
  inventories,
  inventoryStats,
  loading,
  error,
  currentPage,
  totalPages,
  totalItems,
  filters,
  getInventories,
  getInventoryStats,
  setFilters,
  resetFilters,
  getStockStatusColor,
  getStockStatusText,
  hasNextPage,
  hasPrevPage
} = useInventory()

// UI state
const showAddStockModal = ref(false)
const showRemoveStockModal = ref(false)
const showUpdateModal = ref(false)
const selectedProduct = ref(null)
const migrationLoading = ref(false)
const migrationResult = ref(null)

// Form data
const stockForm = ref({
  quantity: 0,
  reason: '',
  reference: '',
  cost: 0
})

const updateForm = ref({
  quantity: 0,
  minStockLevel: 10,
  maxStockLevel: 1000,
  reorderPoint: 20,
  cost: 0,
  reason: ''
})

// Load data on mount
onMounted(async () => {
  await getInventories()
  await getInventoryStats()
})

// Filter methods
const applyFilters = () => {
  currentPage.value = 1
  getInventories(1)
}

const clearFilters = () => {
  resetFilters()
  getInventories(1)
}

// Pagination
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    getInventories(page)
  }
}

// Modal methods
const openAddStockModal = (product) => {
  selectedProduct.value = product
  stockForm.value = {
    quantity: 0,
    reason: 'Nhập kho từ nhà cung cấp',
    reference: '',
    cost: product.cost || 0
  }
  showAddStockModal.value = true
}

const openRemoveStockModal = (product) => {
  selectedProduct.value = product
  stockForm.value = {
    quantity: 0,
    reason: 'Hàng hỏng/mất',
    reference: '',
    cost: 0
  }
  showRemoveStockModal.value = true
}

const openUpdateModal = (product) => {
  selectedProduct.value = product
  updateForm.value = {
    quantity: product.quantity,
    minStockLevel: product.minStockLevel,
    maxStockLevel: product.maxStockLevel,
    reorderPoint: product.reorderPoint,
    cost: product.cost || 0,
    reason: 'Cập nhật thông tin tồn kho'
  }
  showUpdateModal.value = true
}

const closeModals = () => {
  showAddStockModal.value = false
  showRemoveStockModal.value = false
  showUpdateModal.value = false
  selectedProduct.value = null
}

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

// Run stock migration
const runStockMigration = async () => {
  try {
    migrationLoading.value = true
    migrationResult.value = null
    
    const response = await fetch('/api/inventory/migrate-stock', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
    
    const result = await response.json()
    
    if (result.success) {
      migrationResult.value = result
      // Refresh data after migration
      await getInventories()
      await getInventoryStats()
      alert(`Migration thành công!\nTạo mới: ${result.data.created}\nCập nhật: ${result.data.updated}\nBỏ qua: ${result.data.skipped}`)
    } else {
      alert('Migration thất bại: ' + result.message)
    }
  } catch (error) {
    console.error('Migration error:', error)
    alert('Có lỗi xảy ra khi chạy migration')
  } finally {
    migrationLoading.value = false
  }
}

// Computed properties
const filteredInventoriesCount = computed(() => inventories.value.length)
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Quản lý tồn kho</h1>
            <p class="text-gray-600">Theo dõi và quản lý tồn kho sản phẩm</p>
          </div>
          <div class="flex gap-3">
            <button
              @click="runStockMigration"
              :disabled="migrationLoading"
              class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span v-if="migrationLoading" class="animate-spin">⏳</span>
              <span v-else>🔄</span>
              {{ migrationLoading ? 'Đang sync...' : 'Sync từ Product Stock' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <span class="text-2xl">📦</span>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
              <p class="text-2xl font-bold text-gray-900">{{ inventoryStats.totalProducts || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <span class="text-2xl">📈</span>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Tồn kho khả dụng</p>
              <p class="text-2xl font-bold text-gray-900">{{ inventoryStats.totalAvailable || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <span class="text-2xl">⚠️</span>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Sắp hết hàng</p>
              <p class="text-2xl font-bold text-gray-900">{{ inventoryStats.lowStockItems || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-red-100 rounded-lg">
              <span class="text-2xl">🚫</span>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Hết hàng</p>
              <p class="text-2xl font-bold text-gray-900">{{ inventoryStats.outOfStockItems || 0 }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Bộ lọc</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Trạng thái tồn kho</label>
            <select
              v-model="filters.stockStatus"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="IN_STOCK">Còn hàng</option>
              <option value="LOW_STOCK">Sắp hết</option>
              <option value="MINIMUM_STOCK">Tồn kho thấp</option>
              <option value="OUT_OF_STOCK">Hết hàng</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Kho hàng</label>
            <input
              v-model="filters.warehouse"
              type="text"
              placeholder="Tên kho hàng"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div class="flex items-end">
            <label class="flex items-center">
              <input
                v-model="filters.lowStock"
                type="checkbox"
                class="mr-2"
              />
              <span class="text-sm font-medium text-gray-700">Chỉ hiển thị hàng sắp hết</span>
            </label>
          </div>

          <div class="flex gap-2">
            <button
              @click="applyFilters"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Áp dụng
            </button>
            <button
              @click="clearFilters"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      <!-- Inventory Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            Danh sách tồn kho ({{ totalItems }} sản phẩm)
          </h3>
        </div>

        <div v-if="loading" class="p-8 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="text-gray-600 mt-2">Đang tải...</p>
        </div>

        <div v-else-if="error" class="p-8 text-center">
          <p class="text-red-600 mb-4">{{ error }}</p>
          <button
            @click="getInventories(currentPage)"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>

        <div v-else-if="inventories.length === 0" class="p-8 text-center">
          <p class="text-gray-500">Không có dữ liệu tồn kho nào</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tồn kho
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đã đặt trước
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khả dụng
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kho hàng
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in inventories" :key="item._id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <img
                      :src="item.product?.image || '/assets/images/placeholder.jpg'"
                      :alt="item.product?.name"
                      class="h-10 w-10 rounded-md object-cover"
                    />
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ item.product?.name }}
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ formatCurrency(item.product?.price) }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ item.quantity }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ item.reservedQuantity }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ item.availableQuantity }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="getStockStatusColor(item.stockStatus)"
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  >
                    {{ getStockStatusText(item.stockStatus) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ item.location?.warehouse || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button
                      @click="openAddStockModal(item)"
                      class="text-green-600 hover:text-green-900 px-2 py-1 rounded hover:bg-green-50"
                      title="Nhập kho"
                    >
                      ➕
                    </button>
                    <button
                      @click="openRemoveStockModal(item)"
                      class="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                      title="Xuất kho"
                    >
                      ➖
                    </button>
                    <button
                      @click="openUpdateModal(item)"
                      class="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50"
                      title="Cập nhật"
                    >
                      ✏️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
              Hiển thị {{ ((currentPage - 1) * 20 + 1) }} đến 
              {{ Math.min(currentPage * 20, totalItems) }} trong tổng số {{ totalItems }} kết quả
            </div>
            <div class="flex space-x-2">
              <button
                @click="goToPage(currentPage - 1)"
                :disabled="!hasPrevPage"
                class="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Trước
              </button>
              <button
                v-for="page in Math.min(5, totalPages)"
                :key="page"
                @click="goToPage(page)"
                :class="{
                  'bg-blue-600 text-white': page === currentPage,
                  'text-gray-700 hover:bg-gray-50': page !== currentPage
                }"
                class="px-3 py-2 text-sm border border-gray-300 rounded-md"
              >
                {{ page }}
              </button>
              <button
                @click="goToPage(currentPage + 1)"
                :disabled="!hasNextPage"
                class="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals would go here -->
    <!-- Add Stock Modal, Remove Stock Modal, Update Modal -->
  </div>
</template>

<style scoped>
/* Add any custom styles here */
</style>