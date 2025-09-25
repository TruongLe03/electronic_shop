<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@components/admin/AdminLayout.vue'
import { useAuthStore } from '@stores/auth.js'
import { getProducts, deleteProduct } from '@api/productService.js'
import { getCategories } from '@api/categoryService.js'
import { getFullImage, handleImageError } from '@utils/imageUtils.js'
import { useNotification } from '@composables/useNotification.js'
import { usePagination } from '@composables/usePagination.js'

// Router & Auth
const router = useRouter()
const authStore = useAuthStore()
const { showSuccess, showError } = useNotification()

// State
const loading = ref(false)
const products = ref([])
const categories = ref([])

// Filters & query params
const search = ref('')
const selectedCategory = ref('')
const inStockOnly = ref(false)
const onSaleOnly = ref(false)
const sortBy = ref('createdAt')
const sortOrder = ref('desc')
const itemsPerPage = ref(12)

// Pagination
const { currentPage, totalItems, updateTotal, reset } = usePagination(itemsPerPage.value)

// Reactive pagination based on itemsPerPage
const totalPagesCalc = computed(() => Math.max(1, Math.ceil((totalItems.value || 0) / (itemsPerPage.value || 1))))
const visiblePagesCalc = computed(() => {
  const total = totalPagesCalc.value
  const current = currentPage.value
  const pages = []
  if (total <= 10) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else if (current <= 3) {
    for (let i = 1; i <= 3; i++) pages.push(i)
    if (total > 4) pages.push('...')
    pages.push(total)
  } else if (current >= total - 2) {
    pages.push(1)
    if (total > 4) pages.push('...')
    for (let i = total - 2; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 4) pages.push('...')
    for (let i = current - 1; i <= current + 1; i++) pages.push(i)
    if (current < total - 3) pages.push('...')
    pages.push(total)
  }
  return pages
})

watch(itemsPerPage, () => {
  // Reset pagination when page size changes
  reset()
  currentPage.value = 1
  loadProducts()
})

watch([selectedCategory, inStockOnly, onSaleOnly, sortBy, sortOrder], () => {
  goTo(1)
})

// Computed helpers
const hasFilters = computed(() => !!(search.value || selectedCategory.value || inStockOnly.value || onSaleOnly.value))

// Lifecycle
onMounted(async () => {
  if (!authStore.isAuthenticated || authStore.user?.role !== 'admin') {
    router.push('/login')
    return
  }
  await Promise.all([loadCategories(), loadProducts()])
})

// Loaders
const loadCategories = async () => {
  try {
    const res = await getCategories({ parentOnly: false })
    categories.value = res.categories || []
  } catch (e) {
    console.error('Failed to load categories:', e)
    categories.value = []
  }
}

const loadProducts = async () => {
  try {
    loading.value = true
    const res = await getProducts({
      page: currentPage.value,
      limit: itemsPerPage.value,
      categoryId: selectedCategory.value || undefined,
      inStock: inStockOnly.value || undefined,
      onSale: onSaleOnly.value || undefined,
      search: search.value || undefined,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value,
    })

    products.value = res.data || []
    updateTotal(res.total || 0)
  } catch (e) {
    console.error('Failed to load products:', e)
    products.value = []
    updateTotal(0)
  } finally {
    loading.value = false
  }
}

// Handlers
const handleSearch = () => {
  goTo(1)
}

const clearFilters = () => {
  search.value = ''
  selectedCategory.value = ''
  inStockOnly.value = false
  onSaleOnly.value = false
  sortBy.value = 'createdAt'
  sortOrder.value = 'desc'
  goTo(1)
}

