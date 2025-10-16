import axiosInstance from "../utils/axiosConfig";
import { extractResponseData } from "../utils/responseUtils";

// Lấy tất cả categories với options
export const getCategories = async (options = {}) => {
  try {
    const params = new URLSearchParams();

    if (options.page) params.append("page", options.page);
    if (options.limit) params.append("limit", options.limit);
    if (options.includeProductCount)
      params.append("includeProductCount", "true");
    if (options.parentOnly) params.append("parentOnly", "true");

    const response = await axiosInstance.get(`/categories/all?${params}`);

    // Extract data using responseUtils
    const responseData = extractResponseData(response);
    console.log("Categories API responseData:", responseData);

    // Backend trả về trực tiếp mảng categories
    if (Array.isArray(responseData)) {
      return {
        categories: responseData.map(transformCategory),
        pagination: null,
      };
    } else if (responseData.categories) {
      // Nếu có structure với categories property
      return {
        categories: responseData.categories.map(transformCategory),
        pagination: responseData.pagination || {
          total: responseData.total,
          page: responseData.page,
          totalPages: responseData.totalPages,
        },
      };
    } else {
      // Fallback - trả về empty array
      return {
        categories: [],
        pagination: null,
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
    const response = await axiosInstance.get(`/categories/${id}/details`);
    const category = extractResponseData(response);

    return {
      category: transformCategory(category),
      subcategories: category.subcategories?.map(transformCategory) || [],
      productCount: category.productCount || 0,
    };
  } catch (error) {
    console.error("Error fetching category:", error);
    throw error;
  }
};

// Lấy subcategories của một category
export const getSubcategories = async (parentId) => {
  try {
    const response = await axiosInstance.get(
      `/categories/${parentId}/subcategories`
    );
    const subcategories = extractResponseData(response);
    return subcategories.map(transformCategory);
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    throw error;
  }
};

// Tạo category mới
export const createCategory = async (categoryData) => {
  try {
    const response = await axiosInstance.post(
      "/categories/create",
      categoryData
    );
    const category = extractResponseData(response);
    return transformCategory(category);
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

// Cập nhật category
export const updateCategory = async (id, categoryData) => {
  try {
    const response = await axiosInstance.put(`/categories/${id}`, categoryData);
    const category = extractResponseData(response);
    return transformCategory(category);
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

// Xóa category
export const deleteCategory = async (id) => {
  try {
    const response = await axiosInstance.delete(`/categories/${id}`);
    return extractResponseData(response);
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
    updatedAt: category.updatedAt,
  };
};
