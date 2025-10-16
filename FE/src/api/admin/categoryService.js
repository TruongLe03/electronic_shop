import axiosInstance from "../../utils/axiosConfig";

// ============= CATEGORY MANAGEMENT =============

// Lấy danh sách danh mục cho admin
export const getCategoriesAdmin = async (params = {}) => {
  try {
    console.log("Calling /admin/categories with params:", params);
    const response = await axiosInstance.get("/categories/all", { params });
    console.log("Categories API response:", response);
    return response.data;
  } catch (error) {
    console.error("Get categories admin error:", error);
    console.error("Error details:", error.response);

    // Fallback: Try public categories API if admin endpoint doesn't exist
    if (error.response?.status === 404) {
      try {
        console.log("Trying fallback /categories API...");
        const fallbackResponse = await axiosInstance.get("/categories", {
          params,
        });
        console.log("Fallback categories API response:", fallbackResponse);
        return fallbackResponse.data;
      } catch (fallbackError) {
        console.error("Fallback categories error:", fallbackError);
        throw fallbackError.response
          ? fallbackError.response.data
          : fallbackError;
      }
    }

    throw error.response ? error.response.data : error;
  }
};

// Tạo danh mục mới
export const createCategory = async (categoryData) => {
  try {
    const response = await axiosInstance.post(
      "/admin/categories",
      categoryData
    );
    return response.data;
  } catch (error) {
    console.error("Create category error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Cập nhật danh mục
export const updateCategory = async (categoryId, categoryData) => {
  try {
    console.log("🔄 Updating category API call:", categoryId, categoryData);
    const response = await axiosInstance.put(
      `/admin/categories/${categoryId}`,
      categoryData
    );
    console.log("✅ Update category response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Update category error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Xóa danh mục
export const deleteCategory = async (categoryId) => {
  try {
    const response = await axiosInstance.delete(
      `/admin/categories/${categoryId}`
    );
    return response.data;
  } catch (error) {
    console.error("Delete category error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Lấy danh mục cha (không có parentId)
export const getParentCategories = async () => {
  try {
    const response = await axiosInstance.get("/admin/categories/parent");
    return response.data;
  } catch (error) {
    console.error("Get parent categories error:", error);
    throw error.response ? error.response.data : error;
  }
};