const goTo = async (page) => {
  const p = Math.min(Math.max(1, page), totalPagesCalc.value)
  if (p !== currentPage.value) currentPage.value = p
  await loadProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const prev = async () => {
  if (currentPage.value > 1) {
    await goTo(currentPage.value - 1)
  }
}

const next = async () => {
  if (currentPage.value < totalPagesCalc.value) {
    await goTo(currentPage.value + 1)
  }
}

const confirmDelete = async (product) => {
  const ok = window.confirm(`Xóa sản phẩm "${product.name}"? Hành động này không thể hoàn tác.`)
  if (!ok) return
  try {
    await deleteProduct(product._id)
    showSuccess('Đã xóa sản phẩm')
    // Reload current page; if last item removed, may need to step back a page
    const isLastItemOnPage = products.value.length === 1 && currentPage.value > 1
    if (isLastItemOnPage) {
      await goTo(currentPage.value - 1)
    } else {
      await loadProducts()
    }
  } catch (e) {
    console.error('Delete product failed:', e)
    showError('Không thể xóa sản phẩm')
  }
}

const formatCurrency = (amount) => {
  if (amount == null || isNaN(amount)) return '0 ₫'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

const discountBadge = (product) => {
  const percent = product.discount_percent || (product.price && product.discount_price ? Math.round(((product.price - product.discount_price) / product.price) * 100) : 0)
  return percent > 0 ? `-${percent}%` : null
}

const categoryName = (product) => product.category_id?.name || product.category?.name || '—'

const goAdd = () => router.push('/admin/products/add')
const goEdit = (id) => router.push(`/admin/products/edit/${id}`)

</script>

<template>
  <AdminLayout title="Quản lý Sản phẩm" subtitle="Danh sách, lọc, sắp xếp và thao tác" icon="fas fa-box">
    <!-- Filters -->
    <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
        <!-- Search -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            <i class="fas fa-search mr-1" /> Tìm kiếm
          </label>
          <div class="relative">
            <input v-model="search" type="text" placeholder="Tên, mô tả, tag, SKU..." @keyup.enter="handleSearch"
              class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <!-- Category -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
          <select v-model="selectedCategory" class="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500">
            <option value="">Tất cả</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>

        <!-- Toggles -->
        <div class="flex items-center gap-4">
          <label class="inline-flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" v-model="inStockOnly" class="rounded border-gray-300" />
            Còn hàng
          </label>
          <label class="inline-flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" v-model="onSaleOnly" class="rounded border-gray-300" />
            Đang giảm giá
          </label>
        </div>

        <!-- Sort -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Sắp xếp</label>
          <div class="flex gap-2">
            <select v-model="sortBy" class="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500">
              <option value="createdAt">Mới nhất</option>
              <option value="name">Tên</option>
              <option value="price">Giá</option>
              <option value="sold">Bán chạy</option>
              <option value="rating">Đánh giá</option>
            </select>
            <button @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'; handleSearch()"
              class="px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50">
              <i :class="sortOrder === 'asc' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'" />
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3">
          <button @click="clearFilters" :disabled="!hasFilters"
            class="px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            <i class="fas fa-times mr-2" /> Xóa lọc
          </button>
          <button @click="goAdd" class="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
            <i class="fas fa-plus mr-2" /> Thêm sản phẩm
          </button>
        </div>
      </div>

      <!-- Refresh Row -->
      <div class="mt-4 flex items-center justify-between">
        <div class="text-sm text-gray-500">
          Tổng: <span class="font-medium text-gray-900">{{ totalItems }}</span> sản phẩm
        </div>
        <div class="flex items-center gap-3">
          <label class="text-sm text-gray-700">Hiển thị</label>
          <select v-model.number="itemsPerPage" class="px-2 py-1 border border-gray-200 rounded-lg">
            <option :value="8">8</option>
            <option :value="12">12</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
          <button @click="handleSearch" :disabled="loading"
            class="px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
            <i class="fas fa-sync" :class="{ 'animate-spin': loading }" /> Làm mới
          </button>
        </div>
      </div>
    </div>

    <!-- Grid/List -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="i in 8" :key="i" class="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
        <div class="w-full h-40 bg-gray-200 rounded-xl mb-4" />
        <div class="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div class="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>

    <div v-else>
      <div v-if="products.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="p in products" :key="p._id" class="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden">
          <!-- Image -->
          <div class="relative">
            <img :src="getFullImage(p.images?.[0])" @error="handleImageError" class="w-full h-44 object-cover" alt="product" />
            <div v-if="discountBadge(p)" class="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-md">
              {{ discountBadge(p) }}
            </div>
            <div v-if="(p.stock ?? 0) <= 0" class="absolute top-3 right-3 bg-gray-800 text-white text-xs px-2 py-1 rounded-md">Hết hàng</div>
          </div>

          <!-- Body -->
          <div class="p-4 space-y-2">
            <div class="flex items-start justify-between gap-2">
              <h3 class="font-semibold text-gray-900 line-clamp-2">{{ p.name }}</h3>
            </div>
            <div class="text-sm text-gray-500">SKU: <span class="text-gray-700 font-medium">{{ p.sku }}</span></div>
            <div class="text-sm text-gray-500">Danh mục: <span class="text-gray-700">{{ categoryName(p) }}</span></div>

            <div class="flex items-baseline gap-2">
              <div class="text-lg font-bold text-indigo-600">{{ formatCurrency(p.discount_price ?? p.price) }}</div>
              <div v-if="p.discount_price" class="text-sm line-through text-gray-400">{{ formatCurrency(p.price) }}</div>
            </div>

            <div class="flex items-center justify-between text-sm">
              <div class="text-gray-600">Tồn: <span class="font-medium">{{ p.stock ?? 0 }}</span></div>
              <div class="text-gray-600">Bán: <span class="font-medium">{{ p.sold ?? 0 }}</span></div>
            </div>
          </div>

          <!-- Actions -->
          <div class="px-4 pb-4 pt-2 flex items-center justify-between gap-2">
            <button @click="goEdit(p._id)" class="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
              <i class="fas fa-edit mr-2 text-indigo-600" /> Sửa
            </button>
            <button @click="confirmDelete(p)" class="px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100">
              <i class="fas fa-trash" />
            </button>
          </div>
        </div>
      </div>

      <div v-else class="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-600">
        <div class="text-5xl mb-3">🗂️</div>
        Không có sản phẩm nào khớp bộ lọc.
      </div>

      <!-- Pagination -->
      <div v-if="totalPagesCalc > 1" class="mt-8 flex items-center justify-center gap-2">
        <button @click="prev" :disabled="currentPage === 1" class="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50">
          <i class="fas fa-chevron-left" />
        </button>
        <button v-for="p in visiblePagesCalc" :key="p" @click="typeof p === 'number' && goTo(p)"
          :disabled="p === '...'" :class="[
            'px-3 py-2 border rounded-lg hover:bg-gray-50',
            currentPage === p ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700' : '',
            p === '...' ? 'cursor-default' : ''
          ]">
          {{ p }}
        </button>
        <button @click="next" :disabled="currentPage === totalPagesCalc" class="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50">
          <i class="fas fa-chevron-right" />
        </button>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
