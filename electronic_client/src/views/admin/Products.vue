<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.js'
import { getProducts } from '../../api/productService.js'

const router = useRouter()
const authStore = useAuthStore()

const products = ref([])
const loading = ref(false)
const error = ref(null)
const searchTerm = ref('')
const selectedCategory = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const totalPages = ref(0)
const showDeleteModal = ref(false)
const productToDelete = ref(null)

const categories = ref([
  'Arduino & Vi điều khiển',
  'Cảm biến IoT', 
  'Robot & Automation',
  'Phụ kiện điện tử',
  'Module & Shield',
  'Màn hình & Display'
])

onMounted(async () => {
  if (!authStore.isAuthenticated || authStore.user?.role !== 'admin') {
    router.push('/login')
    return
  }
  
  await loadProducts()
})

const loadProducts = async () => {
  try {
    loading.value = true
    error.value = null
    
    const result = await getProducts(currentPage.value, itemsPerPage)
    if (result && result.data) {
      products.value = result.data
      totalPages.value = Math.ceil((result.total || result.data.length) / itemsPerPage)
    }
  } catch (err) {
    console.error('Error loading products:', err)
    error.value = 'Không thể tải danh sách sản phẩm'
  } finally {
    loading.value = false
  }
}

const filteredProducts = computed(() => {
  let filtered = products.value
  
  if (searchTerm.value) {
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      product.SKU?.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }
  
  if (selectedCategory.value) {
    filtered = filtered.filter(product => product.category === selectedCategory.value)
  }
  
  return filtered
})

const handlePageChange = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page
    loadProducts()
  }
}

const editProduct = (productId) => {
  router.push(`/admin/products/edit/${productId}`)
}

const confirmDelete = (product) => {
  productToDelete.value = product
  showDeleteModal.value = true
}

const deleteProduct = async () => {
  try {
    // Implement delete API call here
    console.log('Deleting product:', productToDelete.value._id)
    
    // Remove from local array
    products.value = products.value.filter(p => p._id !== productToDelete.value._id)
    
    showDeleteModal.value = false
    productToDelete.value = null
    
    // Show success message
    alert('Xóa sản phẩm thành công!')
  } catch (error) {
    console.error('Error deleting product:', error)
    alert('Có lỗi xảy ra khi xóa sản phẩm')
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

const getStockStatus = (stock) => {
  if (stock > 50) return { text: 'Còn hàng', class: 'text-green-600 bg-green-100' }
  if (stock > 10) return { text: 'Sắp hết', class: 'text-yellow-600 bg-yellow-100' }
  if (stock > 0) return { text: 'Ít hàng', class: 'text-orange-600 bg-orange-100' }
  return { text: 'Hết hàng', class: 'text-red-600 bg-red-100' }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <router-link to="/admin" class="text-indigo-600 hover:text-indigo-700 mr-4">
              ← Dashboard
            </router-link>
            <h1 class="text-2xl font-bold text-gray-900">📦 Quản lý sản phẩm</h1>
          </div>
          
          <router-link to="/admin/products/add" 
                       class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
            ➕ Thêm sản phẩm
          </router-link>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
            <input v-model="searchTerm"
                   type="text"
                   placeholder="Tên sản phẩm hoặc SKU..."
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          
          <!-- Category Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
            <select v-model="selectedCategory"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">Tất cả danh mục</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
          
          <!-- Actions -->
          <div class="flex items-end">
            <button @click="loadProducts"
                    class="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors">
              🔄 Làm mới
            </button>
          </div>
        </div>
      </div>

      <!-- Products Table -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          <span class="ml-2 text-gray-600">Đang tải...</span>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-12">
          <div class="text-red-500 mb-4">❌ {{ error }}</div>
          <button @click="loadProducts" 
                  class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
            Thử lại
          </button>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tồn kho
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="product in filteredProducts" :key="product._id" class="hover:bg-gray-50">
                <!-- Product Info -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <img :src="product.main_image || '/assets/images/placeholder.jpg'" 
                         :alt="product.name"
                         class="h-10 w-10 rounded-lg object-cover">
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                      <div class="text-sm text-gray-500">{{ product.brand || 'N/A' }}</div>
                    </div>
                  </div>
                </td>
                
                <!-- SKU -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ product.SKU || 'N/A' }}
                </td>
                
                <!-- Category -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ product.category || 'N/A' }}
                </td>
                
                <!-- Price -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ formatCurrency(product.price) }}
                  </div>
                  <div v-if="product.original_price && product.original_price > product.price" 
                       class="text-xs text-gray-500 line-through">
                    {{ formatCurrency(product.original_price) }}
                  </div>
                </td>
                
                <!-- Stock -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ product.stock_quantity || 0 }}
                </td>
                
                <!-- Status -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatus(product.stock_quantity || 0).class}`">
                    {{ getStockStatus(product.stock_quantity || 0).text }}
                  </span>
                </td>
                
                <!-- Actions -->
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <button @click="editProduct(product._id)"
                            class="text-indigo-600 hover:text-indigo-900 p-1 rounded">
                      ✏️
                    </button>
                    <button @click="confirmDelete(product)"
                            class="text-red-600 hover:text-red-900 p-1 rounded">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- Empty State -->
          <div v-if="filteredProducts.length === 0" class="text-center py-12">
            <div class="text-gray-400 text-lg mb-2">📦</div>
            <div class="text-gray-500">Không tìm thấy sản phẩm nào</div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div class="flex items-center justify-between">
            <div class="flex-1 flex justify-between sm:hidden">
              <button @click="handlePageChange(currentPage - 1)"
                      :disabled="currentPage === 1"
                      class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                Trước
              </button>
              <button @click="handlePageChange(currentPage + 1)"
                      :disabled="currentPage === totalPages"
                      class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                Sau
              </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Hiển thị 
                  <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span>
                  đến 
                  <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, filteredProducts.length) }}</span>
                  trong tổng số 
                  <span class="font-medium">{{ filteredProducts.length }}</span>
                  sản phẩm
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button @click="handlePageChange(currentPage - 1)"
                          :disabled="currentPage === 1"
                          class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                    ←
                  </button>
                  <button v-for="page in totalPages" :key="page"
                          @click="handlePageChange(page)"
                          :class="[
                            'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                            currentPage === page 
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          ]">
                    {{ page }}
                  </button>
                  <button @click="handlePageChange(currentPage + 1)"
                          :disabled="currentPage === totalPages"
                          class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                    →
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <span class="text-2xl">⚠️</span>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mt-4">Xác nhận xóa sản phẩm</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">
              Bạn có chắc chắn muốn xóa sản phẩm 
              <strong>{{ productToDelete?.name }}</strong>?
              <br>
              Hành động này không thể hoàn tác.
            </p>
          </div>
          <div class="flex items-center justify-center gap-4 mt-4">
            <button @click="showDeleteModal = false"
                    class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors">
              Hủy
            </button>
            <button @click="deleteProduct"
                    class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.router-link-active {
  @apply text-indigo-600;
}
</style>
