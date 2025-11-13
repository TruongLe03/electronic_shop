<template>
  <AdminLayout>
    <div class="p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Quản lý mã giảm giá</h1>
          <p class="text-gray-600 mt-1">Quản lý các mã giảm giá của cửa hàng</p>
        </div>
        <button
          @click="openCreateModal"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Tạo mã giảm giá
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Tổng số mã</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
            </div>
            <div class="bg-blue-100 p-3 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Đang hoạt động</p>
              <p class="text-2xl font-bold text-green-600">{{ stats.active }}</p>
            </div>
            <div class="bg-green-100 p-3 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Hết hạn</p>
              <p class="text-2xl font-bold text-red-600">{{ stats.expired }}</p>
            </div>
            <div class="bg-red-100 p-3 rounded-lg">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Đã sử dụng</p>
              <p class="text-2xl font-bold text-purple-600">{{ stats.used }}</p>
            </div>
            <div class="bg-purple-100 p-3 rounded-lg">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Tìm mã giảm giá..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              v-model="filterStatus"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Tạm dừng</option>
              <option value="expired">Hết hạn</option>
            </select>
          </div>
          <div>
            <select
              v-model="filterType"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả loại</option>
              <option value="percent">Giảm theo %</option>
              <option value="amount">Giảm số tiền</option>
            </select>
          </div>
          <div class="flex gap-2">
            <button
              @click="loadCoupons"
              class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              Làm mới
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Coupons Table -->
      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã code</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiêu đề</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giảm giá</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điều kiện</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sử dụng</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hạn sử dụng</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="coupon in filteredCoupons" :key="coupon._id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-bold text-sm">
                      {{ coupon.code }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ coupon.title }}</div>
                  <div v-if="coupon.description" class="text-sm text-gray-500 truncate max-w-xs">
                    {{ coupon.description }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    v-if="coupon.discount_type === 'percent'"
                    class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold"
                  >
                    -{{ coupon.discount_value }}%
                  </span>
                  <span
                    v-else
                    class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold"
                  >
                    -{{ formatPrice(coupon.discount_value) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <div>Tối thiểu: {{ formatPrice(coupon.min_order_value) }}</div>
                  <div v-if="coupon.max_discount_amount">
                    Tối đa: {{ formatPrice(coupon.max_discount_amount) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ coupon.used_count || 0 }} / {{ coupon.max_uses || '∞' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ formatDate(coupon.expiry_date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="getStatusClass(coupon)"
                    class="px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {{ getStatusText(coupon) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div class="flex items-center gap-2">
                    <button
                      @click="openEditModal(coupon)"
                      class="text-blue-600 hover:text-blue-800 p-1"
                      title="Sửa"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      v-if="coupon.status === 'active'"
                      @click="toggleStatus(coupon)"
                      class="text-yellow-600 hover:text-yellow-800 p-1"
                      title="Tạm dừng"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button
                      v-else-if="coupon.status === 'inactive'"
                      @click="toggleStatus(coupon)"
                      class="text-green-600 hover:text-green-800 p-1"
                      title="Kích hoạt"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button
                      @click="deleteCoupon(coupon)"
                      class="text-red-600 hover:text-red-800 p-1"
                      title="Xóa"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredCoupons.length === 0">
                <td colspan="8" class="px-6 py-12 text-center text-gray-500">
                  Không tìm thấy mã giảm giá nào
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="mt-6 flex justify-center">
        <div class="flex gap-2">
          <button
            @click="goToPage(pagination.currentPage - 1)"
            :disabled="pagination.currentPage === 1"
            class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Trước
          </button>
          <button
            v-for="page in displayedPages"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-4 py-2 border rounded-lg',
              page === pagination.currentPage
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 hover:bg-gray-50'
            ]"
          >
            {{ page }}
          </button>
          <button
            @click="goToPage(pagination.currentPage + 1)"
            :disabled="pagination.currentPage === pagination.totalPages"
            class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Sau
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        @click.self="closeModal"
      >
        <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <!-- Modal Header -->
          <div class="flex items-center justify-between p-6 border-b">
            <h3 class="text-xl font-bold">
              {{ editingCoupon ? 'Sửa mã giảm giá' : 'Tạo mã giảm giá mới' }}
            </h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <form @submit.prevent="saveCoupon" class="p-6 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Code -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Mã code <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.code"
                  type="text"
                  required
                  :disabled="editingCoupon !== null"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase disabled:bg-gray-100"
                  placeholder="VD: SALE50"
                />
              </div>

              <!-- Title -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.title"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Giảm 50%"
                />
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
              <textarea
                v-model="form.description"
                rows="2"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Mô tả chi tiết về mã giảm giá"
              ></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Discount Type -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Loại giảm giá <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="form.discount_type"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="percent">Phần trăm (%)</option>
                  <option value="amount">Số tiền cố định (VNĐ)</option>
                </select>
              </div>

              <!-- Discount Value -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Giá trị giảm <span class="text-red-500">*</span>
                </label>
                <input
                  v-model.number="form.discount_value"
                  type="number"
                  required
                  min="0"
                  :max="form.discount_type === 'percent' ? 100 : undefined"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  :placeholder="form.discount_type === 'percent' ? 'VD: 50' : 'VD: 100000'"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Min Order Value -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Giá trị đơn tối thiểu <span class="text-red-500">*</span>
                </label>
                <input
                  v-model.number="form.min_order_value"
                  type="number"
                  required
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: 100000"
                />
              </div>

              <!-- Max Discount Amount -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Giảm tối đa (VNĐ)
                </label>
                <input
                  v-model.number="form.max_discount_amount"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Để trống nếu không giới hạn"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Max Uses -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Số lần sử dụng tối đa
                </label>
                <input
                  v-model.number="form.max_uses"
                  type="number"
                  min="1"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Để trống nếu không giới hạn"
                />
              </div>

              <!-- Usage Limit Per User -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Giới hạn mỗi người
                </label>
                <input
                  v-model.number="form.usage_limit_per_user"
                  type="number"
                  min="1"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: 1"
                />
              </div>
            </div>

            <!-- Expiry Date -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Ngày hết hạn <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.expiry_date"
                type="datetime-local"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <!-- Status -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
              <select
                v-model="form.status"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm dừng</option>
              </select>
            </div>

            <!-- Buttons -->
            <div class="flex gap-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg"
              >
                {{ saving ? 'Đang lưu...' : (editingCoupon ? 'Cập nhật' : 'Tạo mới') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useNotification } from '@composables/client/useNotification';
import AdminLayout from '@/layout/AdminLayout.vue';
import * as couponService from '@api/couponService';

const { showSuccess, showError } = useNotification();

// State
const coupons = ref([]);
const loading = ref(false);
const saving = ref(false);
const searchQuery = ref('');
const filterStatus = ref('');
const filterType = ref('');
const showModal = ref(false);
const editingCoupon = ref(null);

// Pagination
const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  limit: 20
});

// Form
const form = ref({
  code: '',
  title: '',
  description: '',
  discount_type: 'percent',
  discount_value: 0,
  min_order_value: 0,
  max_discount_amount: null,
  max_uses: null,
  usage_limit_per_user: 1,
  expiry_date: '',
  status: 'active'
});

// Computed
const stats = computed(() => {
  const now = new Date();
  return {
    total: coupons.value.length,
    active: coupons.value.filter(c => c.status === 'active' && new Date(c.expiry_date) > now).length,
    expired: coupons.value.filter(c => new Date(c.expiry_date) <= now).length,
    used: coupons.value.reduce((sum, c) => sum + (c.used_count || 0), 0)
  };
});

const filteredCoupons = computed(() => {
  let filtered = coupons.value;

  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(c =>
      c.code.toLowerCase().includes(query) ||
      c.title.toLowerCase().includes(query)
    );
  }

  // Filter by status
  if (filterStatus.value) {
    const now = new Date();
    if (filterStatus.value === 'expired') {
      filtered = filtered.filter(c => new Date(c.expiry_date) <= now);
    } else {
      filtered = filtered.filter(c => c.status === filterStatus.value && new Date(c.expiry_date) > now);
    }
  }

  // Filter by type
  if (filterType.value) {
    filtered = filtered.filter(c => c.discount_type === filterType.value);
  }

  return filtered;
});

const displayedPages = computed(() => {
  const pages = [];
  const total = pagination.value.totalPages;
  const current = pagination.value.currentPage;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('...');
      pages.push(total);
    } else if (current >= total - 3) {
      pages.push(1);
      pages.push('...');
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = current - 1; i <= current + 1; i++) pages.push(i);
      pages.push('...');
      pages.push(total);
    }
  }

  return pages;
});

