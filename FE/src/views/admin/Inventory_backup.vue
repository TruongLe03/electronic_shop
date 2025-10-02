<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Quản lý tồn kho</h1>
    
    <!-- Loading -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-gray-600">Đang tải...</p>
    </div>

    <!-- Inventory Table -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sản phẩm
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số lượng
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tình trạng
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in inventory" :key="item._id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ item.sku }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ item.product?.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.quantity }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStockStatusClass(item)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ getStockStatusText(item) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state -->
      <div v-if="inventory.length === 0" class="text-center py-12">
        <p class="text-gray-500">Không có sản phẩm nào</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.js'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const inventory = ref([])
const loading = ref(false)

onMounted(async () => {
  if (!authStore.isAuthenticated || authStore.user?.role !== 'admin') {
    router.push('/login')
    return
  }
  
  await loadInventory()
})

// Load inventory
const loadInventory = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/inventory', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    inventory.value = response.data.inventory || []
  } catch (error) {
    console.error('Load inventory error:', error)
  } finally {
    loading.value = false
  }
}

// Helper functions
const getStockStatusClass = (item) => {
  if (item.quantity === 0) {
    return 'bg-red-100 text-red-800'
  } else if (item.quantity <= (item.lowStockThreshold || 10)) {
    return 'bg-yellow-100 text-yellow-800'
  } else {
    return 'bg-green-100 text-green-800'
  }
}

const getStockStatusText = (item) => {
  if (item.quantity === 0) {
    return 'Hết hàng'
  } else if (item.quantity <= (item.lowStockThreshold || 10)) {
    return 'Sắp hết'
  } else {
    return 'Còn hàng'
  }
}
</script>