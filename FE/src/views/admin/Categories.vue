<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header với gradient background -->
      <div
        class="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6"
      >
        <div class="flex items-center justify-between">
          <div class="text-white">
            <div class="flex items-center gap-3 mb-2">
              <div class="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <i class="fas fa-folder-tree text-2xl"></i>
              </div>
              <div>
                <h1 class="text-3xl font-bold">Quản lý danh mục</h1>
                <p class="mt-1 text-purple-100">
                  Tổ chức và quản lý danh mục sản phẩm
                </p>
              </div>
            </div>
          </div>
          <button
            @click="openCreateModal"
            class="bg-white text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-lg flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <i class="fas fa-plus-circle"></i>
            Thêm danh mục mới
          </button>
        </div>
      </div>

      <!-- Filters Card với design mới -->
      <div class="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div class="flex items-center gap-2 mb-4">
          <i class="fas fa-filter text-purple-600"></i>
          <h3 class="font-semibold text-gray-800">Bộ lọc tìm kiếm</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="relative">
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <i class="fas fa-search text-gray-400"></i>
            </div>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Tìm kiếm danh mục..."
              class="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          <div class="relative">
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <i class="fas fa-layer-group text-gray-400"></i>
            </div>
            <select
              v-model="filters.parent_id"
              class="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="">Tất cả danh mục</option>
              <option value="root">Danh mục gốc</option>
              <option
                v-for="category in allCategories"
                :key="category._id"
                :value="category._id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>
          <div class="flex gap-2 md:col-span-2">
            <button
              @click="fetchCategories(filters)"
              class="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-lg flex-1 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg transition-all"
            >
              <i class="fas fa-search"></i>
              Tìm kiếm
            </button>
            <button
              @click="resetFilters"
              class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all"
            >
              <i class="fas fa-redo"></i>
              Đặt lại
            </button>
          </div>
        </div>
      </div>

      <!-- Categories Table với design hiện đại -->
      <div
        class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
      >
        <div v-if="loading" class="p-12 text-center">
          <div class="inline-flex items-center justify-center">
            <div
              class="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"
            ></div>
          </div>
          <p class="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>

        <div v-else-if="error" class="p-12 text-center">
          <div
            class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4"
          >
            <i class="fas fa-exclamation-circle text-3xl text-red-600"></i>
          </div>
          <p class="text-red-600 font-medium">{{ error }}</p>
        </div>

        <div v-else>
          <table class="w-full">
            <thead class="bg-gradient-to-r from-purple-50 to-indigo-50">
              <tr>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase tracking-wider"
                >
                  <i class="fas fa-folder mr-2"></i>Danh mục
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase tracking-wider"
                >
                  <i class="fas fa-link mr-2"></i>Slug
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase tracking-wider"
                >
                  <i class="fas fa-sitemap mr-2"></i>Danh mục cha
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase tracking-wider"
                >
                  <i class="fas fa-box mr-2"></i>Sản phẩm
                </th>

                <th
                  class="px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase tracking-wider"
                >
                  <i class="fas fa-cog mr-2"></i>Thao tác
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr
                v-for="category in categories"
                :key="category._id"
                class="hover:bg-purple-50 transition-colors duration-150"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-12 w-12">
                      <img
                        v-if="category.image"
                        :src="category.image"
                        :alt="category.name"
                        class="h-12 w-12 rounded-lg object-cover shadow-sm"
                      />
                      <div
                        v-else
                        class="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center"
                      >
                        <i class="fas fa-image text-purple-400 text-xl"></i>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-semibold text-gray-900">
                        {{ category.name }}
                      </div>
                      <div
                        class="text-sm text-gray-500 mt-0.5"
                        v-if="category.description"
                      >
                        {{ shortDesc(category.description) }}
                      </div>
                    </div>
                  </div>
                </td>

                <td class="px-6 py-4">
                  <code
                    class="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-mono"
                    >{{ category.slug }}</code
                  >
                </td>

                <td class="px-6 py-4">
                  <span
                    v-if="category.parent_id"
                    class="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-medium"
                  >
                    <i class="fas fa-folder"></i>
                    {{ category.parent_id.name }}
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center gap-1.5 text-gray-400 text-xs font-medium"
                  >
                    <i class="fas fa-home"></i>
                    Danh mục gốc
                  </span>
                </td>

                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm font-semibold"
                  >
                    <i class="fas fa-cube"></i>
                    {{ category.productCount || 0 }}
                  </span>
                </td>

                <td class="px-6 py-4">
                  <div class="flex items-center space-x-2">
                    <button
                      @click="editCategory(category)"
                      class="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                      title="Chỉnh sửa"
                    >
                      <i class="fas fa-pen"></i>
                      Sửa
                    </button>
                    <button
                      @click="confirmDelete(category)"
                      class="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                      title="Xóa"
                    >
                      <i class="fas fa-trash-alt"></i>
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination với design mới -->
          <div
            v-if="pagination && pagination.totalPages > 1"
            class="px-6 py-4 bg-gray-50 border-t border-gray-100"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <i class="fas fa-info-circle text-purple-500"></i>
                <span class="font-medium">
                  Hiển thị {{ (pagination.page - 1) * pagination.limit + 1 }} -
                  {{
                    Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )
                  }}
                </span>
                <span>trên tổng</span>
                <span class="font-semibold text-purple-600">{{
                  pagination.total
                }}</span>
                <span>danh mục</span>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="changePage(pagination.page - 1)"
                  :disabled="!pagination.hasPrev"
                  class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <i class="fas fa-chevron-left"></i>
                  Trước
                </button>
                <div class="flex items-center gap-1">
                  <span
                    class="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md"
                  >
                    {{ pagination.page }}
                  </span>
                  <span class="text-gray-500 mx-1">/</span>
                  <span class="text-gray-700 font-medium">{{
                    pagination.totalPages
                  }}</span>
                </div>
                <button
                  @click="changePage(pagination.page + 1)"
                  :disabled="!pagination.hasNext"
                  class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Sau
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create / Edit Modal với design đẹp hơn -->
    <div
      v-if="showCreateModal || showEditModal"
      class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden"
      >
        <div class="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 text-white">
              <div class="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <i
                  :class="
                    showCreateModal ? 'fas fa-plus-circle' : 'fas fa-edit'
                  "
                  class="text-xl"
                ></i>
              </div>
              <h3 class="text-xl font-bold">
                {{
                  showCreateModal ? "Thêm danh mục mới" : "Chỉnh sửa danh mục"
                }}
              </h3>
            </div>
            <button
              @click="closeModal"
              class="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
            >
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <form @submit.prevent="submitForm" class="p-6">
          <div class="space-y-5">
            <div>
              <label
                class="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"
              >
                <i class="fas fa-tag text-purple-600"></i>
                Tên danh mục <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Nhập tên danh mục"
              />
            </div>

            <div>
              <label
                class="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"
              >
                <i class="fas fa-link text-purple-600"></i>
                Slug <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.slug"
                type="text"
                required
                class="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono text-sm"
                placeholder="slug-tu-dong-tao"
              />
              <p class="mt-1 text-xs text-gray-500 flex items-center gap-1">
                <i class="fas fa-info-circle"></i>
                Slug sẽ được tự động tạo từ tên danh mục
              </p>
            </div>

            <div>
              <label
                class="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"
              >
                <i class="fas fa-align-left text-purple-600"></i>
                Mô tả
              </label>
              <textarea
                v-model="form.description"
                rows="3"
                class="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                placeholder="Mô tả chi tiết về danh mục (tùy chọn)"
              ></textarea>
            </div>

            <div>
              <label
                class="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"
              >
                <i class="fas fa-sitemap text-purple-600"></i>
                Danh mục cha
              </label>
              <select
                v-model="form.parent_id"
                class="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="">
                  <i class="fas fa-home"></i> Danh mục gốc
                </option>
                <option
                  v-for="category in allCategories"
                  :key="category._id"
                  :value="category._id"
                >
                  {{ category.name }}
                </option>
              </select>
            </div>

            <div>
              <label
                class="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"
              >
                <i class="fas fa-image text-purple-600"></i>
                URL hình ảnh
              </label>
              <input
                v-model="form.image"
                type="url"
                class="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div
            class="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200"
          >
            <button
              type="button"
              @click="closeModal"
              class="inline-flex items-center gap-2 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-all"
            >
              <i class="fas fa-times"></i>
              Hủy bỏ
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <i
                :class="
                  submitting
                    ? 'fas fa-spinner fa-spin'
                    : showCreateModal
                    ? 'fas fa-plus-circle'
                    : 'fas fa-save'
                "
              ></i>
              {{
                submitting
                  ? "Đang xử lý..."
                  : showCreateModal
                  ? "Tạo danh mục"
                  : "Cập nhật"
              }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal với animation -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      @click="closeDeleteModal"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all"
        @click.stop
      >
        <div class="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 text-white">
              <div class="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <i class="fas fa-exclamation-triangle text-xl"></i>
              </div>
              <h3 class="text-xl font-bold">Xác nhận xóa</h3>
            </div>
            <button
              @click="closeDeleteModal"
              class="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
            >
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <div class="p-6">
          <div class="mb-6">
            <div class="flex items-start gap-4 mb-4">
              <div
                class="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0"
              >
                <i class="fas fa-trash-alt text-red-600 text-2xl"></i>
              </div>
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900 mb-2">
                  Xóa danh mục vĩnh viễn
                </h4>
                <p class="text-sm text-gray-600">
                  Bạn có chắc chắn muốn xóa danh mục
                  <span class="font-bold text-red-600"
                    >"{{ categoryToDelete?.name }}"</span
                  >?
                </p>
              </div>
            </div>
            <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <div class="flex items-start gap-3">
                <i class="fas fa-exclamation-circle text-red-600 mt-0.5"></i>
                <p class="text-sm text-red-800">
                  <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác.
                  Danh mục sẽ bị xóa vĩnh viễn khỏi hệ thống.
                </p>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <button
              @click="closeDeleteModal"
              class="inline-flex items-center gap-2 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-all"
            >
              <i class="fas fa-times"></i>
              Hủy bỏ
            </button>
            <button
              @click="handleDelete"
              class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <i class="fas fa-trash-alt"></i>
              Xác nhận xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import AdminLayout from "@/layout/AdminLayout.vue";
import { useAdminCategories } from "@/composables/admin/useAdminCategories.js";

const {
  categories,
  allCategories,
  pagination,
  loading,
  error,
  fetchCategories,
  fetchAllCategories,
  createCategory: createCategoryApi,
  updateCategory: updateCategoryApi,
  deleteCategory: deleteCategoryApi,
  formatDate,
} = useAdminCategories();

// UI state
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const submitting = ref(false);
const categoryToDelete = ref(null);

// Filters
const filters = ref({
  search: "",
  parent_id: "",
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  limit: 10,
});

// Form
const form = ref({
  name: "",
  slug: "",
  description: "",
  parent_id: "",
  image: "",
});

const editingCategory = ref(null);

// Helpers
const shortDesc = (desc = "") => {
  if (!desc) return "";
  return desc.length > 50 ? desc.substring(0, 50) + "..." : desc;
};

// Debounced watch for search (manual debounce)
let searchTimeout = null;
watch(
  () => filters.value.search,
  () => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      filters.value.page = 1;
      fetchCategories(filters.value);
    }, 500);
  }
);

