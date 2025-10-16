import axiosInstance from "../utils/axiosConfig";
import { extractResponseData } from "../utils/responseUtils";

// Lấy tất cả sản phẩm với filtering và phân trang
export const getProducts = async (options = {}) => {
  try {
    const params = new URLSearchParams();

    // Pagination
    if (options.page) params.append("page", options.page);
    if (options.limit) params.append("limit", options.limit);

    // Filters
    if (options.categoryId) params.append("categoryId", options.categoryId);
    if (options.minPrice) params.append("minPrice", options.minPrice);
    if (options.maxPrice) params.append("maxPrice", options.maxPrice);
    if (options.inStock) params.append("inStock", "true");
    if (options.onSale) params.append("onSale", "true");
    if (options.search) params.append("search", options.search);

    // Sorting
    if (options.sortBy) params.append("sortBy", options.sortBy);
    if (options.sortOrder) params.append("sortOrder", options.sortOrder);

    const response = await axiosInstance.get(`/products/discovery/all?${params}`);

    // Extract data using utility function
    const responseData = extractResponseData(response);

    return {
      data: responseData.products || responseData,
      total: responseData.total,
      page: responseData.page || responseData.pagination?.currentPage,
      totalPages:
        responseData.totalPages || responseData.pagination?.totalPages,
      pagination: responseData.pagination,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// Lấy sản phẩm theo ID
export const getProductById = async (id) => {
  try {
    const response = await axiosInstance.get(`/products/${id}/details`);
    console.log("Product by ID response:", response.data);

    // Extract data using utility function
    return { data: extractResponseData(response) };
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw error;
  }
};

// Lấy sản phẩm liên quan
export const getRelatedProducts = async (productId, limit = 4) => {
  try {
    const response = await axiosInstance.get(
      `/products/analytics/related/${productId}`,
      {
        params: { limit },
      }
    );

    return {
      data: response.data.products || response.data.data || response.data,
    };
  } catch (error) {
    console.error(
      `Error fetching related products for product ${productId}:`,
      error
    );
    return { data: [] };
  }
};

// Lấy sản phẩm nổi bật
export const getFeaturedProducts = async (limit = 8) => {
  try {
    const response = await axiosInstance.get("/products/discovery/featured", {
      params: { limit },
    });

    return {
      data: response.data.products,
    };
  } catch (error) {
    console.error("Error fetching featured products:", error);
    throw error;
  }
};

// Lấy sản phẩm mới nhất
export const getNewestProducts = async (limit = 8) => {
  try {
    const response = await axiosInstance.get(
      "/products/collections/new-arrivals",
      {
        params: { limit },
      }
    );

    return {
      data: response.data.products,
    };
  } catch (error) {
    console.error("Error fetching newest products:", error);
    throw error;
  }
};

// Lấy sản phẩm bán chạy nhất
export const getBestSellingProducts = async (limit = 8) => {
  try {
    const response = await axiosInstance.get(
      "/products/collections/best-sellers",
      {
        params: { limit },
      }
    );

    return {
      data: response.data.products,
    };
  } catch (error) {
    console.error("Error fetching best selling products:", error);
    throw error;
  }
};

// Lấy sản phẩm có khuyến mãi (có thể điều chỉnh minDiscount)
export const getDiscountedProducts = async (
  page = 1,
  limit = 10,
  minDiscount = 0
) => {
  try {
    const response = await axiosInstance.get("/products/collections/on-sale", {
      params: { page, limit, minDiscount },
    });
    console.log("Discounted products response:", response.data);

    // Backend trả về { success, data, message } - data chứa { products, total, page, totalPages }
    const result = response.data;
    const actualData = result.data || result; // data có thể nằm trong result.data

    return {
      data: actualData.products || [], // products là array chứa sản phẩm
      products: actualData.products || [],
      total: actualData.total || 0,
      page: actualData.page || 1,
      totalPages: actualData.totalPages || 1,
    };
  } catch (error) {
    console.error("Error fetching discounted products:", error);
    throw error;
  }
};

// Lấy sản phẩm theo Category (có phân trang)
export const getProductsByCategory = async (
  categoryId,
  page = 1,
  limit = 12
) => {
  try {
    const response = await axiosInstance.get(
      `/products/collections/categories/${categoryId}`,
      {
        params: { page, limit },
      }
    );

    // Extract data using utility function
    const responseData = extractResponseData(response);
    console.log("Products by category responseData:", responseData);

    return {
      data: responseData.products || responseData,
      total: responseData.total,
      page: responseData.page,
      totalPages: responseData.totalPages,
    };
  } catch (error) {
    console.error(`Error fetching products for category ${categoryId}:`, error);
    throw error;
  }
};

// Tìm kiếm sản phẩm nâng cao
export const searchProducts = async (query, options = {}) => {
  try {
    const params = new URLSearchParams();
    params.append("q", query);

    if (options.page) params.append("page", options.page);
    if (options.limit) params.append("limit", options.limit);
    if (options.categoryId) params.append("categoryId", options.categoryId);
    if (options.sortBy) params.append("sortBy", options.sortBy);
    if (options.sortOrder) params.append("sortOrder", options.sortOrder);

    const response = await axiosInstance.get(
      `/products/discovery/search?${params}`
    );

    return {
      data: response.data.products,
      total: response.data.total,
      page: response.data.page,
      totalPages: response.data.totalPages,
      query: response.data.query,
      categoryId: response.data.categoryId,
      sortBy: response.data.sortBy,
      sortOrder: response.data.sortOrder,
    };
  } catch (error) {
    console.error(`Error searching products with query "${query}":`, error);
    throw error;
  }
};

// Lấy thống kê sản phẩm theo category
export const getProductStats = async () => {
  try {
    const response = await axiosInstance.get("/products/analytics/stats");
    return {
      data: response.data.stats,
    };
  } catch (error) {
    console.error("Error fetching product stats:", error);
    throw error;
  }
};

// Tạo sản phẩm mới (Admin)
export const createProduct = async (productData) => {
  try {
    const response = await axiosInstance.post("/products", productData);
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

// Cập nhật sản phẩm (Admin)
export const updateProduct = async (id, productData) => {
  try {
    const response = await axiosInstance.put(`/products/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// Xóa sản phẩm (Admin)
export const deleteProduct = async (id) => {
  try {
    const response = await axiosInstance.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};
