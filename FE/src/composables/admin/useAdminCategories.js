import { ref, computed } from 'vue';
import { 
  getCategoriesAdmin,
  createCategory as createCategoryApi,
  updateCategory as updateCategoryApi,
  deleteCategory as deleteCategoryApi,
  getParentCategories
} from '@/api/admin/categoryService.js';
import { useNotification } from '@/composables/admin/useNotification';

export function useAdminCategories() {
  const categories = ref([]);
  const allCategories = ref([]);
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  
  const loading = ref(false);
  const error = ref(null);

  // Notification
  const { 
    notifyCategoryCreated,
    notifyCategoryUpdated,
    notifyCategoryDeleted,
    notifyOperationFailed,
    showError
  } = useNotification();

  // Lấy danh sách categories với phân trang
  const fetchCategories = async (filters = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await getCategoriesAdmin(filters);
      console.log('Categories response in composable:', response);
      
      // Handle the response structure correctly
      categories.value = response.data || [];
      pagination.value = {
        ...pagination.value,
        ...response.pagination,
        totalPages: response.pagination?.totalPages || Math.ceil((response.pagination?.total || 0) / (response.pagination?.limit || 10))
      };
    } catch (err) {
      error.value = err.response?.data?.message || 'Có lỗi xảy ra khi tải danh mục';
      console.error('Error fetching categories:', err);
    } finally {
      loading.value = false;
    }
  };

  // Lấy tất cả categories cho dropdown
  const fetchAllCategories = async () => {
    try {
      const response = await getCategoriesAdmin({ limit: 1000 });
      allCategories.value = response.data || [];
    } catch (err) {
      console.error('Error fetching all categories:', err);
    }
  };

  // Tạo category mới
  const createCategory = async (categoryData) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await createCategoryApi(categoryData);
      
      // Thêm vào danh sách
      categories.value.unshift(response.data);

      // Thông báo thành công
      notifyCategoryCreated(categoryData.name || 'Danh mục mới');
      
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Có lỗi xảy ra khi tạo danh mục';
      error.value = message;
      
      // Thông báo lỗi
      notifyOperationFailed('tạo danh mục');
      
      throw new Error(message);
    } finally {
      loading.value = false;
    }
  };

  // Cập nhật category
  const updateCategory = async (categoryId, updateData) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await updateCategoryApi(categoryId, updateData);
      
      // Cập nhật trong danh sách
      const index = categories.value.findIndex(c => c._id === categoryId);
      if (index !== -1) {
        categories.value[index] = response.data;
      }

      // Thông báo thành công
      notifyCategoryUpdated(updateData.name || 'Danh mục');
      
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật danh mục';
      error.value = message;
      
      // Thông báo lỗi
      notifyOperationFailed('cập nhật danh mục');
      
      throw new Error(message);
    } finally {
      loading.value = false;
    }
  };

  // Xóa category
  const deleteCategory = async (categoryId) => {
    try {
      loading.value = true;
      error.value = null;

      // Lấy thông tin danh mục trước khi xóa
      const categoryToDelete = categories.value.find(c => c._id === categoryId);
      const categoryName = categoryToDelete?.name || 'Danh mục';

      await deleteCategoryApi(categoryId);
      
      // Xóa khỏi danh sách
      const index = categories.value.findIndex(c => c._id === categoryId);
      if (index !== -1) {
        categories.value.splice(index, 1);
      }

      // Thông báo thành công
      notifyCategoryDeleted(categoryName);

    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi xóa danh mục';
      error.value = message;
      
      // Thông báo lỗi cụ thể
      if (message.includes('có sản phẩm')) {
        showError('Không thể xóa danh mục đang chứa sản phẩm!');
      } else if (message.includes('danh mục con')) {
        showError('Không thể xóa danh mục cha đang có danh mục con!');
      } else {
        notifyOperationFailed('xóa danh mục');
      }
      
      throw new Error(message);
    } finally {
      loading.value = false;
    }
  };

  // Lấy category theo ID
  const getCategoryById = async (categoryId) => {
    try {
      // Tạm thời comment vì chưa có function này
      // const response = await getCategoryById(categoryId);
      const response = { data: null };
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin danh mục';
      throw new Error(message);
    }
  };

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Computed
  const totalCategories = computed(() => pagination.value.total);
  const hasCategories = computed(() => categories.value.length > 0);
  const isEmpty = computed(() => !loading.value && categories.value.length === 0);

  return {
    // State
    categories,
    allCategories,
    pagination,
    loading,
    error,
    
    // Actions
    fetchCategories,
    fetchAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    
    // Computed
    totalCategories,
    hasCategories,
    isEmpty,
    
    // Utils
    formatDate
  };
}