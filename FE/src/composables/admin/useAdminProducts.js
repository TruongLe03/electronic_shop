import { ref, reactive, computed } from "vue";
import { 
  getAllProductsAdmin,
  getProductById,
  createProduct as createProductAPI,
  updateProduct as updateProductAPI,
  deleteProduct as deleteProductAPI,
  toggleProductStatus as toggleProductStatusAPI
} from "@/api/admin/productService";
import { getCategoriesAdmin } from "@/api/admin/categoryService";
import { useNotification } from "@/composables/admin/useNotification";

export function useAdminProducts() {
  const products = ref([]);
  const categories = ref([]);
  const totalProducts = ref(0);
  const loading = ref(false);
  const error = ref(null);

  // Notification
  const { 
    notifyProductCreated,
    notifyProductUpdated,
    notifyProductDeleted,
    notifyOperationFailed,
    showSuccess,
    showError
  } = useNotification();

  // Pagination
  const pagination = reactive({
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Filters
  const filters = reactive({
    search: "",
    category: "",
    status: "",
    priceRange: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Computed
  const hasFilters = computed(() => {
    return (
      filters.search || filters.category || filters.status || filters.priceRange
    );
  });

  // Lấy danh sách sản phẩm
  const fetchProducts = async (params = {}) => {
    try {
      loading.value = true;
      error.value = null;

      const queryParams = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        ...params,
      };

      console.log('fetchProducts - queryParams:', queryParams);
      const response = await getAllProductsAdmin(queryParams);
      console.log('fetchProducts - response:', response);
      products.value = response.data.products;
      totalProducts.value = response.data.total;
      pagination.totalPages = Math.ceil(response.data.total / pagination.limit);
    } catch (err) {
      error.value = err.message || "Lỗi khi lấy danh sách sản phẩm";
      console.error("Fetch products error:", err);
    } finally {
      loading.value = false;
    }
  };

  // Lấy chi tiết sản phẩm
  const fetchProduct = async (productId) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await getProductById(productId);
      return response.data;
    } catch (err) {
      error.value = err.message || "Lỗi khi lấy chi tiết sản phẩm";
      console.error("Fetch product error:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Tạo sản phẩm mới
  const createProduct = async (productData) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await createProductAPI(productData);

      // Thêm sản phẩm mới vào đầu danh sách
      products.value.unshift(response.data);
      totalProducts.value++;

      // Thông báo thành công
      notifyProductCreated(productData.name || 'Sản phẩm mới');

      return response.data;
    } catch (err) {
      error.value = err.message || "Lỗi khi tạo sản phẩm";
      console.error("Create product error:", err);
      
      // Thông báo lỗi
      notifyOperationFailed('tạo sản phẩm');
      
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Cập nhật sản phẩm
  const updateProduct = async (productId, productData) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await updateProductAPI(productId, productData);

      // Cập nhật sản phẩm trong danh sách
      const index = products.value.findIndex((p) => p._id === productId);
      if (index !== -1) {
        products.value[index] = response.data;
      }

      // Thông báo thành công
      notifyProductUpdated(productData.name || 'Sản phẩm');

      return response.data;
    } catch (err) {
      error.value = err.message || "Lỗi khi cập nhật sản phẩm";
      console.error("Update product error:", err);
      
      // Thông báo lỗi
      notifyOperationFailed('cập nhật sản phẩm');
      
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Xóa sản phẩm
  const deleteProduct = async (productId) => {
    try {
      loading.value = true;
      error.value = null;

      // Lấy thông tin sản phẩm trước khi xóa để hiển thị tên trong thông báo
      const productToDelete = products.value.find(p => p._id === productId);
      const productName = productToDelete?.name || 'Sản phẩm';

      await deleteProductAPI(productId);

      // Xóa sản phẩm khỏi danh sách
      const index = products.value.findIndex((p) => p._id === productId);
      if (index !== -1) {
        products.value.splice(index, 1);
        totalProducts.value--;
      }

      // Thông báo thành công
      notifyProductDeleted(productName);

      return true;
    } catch (err) {
      error.value = err.message || "Lỗi khi xóa sản phẩm";
      console.error("Delete product error:", err);
      
      // Thông báo lỗi
      notifyOperationFailed('xóa sản phẩm');
      
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Toggle trạng thái sản phẩm
  const toggleProductStatus = async (productId) => {
    try {
      loading.value = true;
      error.value = null;

      const product = products.value.find(p => p._id === productId);
      const productName = product?.name || 'Sản phẩm';

      const response = await toggleProductStatusAPI(productId);

      // Cập nhật trạng thái trong danh sách
      const index = products.value.findIndex((p) => p._id === productId);
      if (index !== -1) {
        products.value[index].status = response.data.status;
      }

      // Thông báo thành công
      const statusText = response.data.status === 'active' ? 'kích hoạt' : 'vô hiệu hóa';
      showSuccess(`Đã ${statusText} sản phẩm "${productName}" thành công!`);

      return response.data;
    } catch (err) {
      error.value = err.message || "Lỗi khi thay đổi trạng thái sản phẩm";
      console.error("Toggle product status error:", err);
      
      // Thông báo lỗi
      notifyOperationFailed('thay đổi trạng thái sản phẩm');
      
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Lấy danh sách danh mục
  const fetchCategories = async () => {
    try {
      console.log("🔍 Fetching categories...");
      const response = await getCategoriesAdmin();
      console.log("📦 Categories response:", response);
      
      // Xử lý nhiều format response khác nhau
      let categoriesData = [];
      if (response?.data?.categories) {
        categoriesData = response.data.categories;
      } else if (response?.categories) {
        categoriesData = response.categories;
      } else if (response?.data) {
        categoriesData = response.data;
      } else if (Array.isArray(response)) {
        categoriesData = response;
      }
      
      categories.value = categoriesData;
      console.log("✅ Categories loaded:", categories.value.length, "items");
      console.log("Categories data:", categories.value);
    } catch (err) {
      console.error("❌ Fetch categories error:", err);
      categories.value = [];
      
      // Tạo mock data tạm thời để test UI
      categories.value = [
        { _id: '1', name: 'Điện tử', slug: 'dien-tu' },
        { _id: '2', name: 'Máy tính', slug: 'may-tinh' },
        { _id: '3', name: 'Điện thoại', slug: 'dien-thoai' }
      ];
      console.log("🔧 Using mock categories for testing");
    }
  };

  // Pagination methods
  const goToPage = (page) => {
    pagination.page = page;
    fetchProducts();
  };

  const nextPage = () => {
    if (pagination.page < pagination.totalPages) {
      pagination.page++;
      fetchProducts();
    }
  };

  const prevPage = () => {
    if (pagination.page > 1) {
      pagination.page--;
      fetchProducts();
    }
  };

  // Filter methods
  const applyFilters = () => {
    pagination.page = 1;
    fetchProducts();
  };

  const clearFilters = () => {
    Object.keys(filters).forEach((key) => {
      if (key === "sortBy") {
        filters[key] = "createdAt";
      } else if (key === "sortOrder") {
        filters[key] = "desc";
      } else {
        filters[key] = "";
      }
    });
    pagination.page = 1;
    fetchProducts();
  };

  // Search
  const search = (searchTerm) => {
    filters.search = searchTerm;
    pagination.page = 1;
    fetchProducts();
  };

  // Sort
  const sortBy = (field) => {
    if (filters.sortBy === field) {
      filters.sortOrder = filters.sortOrder === "desc" ? "asc" : "desc";
    } else {
      filters.sortBy = field;
      filters.sortOrder = "desc";
    }
    pagination.page = 1;
    fetchProducts();
  };

  // Utility functions
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-50";
      case "inactive":
        return "text-red-600 bg-red-50";
      case "draft":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Hoạt động";
      case "inactive":
        return "Không hoạt động";
      case "draft":
        return "Bản nháp";
      default:
        return "Không xác định";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateText = (text, length = 100) => {
    if (!text) return "";
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  return {
    // State
    products,
    categories,
    totalProducts,
    loading,
    error,
    pagination,
    filters,

    // Computed
    hasFilters,

    // Methods
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    fetchCategories,

    // Pagination
    goToPage,
    nextPage,
    prevPage,

    // Filters & Search
    applyFilters,
    clearFilters,
    search,
    sortBy,

    // Utilities
    getStatusColor,
    getStatusText,
    formatCurrency,
    formatNumber,
    formatDate,
    truncateText,
  };
}
