<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Cài đặt hệ thống</h1>
          <p class="mt-1 text-sm text-gray-500">
            Quản lý các cài đặt cấu hình của hệ thống
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Menu -->
        <div class="lg:col-span-1">
          <nav class="bg-white rounded-lg shadow-sm border p-4">
            <ul class="space-y-2">
              <li>
                <button
                  @click="activeTab = 'general'"
                  :class="[
                    'w-full text-left px-4 py-2 rounded-lg transition-colors',
                    activeTab === 'general' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  ]"
                >
                  <div class="flex items-center gap-3">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    Cài đặt chung
                  </div>
                </button>
              </li>
              <li>
                <button
                  @click="activeTab = 'ecommerce'"
                  :class="[
                    'w-full text-left px-4 py-2 rounded-lg transition-colors',
                    activeTab === 'ecommerce' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  ]"
                >
                  <div class="flex items-center gap-3">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6.001"/>
                    </svg>
                    Thương mại điện tử
                  </div>
                </button>
              </li>
              <li>
                <button
                  @click="activeTab = 'contact'"
                  :class="[
                    'w-full text-left px-4 py-2 rounded-lg transition-colors',
                    activeTab === 'contact' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  ]"
                >
                  <div class="flex items-center gap-3">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    Thông tin liên hệ
                  </div>
                </button>
              </li>
              <li>
                <button
                  @click="activeTab = 'system'"
                  :class="[
                    'w-full text-left px-4 py-2 rounded-lg transition-colors',
                    activeTab === 'system' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  ]"
                >
                  <div class="flex items-center gap-3">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                    Thông tin hệ thống
                  </div>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <!-- Content -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-sm border">
            <div v-if="loading" class="p-8 text-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p class="mt-2 text-gray-500">Đang tải...</p>
            </div>

            <div v-else>
              <!-- General Settings -->
              <div v-if="activeTab === 'general'" class="p-6">
                <h3 class="text-lg font-medium mb-4">Cài đặt chung</h3>
                <form @submit.prevent="saveSettings">
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Tên website</label>
                      <input
                        v-model="settings.siteName"
                        type="text"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tên website"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Mô tả website</label>
                      <textarea
                        v-model="settings.siteDescription"
                        rows="3"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Mô tả ngắn về website"
                      ></textarea>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Từ khóa SEO</label>
                      <input
                        v-model="settings.siteKeywords"
                        type="text"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="từ khóa, seo, website"
                      />
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Đơn vị tiền tệ</label>
                        <select
                          v-model="settings.currency"
                          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="VND">VND - Việt Nam Đồng</option>
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                        </select>
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Múi giờ</label>
                        <select
                          v-model="settings.timezone"
                          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</option>
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">America/New_York</option>
                        </select>
                      </div>
                    </div>

                    <div class="flex items-center gap-4">
                      <label class="flex items-center">
                        <input
                          v-model="settings.maintenanceMode"
                          type="checkbox"
                          class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span class="ml-2 text-sm text-gray-700">Chế độ bảo trì</span>
                      </label>

                      <label class="flex items-center">
                        <input
                          v-model="settings.registrationEnabled"
                          type="checkbox"
                          class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span class="ml-2 text-sm text-gray-700">Cho phép đăng ký</span>
                      </label>
                    </div>
                  </div>
                </form>
              </div>

              <!-- E-commerce Settings -->
              <div v-if="activeTab === 'ecommerce'" class="p-6">
                <h3 class="text-lg font-medium mb-4">Cài đặt thương mại điện tử</h3>
                <form @submit.prevent="saveSettings">
                  <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Số tiền tối đa đơn hàng</label>
                        <input
                          v-model.number="settings.maxOrderAmount"
                          type="number"
                          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="100000000"
                        />
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Số tiền tối thiểu đơn hàng</label>
                        <input
                          v-model.number="settings.minOrderAmount"
                          type="number"
                          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="50000"
                        />
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Phí ship</label>
                        <input
                          v-model.number="settings.shippingFee"
                          type="number"
                          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="30000"
                        />
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Miễn phí ship từ</label>
                        <input
                          v-model.number="settings.freeShippingThreshold"
                          type="number"
                          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="500000"
                        />
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Thuế VAT (%)</label>
                      <input
                        v-model.number="settings.taxRate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.1"
                      />
                    </div>
                  </div>
                </form>
              </div>

              <!-- Contact Settings -->
              <div v-if="activeTab === 'contact'" class="p-6">
                <h3 class="text-lg font-medium mb-4">Thông tin liên hệ</h3>
                <form @submit.prevent="saveSettings">
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Email liên hệ</label>
                      <input
                        v-model="settings.contactInfo.email"
                        type="email"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="admin@example.com"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                      <input
                        v-model="settings.contactInfo.phone"
                        type="tel"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0123456789"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                      <textarea
                        v-model="settings.contactInfo.address"
                        rows="3"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Địa chỉ liên hệ"
                      ></textarea>
                    </div>
                  </div>
                </form>
              </div>

              <!-- System Info -->
              <div v-if="activeTab === 'system'" class="p-6">
                <h3 class="text-lg font-medium mb-4">Thông tin hệ thống</h3>
                
                <div class="space-y-6">
                  <div class="grid grid-cols-2 gap-4">
                    <div class="bg-gray-50 p-4 rounded-lg">
                      <h4 class="font-medium text-gray-900 mb-2">Máy chủ</h4>
                      <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                          <span class="text-gray-600">Node.js:</span>
                          <span class="font-mono">{{ systemInfo.server?.nodeVersion }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">Platform:</span>
                          <span class="font-mono">{{ systemInfo.server?.platform }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">Uptime:</span>
                          <span class="font-mono">{{ formatUptime(systemInfo.server?.uptime) }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="bg-gray-50 p-4 rounded-lg">
                      <h4 class="font-medium text-gray-900 mb-2">Bộ nhớ</h4>
                      <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                          <span class="text-gray-600">RSS:</span>
                          <span class="font-mono">{{ formatBytes(systemInfo.server?.memoryUsage?.rss) }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">Heap Used:</span>
                          <span class="font-mono">{{ formatBytes(systemInfo.server?.memoryUsage?.heapUsed) }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">Heap Total:</span>
                          <span class="font-mono">{{ formatBytes(systemInfo.server?.memoryUsage?.heapTotal) }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="bg-gray-50 p-4 rounded-lg">
                      <h4 class="font-medium text-gray-900 mb-2">Cơ sở dữ liệu</h4>
                      <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                          <span class="text-gray-600">Trạng thái:</span>
                          <span :class="systemInfo.database?.connected ? 'text-green-600' : 'text-red-600'">
                            {{ systemInfo.database?.connected ? 'Kết nối' : 'Ngắt kết nối' }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div class="bg-gray-50 p-4 rounded-lg">
                      <h4 class="font-medium text-gray-900 mb-2">API</h4>
                      <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                          <span class="text-gray-600">Version:</span>
                          <span class="font-mono">{{ systemInfo.api?.version }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">Environment:</span>
                          <span class="font-mono">{{ systemInfo.api?.environment }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Save Button -->
              <div v-if="activeTab !== 'system'" class="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                <div class="flex justify-end">
                  <button
                    @click="saveSettings"
                    :disabled="saving"
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    {{ saving ? 'Đang lưu...' : 'Lưu cài đặt' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AdminLayout from '@/components/admin/AdminLayout.vue';
import { useAdminSettings } from '@/composables/admin/useAdminSettings.js';

const {
  settings,
  systemInfo,
  loading,
  saving,
  error,
  fetchSettings,
  fetchSystemInfo,
  updateSettings
} = useAdminSettings();

const activeTab = ref('general');

// Methods
const saveSettings = async () => {
  try {
    await updateSettings(settings.value);
    // Show success message
    alert('Cài đặt đã được lưu thành công!');
  } catch (err) {
    alert('Có lỗi xảy ra khi lưu cài đặt: ' + err.message);
  }
};

const formatUptime = (seconds) => {
  if (!seconds) return '0s';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

// Initial load
onMounted(() => {
  fetchSettings();
  fetchSystemInfo();
});
</script>