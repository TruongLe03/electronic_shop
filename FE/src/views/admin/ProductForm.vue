<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../../stores/auth.js";
import { useLoading } from "../../composables/useLoading.js";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { showFormLoading, hideLoading } = useLoading();

const isEditMode = ref(false);
const productId = ref(null);
const loading = ref(false);
const saving = ref(false);

// Form data
const form = ref({
  name: "",
  description: "",
  price: "",
  original_price: "",
  category: "",
  brand: "",
  SKU: "",
  stock_quantity: "",
  warranty: "",
  main_image: "",
  additional_images: [],
  specifications: {
    "Kích thước": "",
    "Trọng lượng": "",
    "Bảo hành": "",
    "Xuất xứ": "",
  },
  features: [],
});

const categories = ref([
  "Arduino & Vi điều khiển",
  "Cảm biến IoT",
  "Robot & Automation",
  "Phụ kiện điện tử",
  "Module & Shield",
  "Màn hình & Display",
]);

const newFeature = ref("");
const newSpecKey = ref("");
const newSpecValue = ref("");

onMounted(async () => {
  if (!authStore.isAuthenticated || authStore.user?.role !== "admin") {
    router.push("/login");
    return;
  }

  // Check if edit mode
  if (route.params.id) {
    isEditMode.value = true;
    productId.value = route.params.id;
    await loadProduct();
  }
});

const loadProduct = async () => {
  try {
    loading.value = true;

    // Mock product data - replace with real API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Sample product data
    form.value = {
      name: "Arduino Uno R3",
      description:
        "Bo mạch vi điều khiển Arduino Uno R3 chính hãng với chip ATmega328P",
      price: "350000",
      original_price: "400000",
      category: "Arduino & Vi điều khiển",
      brand: "Arduino",
      SKU: "ARD-UNO-R3",
      stock_quantity: "25",
      warranty: "12 tháng",
      main_image: "https://example.com/arduino-uno.jpg",
      additional_images: [
        "https://example.com/arduino-uno-2.jpg",
        "https://example.com/arduino-uno-3.jpg",
      ],
      specifications: {
        "Kích thước": "68.6 x 53.4mm",
        "Trọng lượng": "25g",
        "Bảo hành": "12 tháng",
        "Xuất xứ": "Italy",
      },
      features: [
        "Chip ATmega328P",
        "14 chân digital I/O",
        "6 chân analog input",
        "USB connection",
      ],
    };
  } catch (error) {
    console.error("Error loading product:", error);
    alert("Không thể tải thông tin sản phẩm");
  } finally {
    loading.value = false;
  }
};

const addFeature = () => {
  if (newFeature.value.trim()) {
    form.value.features.push(newFeature.value.trim());
    newFeature.value = "";
  }
};

const removeFeature = (index) => {
  form.value.features.splice(index, 1);
};

const addSpecification = () => {
  if (newSpecKey.value.trim() && newSpecValue.value.trim()) {
    form.value.specifications[newSpecKey.value.trim()] =
      newSpecValue.value.trim();
    newSpecKey.value = "";
    newSpecValue.value = "";
  }
};

const removeSpecification = (key) => {
  delete form.value.specifications[key];
};

const addImage = () => {
  const url = prompt("Nhập URL hình ảnh:");
  if (url) {
    form.value.additional_images.push(url);
  }
};

const removeImage = (index) => {
  form.value.additional_images.splice(index, 1);
};

const validateForm = () => {
  const errors = [];

  if (!form.value.name.trim()) errors.push("Tên sản phẩm không được để trống");
  if (!form.value.description.trim()) errors.push("Mô tả không được để trống");
  if (!form.value.price || parseFloat(form.value.price) <= 0)
    errors.push("Giá phải lớn hơn 0");
  if (!form.value.category) errors.push("Vui lòng chọn danh mục");
  if (!form.value.stock_quantity || parseInt(form.value.stock_quantity) < 0)
    errors.push("Số lượng tồn kho không hợp lệ");

  if (errors.length > 0) {
    alert("Lỗi:\n" + errors.join("\n"));
    return false;
  }

  return true;
};

const submitForm = async () => {
  if (!validateForm()) return;

  try {
    saving.value = true;
    showFormLoading("Đang lưu sản phẩm...");

    // Prepare data
    const productData = {
      ...form.value,
      price: parseFloat(form.value.price),
      original_price: form.value.original_price
        ? parseFloat(form.value.original_price)
        : null,
      stock_quantity: parseInt(form.value.stock_quantity),
    };

    // Mock API call - replace with real implementation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (isEditMode.value) {
      console.log("Updating product:", productId.value, productData);
      alert("Cập nhật sản phẩm thành công!");
    } else {
      console.log("Creating product:", productData);
      alert("Thêm sản phẩm thành công!");
    }

    router.push("/admin/products");
  } catch (error) {
    console.error("Error saving product:", error);
    alert("Có lỗi xảy ra khi lưu sản phẩm");
  } finally {
    saving.value = false;
    hideLoading();
  }
};

