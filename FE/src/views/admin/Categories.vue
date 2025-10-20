<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Quản lý danh mục</h1>
          <p class="mt-1 text-sm text-gray-500">
            Quản lý danh mục sản phẩm của cửa hàng
          </p>
        </div>
        <button
          @click="openCreateModal"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <i class="fas fa-plus"></i>
          Thêm danh mục
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white p-4 rounded-lg shadow-sm border">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Tìm kiếm danh mục..."
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              v-model="filters.parent_id"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          <div>
            <select
              v-model="filters.sortBy"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">Ngày tạo</option>
              <option value="name">Tên</option>
              <option value="updatedAt">Cập nhật</option>
            </select>
          </div>

          <div class="flex gap-2">
            <button
              @click="fetchCategories(filters)"
              class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex-1"
            >
              Lọc
            </button>
            <button
              @click="resetFilters"
              class="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <!-- Categories Table -->
      <div class="bg-white rounded-lg shadow-sm border">
        <div v-if="loading" class="p-8 text-center">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"
          ></div>
          <p class="mt-2 text-gray-500">Đang tải...</p>
        </div>

        <div v-else-if="error" class="p-8 text-center text-red-600">
          {{ error }}
        </div>

        <div v-else>
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Danh mục
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Slug
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Danh mục cha
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Số sản phẩm
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Ngày tạo
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="category in categories"
                :key="category._id"
                class="hover:bg-gray-50"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <img
                        v-if="category.image"
                        :src="category.image"
                        :alt="category.name"
                        class="h-10 w-10 rounded object-cover"
                      />
                      <div
                        v-else
                        class="h-10 w-10 rounded bg-gray-200 flex items-center justify-center"
                      >
                        <svg
                          class="w-6 h-6 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ category.name }}
                      </div>
                      <div
                        class="text-sm text-gray-500"
                        v-if="category.description"
                      >
                        {{ shortDesc(category.description) }}
                      </div>
                    </div>
                  </div>
                </td>

                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <code class="bg-gray-100 px-2 py-1 rounded text-xs">{{
                    category.slug
                  }}</code>
                </td>

                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span
                    v-if="category.parent_id"
                    class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                  >
                    {{ category.parent_id.name }}
                  </span>
                  <span v-else class="text-gray-400">Danh mục gốc</span>
                </td>

                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ category.productCount || 0 }}
                </td>

                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(category.createdAt) }}
                </td>

                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center space-x-3">
                    <button
                      @click="editCategory(category)"
                      class="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      title="Chỉnh sửa"
                    >
                      <i class="fas fa-edit"></i>
                      Sửa
                    </button>
                    <button
                      @click="confirmDelete(category)"
                      class="text-red-600 hover:text-red-900 flex items-center gap-1"
                      title="Xóa"
                    >
                      <i class="fas fa-trash"></i>
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div
            v-if="pagination && pagination.totalPages > 1"
            class="px-6 py-4 border-t border-gray-200"
          >
            <div class="flex items-center justify-between">
              <div class="text-sm text-gray-500">
                Hiển thị {{ (pagination.page - 1) * pagination.limit + 1 }} đến
                {{
                  Math.min(pagination.page * pagination.limit, pagination.total)
                }}
                trong tổng số {{ pagination.total }} danh mục
              </div>
              <div class="flex items-center space-x-2">
                <button
                  @click="changePage(pagination.page - 1)"
                  :disabled="!pagination.hasPrev"
                  class="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <span class="px-3 py-1 bg-blue-600 text-white rounded">{{
                  pagination.page
                }}</span>
                <button
                  @click="changePage(pagination.page + 1)"
                  :disabled="!pagination.hasNext"
                  class="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <div
      v-if="showCreateModal || showEditModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-[9999]"
    >
      <div
        class="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ showCreateModal ? "Thêm danh mục mới" : "Chỉnh sửa danh mục" }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="submitForm">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Tên danh mục *</label
              >
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tên danh mục"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Slug *</label
              >
              <input
                v-model="form.slug"
                type="text"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Slug sẽ được tự động tạo"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Mô tả</label
              >
              <textarea
                v-model="form.description"
                rows="3"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mô tả danh mục (tùy chọn)"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Danh mục cha</label
              >
              <select
                v-model="form.parent_id"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Danh mục gốc</option>
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
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Hình ảnh URL</label
              >
              <input
                v-model="form.image"
                type="url"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {{
                submitting
                  ? "Đang xử lý..."
                  : showCreateModal
                  ? "Tạo"
                  : "Cập nhật"
              }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-white bg-opacity-5 flex items-center justify-center z-[9999]"
      @click="closeDeleteModal"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4" @click.stop>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Xác nhận xóa</h3>
          <button
            @click="closeDeleteModal"
            class="text-gray-400 hover:text-gray-600"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="mb-6">
          <div class="flex items-center mb-3">
            <div
              class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4"
            >
              <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
            </div>
            <div>
              <h4 class="font-medium text-gray-900">Xóa danh mục</h4>
              <p class="text-sm text-gray-600">
                Bạn có chắc chắn muốn xóa danh mục
                <span class="font-semibold">"{{ categoryToDelete?.name }}"</span
                >?
              </p>
            </div>
          </div>
          <p class="text-sm text-gray-500 bg-w">
            Hành động này không thể hoàn tác. Danh mục sẽ bị xóa vĩnh viễn.
          </p>
        </div>

        <div class="flex justify-end gap-3">
          <button
            @click="closeDeleteModal"
            class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            @click="handleDelete"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Xóa
          </button>
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
  if (!pagination.value || page < 1 || page > pagination.value.totalPages) return;
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
