import api from "../utils/axiosConfig.js";
// Create inventory import (stock-in)
export const createInventoryImport = async (data) => {
  try {
    const response = await api.post("/admin/inventory/import", data);
    return response.data;
  } catch (error) {
    console.error("Error creating inventory import:", error);
    throw error;
  }
};

// Get all inventory (for admin inventory management)
export const getAllInventory = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(
      `/admin/inventory${queryParams ? "?" + queryParams : ""}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting inventory:", error);
    throw error;
  }
};

// Dashboard statistics
export const getDashboardStats = async () => {
  try {
    const response = await api.get("/admin/stats");
    // Ensure the response is always a structured object
    if (response && response.data && typeof response.data === "object") {
      return {
        users: response.data.users || 0,
        orders: response.data.orders || 0,
        revenue: response.data.revenue || 0,
        products: response.data.products || 0,
        ...response.data, // include any other stats if present
      };
    } else {
      return {
        users: 0,
        orders: 0,
        revenue: 0,
        products: 0,
      };
    }
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    // Return default stats on error for safer UI rendering
    return {
      users: 0,
      orders: 0,
      revenue: 0,
      products: 0,
    };
  }
};

// Get recent orders for dashboard
export const getRecentOrders = async (limit = 5) => {
  try {
    const response = await api.get(`/admin/recent-orders?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error getting recent orders:", error);
    throw error;
  }
};

// Get recent users for dashboard
export const getRecentUsers = async (limit = 5) => {
  try {
    const response = await api.get(`/admin/recent-users?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error getting recent users:", error);
    throw error;
  }
};

// Users management
export const getAllUsers = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(
      `/admin/users${queryParams ? "?" + queryParams : ""}`
    );
    console.log("all users", response.data);
    return response.data;
  } catch (error) {
    console.error("Error getting users:", error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
};

export const updateUserStatus = async (userId, status) => {
  try {
    const response = await api.patch(`/admin/users/${userId}/status`, {
      status,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating user status:", error);
    throw error;
  }
};

export const updateUserRole = async (userId, role) => {
  try {
    const response = await api.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

// ...existing code...

// Products management
export const getAllProducts = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(
      `/admin/products${queryParams ? "?" + queryParams : ""}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting products:", error);
    throw error;
  }
};
// Removed incorrect import of axios from './axiosConfig'

// Đơn hàng - ADMIN

export const getAllOrders = async (params = {}) => {
  try {
    const response = await api.get("/admin/orders", { params });
    return response.data;
  } catch (error) {
    console.error("Error getting orders:", error);
    throw error;
  }
};

// Get order by ID (for order detail page)

export const getOrderById = async (orderId) => {
  try {
    const response = await api.get(`/admin/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting order by id:", error);
    throw error;
  }
};

// Update order status

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await api.patch(`/admin/orders/${orderId}/status`, {
      status,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

export const getProductById = async (productId) => {
  try {
    const response = await api.get(`/admin/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting product:", error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await api.post("/admin/products", productData);
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    const response = await api.put(`/admin/products/${productId}`, productData);
    return response.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const deleteProduct = async (productId) => {
  try {
    const response = await api.delete(`/admin/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// Analytics
export const getSalesAnalytics = async (period = "30d") => {
  try {
    const response = await api.get(`/admin/analytics/sales?period=${period}`);
    return response.data;
  } catch (error) {
    console.error("Error getting sales analytics:", error);
    throw error;
  }
};

export const getUsersAnalytics = async (period = "30d") => {
  try {
    const response = await api.get(`/admin/analytics/users?period=${period}`);
    return response.data;
  } catch (error) {
    console.error("Error getting users analytics:", error);
    throw error;
  }
};

export const getProductsAnalytics = async (period = "30d") => {
  try {
    const response = await api.get(
      `/admin/analytics/products?period=${period}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting products analytics:", error);
    throw error;
  }
};

// =============================================================================
// Inventory Management APIs
// =============================================================================

// Cập nhật tồn kho sản phẩm
export const updateInventory = async (productId, data) => {
  try {
    const response = await api.put(
      `/admin/inventory/product/${productId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating inventory:", error);
    throw error;
  }
};

// ...existing code...

export const getInventoryMovements = async (id) => {
  try {
    const response = await api.get(`/admin/inventory/${id}/movements`);
    return response.data;
  } catch (error) {
    console.error("Error getting inventory movements:", error);
    throw error;
  }
};

export const createInventoryAdjustment = async (data) => {
  try {
    const response = await api.post("/admin/inventory/adjustment", data);
    return response.data;
  } catch (error) {
    console.error("Error creating inventory adjustment:", error);
    throw error;
  }
};

export const getInventoryAnalytics = async (period = "30d") => {
  try {
    const response = await api.get(
      `/admin/inventory/analytics?period=${period}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting inventory analytics:", error);
    throw error;
  }
};

// =============================================================================
// Categories Management APIs
// =============================================================================

export const getAllCategories = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== "") {
        queryParams.append(key, params[key]);
      }
    });

    const response = await api.get(`/categories?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error("Error getting categories:", error);
    throw error;
  }
};