const cancelForm = () => {
  if (confirm("Bạn có chắc chắn muốn hủy? Dữ liệu đã nhập sẽ bị mất.")) {
    router.push("/admin/products");
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <router-link
              to="/admin/products"
              class="text-indigo-600 hover:text-indigo-700 mr-4"
            >
              ← Quay lại
            </router-link>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ isEditMode ? "✏️ Sửa sản phẩm" : "➕ Thêm sản phẩm mới" }}
            </h1>
          </div>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"
      ></div>
      <span class="ml-3 text-gray-600">Đang tải...</span>
    </div>

    <!-- Form -->
    <main v-else class="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <form @submit.prevent="submitForm" class="space-y-8">
        <!-- Basic Information -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">
            📝 Thông tin cơ bản
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Product Name -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Tên sản phẩm <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Nhập tên sản phẩm..."
              />
            </div>

            <!-- SKU -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >SKU</label
              >
              <input
                v-model="form.SKU"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Mã sản phẩm..."
              />
            </div>

            <!-- Brand -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Thương hiệu</label
              >
              <input
                v-model="form.brand"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Tên thương hiệu..."
              />
            </div>

            <!-- Category -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Danh mục <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.category"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Chọn danh mục</option>
                <option
                  v-for="category in categories"
                  :key="category"
                  :value="category"
                >
                  {{ category }}
                </option>
              </select>
            </div>

            <!-- Warranty -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Bảo hành</label
              >
              <input
                v-model="form.warranty"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="VD: 12 tháng..."
              />
            </div>

            <!-- Description -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Mô tả sản phẩm <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="form.description"
                required
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Mô tả chi tiết về sản phẩm..."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Pricing & Stock -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">
            💰 Giá và tồn kho
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Price -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Giá bán <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.price"
                type="number"
                required
                min="0"
                step="1000"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0"
              />
            </div>

            <!-- Original Price -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Giá gốc</label
              >
              <input
                v-model="form.original_price"
                type="number"
                min="0"
                step="1000"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0"
              />
            </div>

            <!-- Stock -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Số lượng tồn kho <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.stock_quantity"
                type="number"
                required
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <!-- Images -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">🖼️ Hình ảnh</h2>

          <!-- Main Image -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Hình ảnh chính</label
            >
            <input
              v-model="form.main_image"
              type="url"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="URL hình ảnh chính..."
            />
            <div v-if="form.main_image" class="mt-3">
              <img
                :src="form.main_image"
                alt="Preview"
                class="h-32 w-32 object-cover rounded-lg border"
              />
            </div>
          </div>

          <!-- Additional Images -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <label class="block text-sm font-medium text-gray-700"
                >Hình ảnh phụ</label
              >
              <button
                type="button"
                @click="addImage"
                class="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                + Thêm hình ảnh
              </button>
            </div>

            <div
              v-if="form.additional_images.length > 0"
              class="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <div
                v-for="(image, index) in form.additional_images"
                :key="index"
                class="relative group"
              >
                <img
                  :src="image"
                  alt="Additional"
                  class="h-24 w-24 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  @click="removeImage(index)"
                  class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Features -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">
            ✨ Tính năng nổi bật
          </h2>

          <div class="mb-4">
            <div class="flex gap-2">
              <input
                v-model="newFeature"
                type="text"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Nhập tính năng..."
                @keyup.enter="addFeature"
              />
              <button
                type="button"
                @click="addFeature"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Thêm
              </button>
            </div>
          </div>

          <div v-if="form.features.length > 0" class="space-y-2">
            <div
              v-for="(feature, index) in form.features"
              :key="index"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <span class="text-sm text-gray-700">{{ feature }}</span>
              <button
                type="button"
                @click="removeFeature(index)"
                class="text-red-600 hover:text-red-700 text-sm"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>

        <!-- Specifications -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">
            📋 Thông số kỹ thuật
          </h2>

          <div class="mb-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                v-model="newSpecKey"
                type="text"
                class="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Tên thông số..."
              />
              <input
                v-model="newSpecValue"
                type="text"
                class="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Giá trị..."
                @keyup.enter="addSpecification"
              />
              <button
                type="button"
                @click="addSpecification"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Thêm
              </button>
            </div>
          </div>

          <div
            v-if="Object.keys(form.specifications).length > 0"
            class="space-y-2"
          >
            <div
              v-for="(value, key) in form.specifications"
              :key="key"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <div class="flex-1 grid grid-cols-2 gap-4">
                <span class="text-sm font-medium text-gray-700">{{ key }}</span>
                <span class="text-sm text-gray-600">{{ value }}</span>
              </div>
              <button
                type="button"
                @click="removeSpecification(key)"
                class="text-red-600 hover:text-red-700 text-sm ml-4"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex items-center justify-end space-x-4 py-6">
          <button
            type="button"
            @click="cancelForm"
            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="saving">Đang lưu...</span>
            <span v-else>{{ isEditMode ? "Cập nhật" : "Tạo sản phẩm" }}</span>
          </button>
        </div>
      </form>
    </main>
  </div>
</template>

<style scoped>
/* Custom styling for form elements */
input:focus,
select:focus,
textarea:focus {
  range: 2px;
  outline-color: #6366f1;
  border-color: #6366f1;
}

.required {
  color: #ef4444;
}
</style>
