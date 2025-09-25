<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@stores/auth.js'
import { useLoading } from '@composables/useLoading.js'
import { useNotification } from '@composables/useNotification.js'
import { getCategories } from '@api/categoryService.js'
import { getProductById, createProduct, updateProduct } from '@api/productService.js'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { showFormLoading, hideLoading } = useLoading()
const { showSuccess, showError } = useNotification()

const isEditMode = ref(false)
const productId = ref(null)
const loading = ref(false)
const saving = ref(false)

// Form data mapped to backend schema
const form = ref({
  name: '',
  sku: '',
  category_id: '',
  price: '',
  discount_price: '',
  stock: '',
  warranty: '',
  images: [], // Will combine main_image + additional_images when submitting
  main_image: '', // UI only
  additional_images: [], // UI only
  description: '',
  description_detail: '',
  specifications: {
    'Kích thước': '',
    'Trọng lượng': '',
    'Bảo hành': '',
    'Xuất xứ': ''
  },
  tags: [] // map from features
})

const categories = ref([])

const newFeature = ref('')
const newSpecKey = ref('')
const newSpecValue = ref('')

onMounted(async () => {
  if (!authStore.isAuthenticated || authStore.user?.role !== 'admin') {
    router.push('/login')
    return
  }
  await loadCategories()
  if (route.params.id) {
    isEditMode.value = true
    productId.value = route.params.id
    await loadProduct()
  }
})

const loadCategories = async () => {
  try {
    const res = await getCategories({ parentOnly: false })
    categories.value = res.categories || []
  } catch (e) {
    console.error('Load categories failed:', e)
    categories.value = []
  }
}

const loadProduct = async () => {
  try {
    loading.value = true
    const res = await getProductById(productId.value)
    const p = res.data
    // Populate form fields
    form.value.name = p.name || ''
    form.value.sku = p.sku || ''
    form.value.category_id = p.category_id?._id || p.category_id || ''
    form.value.price = p.price ?? ''
    form.value.discount_price = p.discount_price ?? ''
    form.value.stock = p.stock ?? ''
    form.value.warranty = p.warranty || ''
    form.value.description = p.description || ''
    form.value.description_detail = p.description_detail || ''
    form.value.specifications = p.specifications && typeof p.specifications === 'object' ? Object.fromEntries(Object.entries(p.specifications)) : {}
    form.value.tags = Array.isArray(p.tags) ? p.tags : []
    const imgs = Array.isArray(p.images) ? p.images : []
    form.value.main_image = imgs[0] || ''
    form.value.additional_images = imgs.slice(1)
  } catch (error) {
    console.error('Error loading product:', error)
    showError('Không thể tải thông tin sản phẩm')
  } finally {
    loading.value = false
  }
}

const addFeature = () => {
  if (newFeature.value.trim()) {
    form.value.tags.push(newFeature.value.trim())
    newFeature.value = ''
  }
}

const removeFeature = (index) => {
  form.value.tags.splice(index, 1)
}

const addSpecification = () => {
  if (newSpecKey.value.trim() && newSpecValue.value.trim()) {
    form.value.specifications[newSpecKey.value.trim()] = newSpecValue.value.trim()
    newSpecKey.value = ''
    newSpecValue.value = ''
  }
}

const removeSpecification = (key) => {
  delete form.value.specifications[key]
}

const addImage = () => {
  const url = prompt('Nhập URL hình ảnh:')
  if (url) {
    form.value.additional_images.push(url)
  }
}

const removeImage = (index) => {
  form.value.additional_images.splice(index, 1)
}

const validateForm = () => {
  const errors = []
  if (!form.value.name.trim()) errors.push('Tên sản phẩm không được để trống')
  if (!form.value.description.trim()) errors.push('Mô tả không được để trống')
  if (!form.value.price || parseFloat(form.value.price) <= 0) errors.push('Giá phải lớn hơn 0')
  if (!form.value.category_id) errors.push('Vui lòng chọn danh mục')
  if (form.value.stock === '' || parseInt(form.value.stock) < 0) errors.push('Số lượng tồn kho không hợp lệ')
  if (!form.value.sku.trim()) errors.push('SKU không được để trống')
  if (errors.length > 0) {
    showError(errors.join('\n'))
    return false
  }
  return true
}

const submitForm = async () => {
  if (!validateForm()) return
  let loader
  try {
    saving.value = true
    loader = showFormLoading('Đang lưu sản phẩm...')
    // Build payload per backend schema
    const images = [form.value.main_image, ...form.value.additional_images].filter(Boolean)
    const payload = {
      name: form.value.name.trim(),
      sku: form.value.sku.trim().toUpperCase(),
      category_id: form.value.category_id,
      price: Number(form.value.price),
      discount_price: form.value.discount_price ? Number(form.value.discount_price) : null,
      stock: Number(form.value.stock),
      warranty: form.value.warranty || undefined,
      images,
      description: form.value.description,
      description_detail: form.value.description_detail || undefined,
      specifications: form.value.specifications || {},
      tags: form.value.tags || [],
      isActive: true
    }

    if (isEditMode.value) {
      await updateProduct(productId.value, payload)
      showSuccess('Cập nhật sản phẩm thành công')
    } else {
      await createProduct(payload)
      showSuccess('Thêm sản phẩm thành công')
    }
    router.push('/admin/products')
  } catch (error) {
    console.error('Error saving product:', error)
    showError('Có lỗi xảy ra khi lưu sản phẩm')
  } finally {
    saving.value = false
    hideLoading(loader)
  }
}

