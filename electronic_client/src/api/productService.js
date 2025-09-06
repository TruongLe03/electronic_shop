import axiosInstance from "../utils/axiosConfig";

// Lấy tất cả sản phẩm có phân trang
export const getProducts = async (page = 1, limit = 20) => {
  try {
    const params = { page, limit };
    const response = await axiosInstance.get("/products", { params });

    return {
      data: response.data.products,
      total: response.data.total,
      page: response.data.page,
      totalPages: response.data.totalPages,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// Lấy sản phẩm theo ID
export const getProductById = async (id) => {
  try {
    const response = await axiosInstance.get(`/products/${id}`);
    console.log("Product by ID response:", response.data);

    // Handle different response structures for single product
    if (response.data.product) {
      console.log("Product data:", response.data.product);
      console.log("Main image:", response.data.product.main_image);
      return { data: response.data.product };
    } else if (response.data.data) {
      console.log("Product data:", response.data.data);
      console.log("Main image:", response.data.data.main_image);
      return { data: response.data.data };
    } else {
      console.log("Product data:", response.data);
      console.log("Main image:", response.data.main_image);
      return { data: response.data };
    }
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw error;
  }
};

// Lấy sản phẩm liên quan
export const getRelatedProducts = async (categoryId, excludeProductId, limit = 4) => {
  try {
    const response = await axiosInstance.get(`/products/category/${categoryId}`, {
      params: { 
        limit,
        exclude: excludeProductId 
      }
    });

    return {
      data: response.data.products || response.data.data || response.data,
    };
  } catch (error) {
    console.error(`Error fetching related products for category ${categoryId}:`, error);
    // Return empty array if error
    return { data: [] };
  }
};

// Lấy sp có khuyến mãi > 40%
export const getDiscountedProducts = async (limit = 10) => {
  try {
    const params = { limit };
    const response = await axiosInstance.get("/products/discounted", {
      params,
    });

    return {
      data: response.data.products,
      total: response.data.total,
      page: response.data.page,
      totalPages: response.data.totalPages,
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
      `/products/category/${categoryId}`,
      {
        params: { page, limit },
      }
    );

    return {
      data: response.data.products,
      total: response.data.total,
      page: response.data.page,
      totalPages: response.data.totalPages,
    };
  } catch (error) {
    console.error(`Error fetching products for category ${categoryId}:`, error);
    throw error;
  }
};

// Search products by name/title
export const searchProducts = async (query, page = 1, limit = 20) => {
  try {
    const response = await axiosInstance.get("/products/search", {
      params: { q: query, page, limit },
    });

    console.log("Search products response:", response.data);

    // Handle response structure similar to getProducts
    let products = [];
    let total = 0;

    if (Array.isArray(response.data)) {
      products = response.data;
      total = response.data.length;
    } else if (
      response.data.products &&
      Array.isArray(response.data.products)
    ) {
      products = response.data.products;
      total = response.data.total || response.data.count || products.length;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      products = response.data.data;
      total = response.data.total || response.data.count || products.length;
    } else {
      products = [];
      total = 0;
    }

    return {
      data: products,
      total: total,
      page: page,
      limit: limit,
      query: query,
    };
  } catch (error) {
    console.error(`Error searching products with query "${query}":`, error);
    throw error;
  }
};