// Watchers for other filter changes (immediate)
watch(
  () => filters.value.parent_id,
  () => {
    filters.value.page = 1;
    fetchCategories(filters.value);
  }
);
watch(
  () => filters.value.sortBy,
  () => {
    filters.value.page = 1;
    fetchCategories(filters.value);
  }
);

// Auto-generate slug when creating (not when editing unless slug is empty)
watch(
  () => form.value.name,
  (newName) => {
    if (!newName) return;
    // only auto-generate when creating (or when editing but slug empty)
    if (
      showCreateModal.value ||
      (!showCreateModal.value && showEditModal.value && !form.value.slug)
    ) {
      form.value.slug = newName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // remove special chars
        .replace(/\s+/g, "-") // spaces to hyphens
        .replace(/-+/g, "-") // collapse hyphens
        .replace(/^-+|-+$/g, ""); // trim hyphens
    }
  }
);

// Methods
const resetFilters = () => {
  filters.value = {
    search: "",
    parent_id: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: 10,
  };
  fetchCategories(filters.value);
};

const changePage = (page) => {
  if (!pagination.value || page < 1 || page > pagination.value.totalPages)
    return;
  filters.value.page = page;
  fetchCategories(filters.value);
};

const openCreateModal = () => {
  form.value = {
    name: "",
    slug: "",
    description: "",
    parent_id: "",
    image: "",
  };
  editingCategory.value = null;
  showCreateModal.value = true;
  showEditModal.value = false;
};