// Methods
const loadCoupons = async () => {
  try {
    loading.value = true;
    const response = await couponService.getAllCoupons(pagination.value.currentPage, pagination.value.limit);
    
    if (response.success) {
      coupons.value = response.data.coupons || [];
      pagination.value = {
        ...pagination.value,
        totalPages: response.data.totalPages || 1,
        totalItems: response.data.totalCoupons || 0
      };
    }
  } catch (error) {
    console.error('Error loading coupons:', error);
    showError('Không thể tải danh sách mã giảm giá');
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  editingCoupon.value = null;
  resetForm();
  showModal.value = true;
};

const openEditModal = (coupon) => {
  editingCoupon.value = coupon;
  form.value = {
    code: coupon.code,
    title: coupon.title,
    description: coupon.description || '',
    discount_type: coupon.discount_type,
    discount_value: coupon.discount_value,
    min_order_value: coupon.min_order_value,
    max_discount_amount: coupon.max_discount_amount || null,
    max_uses: coupon.max_uses || null,
    usage_limit_per_user: coupon.usage_limit_per_user || 1,
    expiry_date: new Date(coupon.expiry_date).toISOString().slice(0, 16),
    status: coupon.status
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingCoupon.value = null;
  resetForm();
};

const resetForm = () => {
  form.value = {
    code: '',
    title: '',
    description: '',
    discount_type: 'percent',
    discount_value: 0,
    min_order_value: 0,
    max_discount_amount: null,
    max_uses: null,
    usage_limit_per_user: 1,
    expiry_date: '',
    status: 'active'
  };
};

const saveCoupon = async () => {
  try {
    saving.value = true;

    const data = {
      ...form.value,
      code: form.value.code.toUpperCase()
    };

    let response;
    if (editingCoupon.value) {
      response = await couponService.updateCoupon(editingCoupon.value._id, data);
    } else {
      response = await couponService.createCoupon(data);
    }

    if (response.success) {
      showSuccess(editingCoupon.value ? 'Cập nhật mã giảm giá thành công' : 'Tạo mã giảm giá thành công');
      closeModal();
      await loadCoupons();
    } else {
      showError(response.message || 'Có lỗi xảy ra');
    }
  } catch (error) {
    console.error('Error saving coupon:', error);
    showError(error.message || 'Không thể lưu mã giảm giá');
  } finally {
    saving.value = false;
  }
};

const toggleStatus = async (coupon) => {
  try {
    const newStatus = coupon.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'activate' : 'deactivate';
    
    const response = await couponService[action + 'Coupon'](coupon._id);
    
    if (response.success) {
      showSuccess(`${newStatus === 'active' ? 'Kích hoạt' : 'Tạm dừng'} mã giảm giá thành công`);
      await loadCoupons();
    }
  } catch (error) {
    console.error('Error toggling status:', error);
    showError('Không thể thay đổi trạng thái');
  }
};

const deleteCoupon = async (coupon) => {
  if (!confirm(`Bạn có chắc muốn xóa mã "${coupon.code}"?`)) return;

  try {
    const response = await couponService.deleteCoupon(coupon._id);
    
    if (response.success) {
      showSuccess('Xóa mã giảm giá thành công');
      await loadCoupons();
    }
  } catch (error) {
    console.error('Error deleting coupon:', error);
    showError('Không thể xóa mã giảm giá');
  }
};

const goToPage = (page) => {
  if (page >= 1 && page <= pagination.value.totalPages && page !== '...') {
    pagination.value.currentPage = page;
    loadCoupons();
  }
};

const getStatusClass = (coupon) => {
  const now = new Date();
  const expiryDate = new Date(coupon.expiry_date);

  if (expiryDate <= now) {
    return 'bg-gray-100 text-gray-800';
  }

  if (coupon.status === 'active') {
    return 'bg-green-100 text-green-800';
  }

  return 'bg-yellow-100 text-yellow-800';
};

const getStatusText = (coupon) => {
  const now = new Date();
  const expiryDate = new Date(coupon.expiry_date);

  if (expiryDate <= now) {
    return 'Hết hạn';
  }

  if (coupon.status === 'active') {
    return 'Hoạt động';
  }

  return 'Tạm dừng';
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Lifecycle
onMounted(() => {
  loadCoupons();
});
</script>