const cancelForm = () => {
  if (confirm('Bạn có chắc chắn muốn hủy? Dữ liệu đã nhập sẽ bị mất.')) {
    router.push('/admin/products')
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <router-link to="/admin/products" class="text-indigo-600 hover:text-indigo-700 mr-4">
              ← Quay lại
            </router-link>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ isEditMode ? '✏️ Sửa sản phẩm' : '➕ Thêm sản phẩm mới' }}
            </h1>
          </div>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      <span class="ml-3 text-gray-600">Đang tải...</span>
    </div>

    <!-- Form -->
    <main v-else class="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <form @submit.prevent="submitForm" class="space-y-8">
        <!-- Basic Information -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">📝 Thông tin cơ bản</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Product Name -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Tên sản phẩm <span class="text-red-500">*</span>
              </label>
              <input v-model="form.name"
                     type="text"
                     required
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                     placeholder="Nhập tên sản phẩm...">
            </div>
            
            <!-- SKU -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">SKU</label>
              <input v-model="form.sku"
                     type="text"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                     placeholder="Mã sản phẩm...">
            </div>
            
            <!-- Category -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Danh mục <span class="text-red-500">*</span>
              </label>
              <select v-model="form.category_id"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Chọn danh mục</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>
            
            <!-- Warranty -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Bảo hành</label>
              <input v-model="form.warranty"
                     type="text"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                     placeholder="VD: 12 tháng...">
            </div>
            
            <!-- Description -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Mô tả sản phẩm <span class="text-red-500">*</span>
              </label>
              <textarea v-model="form.description"
                        required
                        rows="4"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Mô tả chi tiết về sản phẩm..."></textarea>
            </div>
            <!-- Long Description -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Mô tả chi tiết</label>
              <textarea v-model="form.description_detail" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" placeholder="Thông tin chi tiết, hướng dẫn, v.v..."></textarea>
            </div>
          </div>
        </div>

        <!-- Pricing & Stock -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">💰 Giá và tồn kho</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Price -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Giá bán <span class="text-red-500">*</span>
              </label>
              <input v-model="form.price"
                     type="number"
                     required
                     min="0"
                     step="1000"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                     placeholder="0">
            </div>
            
            <!-- Discount Price -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Giá khuyến mãi</label>
              <input v-model="form.discount_price"
                     type="number"
                     min="0"
                     step="1000"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                     placeholder="0">
            </div>
            
            <!-- Stock -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Số lượng tồn kho <span class="text-red-500">*</span>
              </label>
              <input v-model="form.stock"
                     type="number"
                     required
                     min="0"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                     placeholder="0">
            </div>
          </div>
        </div>

        <!-- Images -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">🖼️ Hình ảnh</h2>
          
          <!-- Main Image -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Hình ảnh chính</label>
            <input v-model="form.main_image"
                   type="url"
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                   placeholder="URL hình ảnh chính...">
            <div v-if="form.main_image" class="mt-3">
              <img :src="form.main_image" alt="Preview" class="h-32 w-32 object-cover rounded-lg border">
            </div>
          </div>
          
          <!-- Additional Images -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <label class="block text-sm font-medium text-gray-700">Hình ảnh phụ</label>
              <button type="button" @click="addImage"
                      class="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                + Thêm hình ảnh
              </button>
            </div>
            
            <div v-if="form.additional_images.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div v-for="(image, index) in form.additional_images" :key="index" 
                   class="relative group">
                <img :src="image" alt="Additional" class="h-24 w-24 object-cover rounded-lg border">
                <button type="button" @click="removeImage(index)"
                        class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Features -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">✨ Từ khóa/điểm nổi bật</h2>
          
          <div class="mb-4">
            <div class="flex gap-2">
              <input v-model="newFeature"
                     type="text"
                     class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                     placeholder="Nhập tính năng..."
                     @keyup.enter="addFeature">
              <button type="button" @click="addFeature"
                      class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Thêm
              </button>
            </div>
          </div>
          
          <div v-if="form.tags.length > 0" class="space-y-2">
            <div v-for="(feature, index) in form.tags" :key="index"
                 class="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <span class="text-sm text-gray-700">{{ feature }}</span>
              <button type="button" @click="removeFeature(index)"
                      class="text-red-600 hover:text-red-700 text-sm">
                Xóa
              </button>
            </div>
          </div>
        </div>

        <!-- Specifications -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">📋 Thông số kỹ thuật</h2>
          
          <div class="mb-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input v-model="newSpecKey"
                     type="text"
                     class="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                     placeholder="Tên thông số...">
              <input v-model="newSpecValue"
                     type="text"
                     class="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                     placeholder="Giá trị..."
                     @keyup.enter="addSpecification">
              <button type="button" @click="addSpecification"
                      class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Thêm
              </button>
            </div>
          </div>
          
          <div v-if="Object.keys(form.specifications).length > 0" class="space-y-2">
            <div v-for="(value, key) in form.specifications" :key="key"
                 class="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div class="flex-1 grid grid-cols-2 gap-4">
                <span class="text-sm font-medium text-gray-700">{{ key }}</span>
                <span class="text-sm text-gray-600">{{ value }}</span>
              </div>
              <button type="button" @click="removeSpecification(key)"
                      class="text-red-600 hover:text-red-700 text-sm ml-4">
                Xóa
              </button>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex items-center justify-end space-x-4 py-6">
          <button type="button" @click="cancelForm"
                  class="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
            Hủy
          </button>
          <button type="submit" :disabled="saving"
                  class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <span v-if="saving">Đang lưu...</span>
            <span v-else>{{ isEditMode ? 'Cập nhật' : 'Tạo sản phẩm' }}</span>
          </button>
        </div>
      </form>
    </main>
  </div>
</template>

<style scoped>
/* Custom styling for form elements */
input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99,102,241,0.2);
}

.required {
  color: #ef4444;
}
</style>