const editCategory = (category) => {
  editingCategory.value = category;
  form.value = {
    name: category.name,
    slug: category.slug || "",
    description: category.description || "",
    parent_id: category.parent_id?._id || "",
    image: category.image || "",
  };
  showEditModal.value = true;
  showCreateModal.value = false;
};

const closeModal = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  form.value = {
    name: "",
    slug: "",
    description: "",
    parent_id: "",
    image: "",
  };
  editingCategory.value = null;
};

const submitForm = async () => {
  submitting.value = true;
  try {
    if (showCreateModal.value) {
      await createCategoryApi(form.value);
    } else if (showEditModal.value && editingCategory.value) {
      await updateCategoryApi(editingCategory.value._id, form.value);
    }
    closeModal();
    await fetchCategories(filters.value);
    await fetchAllCategories();
  } catch (err) {
    console.error("Error submitting form:", err);
    // composable assumed to handle user notifications
  } finally {
    submitting.value = false;
  }
};

// Delete flows
const confirmDelete = (category) => {
  categoryToDelete.value = category;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  categoryToDelete.value = null;
};

const handleDelete = async () => {
  if (!categoryToDelete.value) return;
  try {
    await deleteCategoryApi(categoryToDelete.value._id);
    closeDeleteModal();
    await fetchCategories(filters.value);
    await fetchAllCategories();
  } catch (err) {
    console.error("Error deleting category:", err);
  }
};

// Initial load
onMounted(() => {
  fetchCategories(filters.value);
  fetchAllCategories();
});
</script>
