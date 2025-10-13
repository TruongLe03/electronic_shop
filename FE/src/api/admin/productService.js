import axiosInstance from "../../utils/axiosConfig";

// ============= PRODUCT MANAGEMENT =============

// Lấy danh sách sản phẩm cho admin
export const getAllProductsAdmin = async (params = {}) => {
  try {
    console.log("getAllProductsAdmin - params:", params);
    const {
      page = 1,
      limit = 10,
      search = "",
      category = "",
      status = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    console.log("getAllProductsAdmin - making request to /admin/products");
    const response = await axiosInstance.get("/admin/products", {
      params: {
        page,
        limit,
        search,
        category,
        status,
        sortBy,
        sortOrder,
      },
    });
    console.log("getAllProductsAdmin - response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Get all products admin error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Lấy thống kê sản phẩm theo danh mục
export const getProductCategoryStats = async () => {
  try {
    const response = await axiosInstance.get("/admin/products/category-stats");
    return response.data;
  } catch (error) {
    console.error("Get product category stats error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Lấy danh sách sản phẩm (alias cho getAllProductsAdmin)
export const getProducts = async (params = {}) => {
  return getAllProductsAdmin(params);
};

// Lấy chi tiết sản phẩm
export const getProductById = async (productId) => {
  try {
    const response = await axiosInstance.get(`/admin/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Get product error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Tạo sản phẩm mới
export const createProduct = async (productData) => {
  try {
    const response = await axiosInstance.post("/admin/products", productData);
    return response.data;
  } catch (error) {
    console.error("Create product error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Cập nhật sản phẩm
export const updateProduct = async (productId, productData) => {
  try {
    const response = await axiosInstance.put(
      `/admin/products/${productId}`,
      productData
    );
    return response.data;
  } catch (error) {
    console.error("Update product error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Xóa sản phẩm
export const deleteProduct = async (productId) => {
  try {
    const response = await axiosInstance.delete(`/admin/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Delete product error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Thay đổi trạng thái sản phẩm
export const toggleProductStatus = async (productId) => {
  try {
    const response = await axiosInstance.patch(
      `/admin/products/${productId}/toggle-status`
    );
    return response.data;
  } catch (error) {
    console.error("Toggle product status error:", error);
    throw error.response ? error.response.data : error;
  }
};
