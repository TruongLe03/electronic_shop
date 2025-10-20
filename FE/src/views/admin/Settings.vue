<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@stores/auth.js";
import AdminLayout from "@/layout/AdminLayout.vue";

const router = useRouter();
const authStore = useAuthStore();

// Settings data
const settings = ref({
  general: {
    siteName: "Electronic Shop",
    siteDescription: "Cửa hàng điện tử hàng đầu Việt Nam",
    contactEmail: "admin@electronicshop.com",
    contactPhone: "0123456789",
    address: "123 Đường ABC, Quận XYZ, TP. HCM",
  },
  business: {
    currency: "VND",
    taxRate: 10,
    shippingFee: 30000,
    freeShippingThreshold: 500000,
    orderPrefix: "ORDER",
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    orderNotifications: true,
    stockNotifications: true,
    promotionNotifications: true,
  },
});

const loading = ref(false);
const saving = ref(false);

onMounted(async () => {
  if (!authStore.isAuthenticated || authStore.user?.role !== "admin") {
    router.push("/login");
    return;
  }

  await loadSettings();
});

const loadSettings = async () => {
  try {
    loading.value = true;
    // TODO: Load settings from API
    // const response = await getSettings()
    // settings.value = response.data
  } catch (error) {
    console.error("Error loading settings:", error);
  } finally {
    loading.value = false;
  }
};

const saveSettings = async () => {
  try {
    saving.value = true;
    // TODO: Save settings via API
    // await updateSettings(settings.value)
    alert("Cài đặt đã được lưu thành công!");
  } catch (error) {
    console.error("Error saving settings:", error);
    alert("Có lỗi xảy ra khi lưu cài đặt");
  } finally {
    saving.value = false;
  }
};

const resetSettings = () => {
  if (confirm("Bạn có chắc chắn muốn khôi phục cài đặt mặc định?")) {
    loadSettings();
  }
};
</script>

<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div
        class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div
              class="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xl"
            >
              <i class="fas fa-cog"></i>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-800 dark:text-white">
                Cài đặt hệ thống
              </h1>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Quản lý cấu hình và tùy chỉnh hệ thống
              </p>
            </div>
          </div>

          <div class="flex space-x-3">
            <button
              @click="resetSettings"
              :disabled="saving"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors disabled:opacity-50"
            >
              <i class="fas fa-undo mr-2"></i>
              Khôi phục
            </button>
            <button
              @click="saveSettings"
              :disabled="saving"
              class="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              <i class="fas fa-save mr-2"></i>
              {{ saving ? "Đang lưu..." : "Lưu cài đặt" }}
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- General Settings -->
        <div
          class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6"
        >
          <h2
            class="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center"
          >
            <i class="fas fa-globe mr-2 text-blue-600"></i>
            Cài đặt chung
          </h2>

          <div class="space-y-4">
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >Tên website</label
              >
              <input
                v-model="settings.general.siteName"
                type="text"
                class="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >Mô tả website</label
              >
              <textarea
                v-model="settings.general.siteDescription"
                rows="3"
                class="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              ></textarea>
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >Email liên hệ</label
              >
              <input
                v-model="settings.general.contactEmail"
                type="email"
                class="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >Số điện thoại</label
              >
              <input
                v-model="settings.general.contactPhone"
                type="tel"
                class="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >Địa chỉ</label
              >
              <input
                v-model="settings.general.address"
                type="text"
                class="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        <!-- Business Settings -->
        <div
          class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6"
        >
          <h2
            class="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center"
          >
            <i class="fas fa-store mr-2 text-green-600"></i>
            Cài đặt kinh doanh
          </h2>

          <div class="space-y-4">
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >Đơn vị tiền tệ</label
              >
              <select
                v-model="settings.business.currency"
                class="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="VND">VND - Việt Nam Đồng</option>
                <option value="USD">USD - US Dollar</option>
              </select>
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >Thuế VAT (%)</label
              >
              <input
                v-model.number="settings.business.taxRate"
                type="number"
                min="0"
                max="100"
                class="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >Phí vận chuyển (VND)</label
              >
              <input
                v-model.number="settings.business.shippingFee"
                type="number"
                min="0"
                class="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >Miễn phí ship từ (VND)</label
              >
              <input
                v-model.number="settings.business.freeShippingThreshold"
                type="number"
                min="0"
                class="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >Tiền tố đơn hàng</label
              >
              <input
                v-model="settings.business.orderPrefix"
                type="text"
                class="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Notification Settings -->
      <div
        class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6"
      >
        <h2
          class="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center"
        >
          <i class="fas fa-bell mr-2 text-yellow-600"></i>
          Cài đặt thông báo
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div
            class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Email</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Thông báo qua email
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="settings.notifications.emailNotifications"
                type="checkbox"
                class="sr-only peer"
              />
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
              ></div>
            </label>
          </div>

          <div
            class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <div>
              <p class="font-medium text-gray-900 dark:text-white">SMS</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Thông báo qua tin nhắn
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="settings.notifications.smsNotifications"
                type="checkbox"
                class="sr-only peer"
              />
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
              ></div>
            </label>
          </div>

          <div
            class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Đơn hàng</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Thông báo đơn hàng mới
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="settings.notifications.orderNotifications"
                type="checkbox"
                class="sr-only peer"
              />
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
              ></div>
            </label>
          </div>

          <div
            class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Tồn kho</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Cảnh báo hết hàng
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="settings.notifications.stockNotifications"
                type="checkbox"
                class="sr-only peer"
              />
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
              ></div>
            </label>
          </div>

          <div
            class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <div>
              <p class="font-medium text-gray-900 dark:text-white">
                Khuyến mãi
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Thông báo khuyến mãi
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="settings.notifications.promotionNotifications"
                type="checkbox"
                class="sr-only peer"
              />
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
              ></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
