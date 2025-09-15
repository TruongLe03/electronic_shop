import axiosInstance from "../utils/axiosConfig";

// Lấy tất cả categories với options
export const getCategories = async (options = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (options.page) params.append('page', options.page);
    if (options.limit) params.append('limit', options.limit);
    if (options.includeProductCount) params.append('includeProductCount', 'true');
    if (options.parentOnly) params.append('parentOnly', 'true');

    const response = await axiosInstance.get(`/categories?${params}`);
    
    // Handle both paginated and non-paginated responses
    if (response.data.categories) {
      return {
        categories: response.data.categories.map(transformCategory),
        pagination: {
          total: response.data.total,
          page: response.data.page,
          totalPages: response.data.totalPages
        }
      };
    } else {
      // Legacy format
      return {
        categories: response.data.map(transformCategory),
        pagination: null
      };
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

// Lấy category theo ID
export const getCategoryById = async (id) => {
  try {
    const response = await axiosInstance.get(`/categories/${id}`);
    return {
      category: transformCategory(response.data.category),
      subcategories: response.data.category.subcategories?.map(transformCategory) || [],
      productCount: response.data.category.productCount || 0
    };
  } catch (error) {
    console.error("Error fetching category:", error);
    throw error;
  }
};

// Lấy subcategories của một category
export const getSubcategories = async (parentId) => {
  try {
    const response = await axiosInstance.get(`/categories/${parentId}/subcategories`);
    return response.data.subcategories.map(transformCategory);
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    throw error;
  }
};

// Tạo category mới
export const createCategory = async (categoryData) => {
  try {
    const response = await axiosInstance.post("/categories", categoryData);
    return transformCategory(response.data);
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

// Cập nhật category
export const updateCategory = async (id, categoryData) => {
  try {
    const response = await axiosInstance.put(`/categories/${id}`, categoryData);
    return transformCategory(response.data);
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

// Xóa category
export const deleteCategory = async (id) => {
  try {
    const response = await axiosInstance.delete(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};

// Transform function để chuẩn hóa dữ liệu category
const transformCategory = (category) => {
  if (!category) return null;
  
  return {
    id: category._id || category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
    parent_id: category.parent_id?._id || category.parent_id,
    parentName: category.parent_id?.name || null,
    productCount: category.productCount || 0,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt
  };
};
