import axiosInstance from '../utils/axiosConfig';

// ============= DASHBOARD ANALYTICS =============

// Lấy thống kê tổng quan dashboard
export const getDashboardStats = async () => {
  try {
    const response = await axiosInstance.get('/admin/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    throw error.response ? error.response.data : error;
  }
};

// Lấy thống kê tăng trưởng
export const getGrowthAnalytics = async () => {
  try {
    const response = await axiosInstance.get('/admin/dashboard/growth');
    return response.data;
  } catch (error) {
    console.error('Get growth analytics error:', error);
    throw error.response ? error.response.data : error;
  }
};

// ============= USER MANAGEMENT =============

// Lấy danh sách tất cả người dùng
export const getAllUsers = async (params = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;

    const response = await axiosInstance.get('/admin/users', {
      params: {
        page,
        limit,
        search,
        role,
        status,
        sortBy,
        sortOrder
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get all users error:', error);
    throw error.response ? error.response.data : error;
  }
};

// Lấy thông tin chi tiết người dùng
export const getUserById = async (userId) => {
  try {
    const response = await axiosInstance.get(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Get user by id error:', error);
    throw error.response ? error.response.data : error;
  }
};

// Cập nhật thông tin người dùng
export const updateUser = async (userId, userData) => {
  try {
    const response = await axiosInstance.put(`/admin/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Update user error:', error);
    throw error.response ? error.response.data : error;
  }
};

// Thay đổi trạng thái người dùng
export const toggleUserStatus = async (userId) => {
  try {
    const response = await axiosInstance.patch(`/admin/users/${userId}/toggle-status`);
    return response.data;
  } catch (error) {
    console.error('Toggle user status error:', error);
    throw error.response ? error.response.data : error;
  }
};

// Xóa người dùng
export const deleteUser = async (userId) => {
  try {
    const response = await axiosInstance.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Delete user error:', error);
    throw error.response ? error.response.data : error;
  }
};

// Lấy danh sách khách hàng VIP
export const getVIPCustomers = async (limit = 10) => {
  try {
    const response = await axiosInstance.get('/admin/users/vip/customers', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Get VIP customers error:', error);
    throw error.response ? error.response.data : error;
  }
};

// ============= PRODUCT MANAGEMENT =============

// Lấy danh sách sản phẩm cho admin
export const getAllProductsAdmin = async (params = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      category = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;

    const response = await axiosInstance.get('/admin/products', {
      params: {
        page,
        limit,
        search,
        category,
        status,
        sortBy,
        sortOrder
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get all products admin error:', error);
    throw error.response ? error.response.data : error;
  }
};

// Lấy thống kê sản phẩm theo danh mục
export const getProductCategoryStats = async () => {
  try {
    const response = await axiosInstance.get('/admin/products/category-stats');
    return response.data;
  } catch (error) {
    console.error('Get product category stats error:', error);
    throw error.response ? error.response.data : error;
  }
};

// Lấy sản phẩm sắp hết hàng
export const getLowStockAlert = async (threshold = 10) => {
  try {
    const response = await axiosInstance.get('/admin/products/low-stock', {
      params: { threshold }
    });
    return response.data;
  } catch (error) {
    console.error('Get low stock alert error:', error);
    throw error.response ? error.response.data : error;
  }
};

// ============= ORDER MANAGEMENT =============

// Lấy danh sách đơn hàng cho admin
export const getAllOrdersAdmin = async (params = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = '',
      startDate = '',
      endDate = '',
      userId = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;

    const response = await axiosInstance.get('/admin/orders', {
      params: {
        page,
        limit,
        status,
        startDate,
        endDate,
        userId,
        sortBy,
        sortOrder
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get all orders admin error:', error);
    throw error.response ? error.response.data : error;
  }
};

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (orderId, statusData) => {
  try {
    const response = await axiosInstance.patch(`/admin/orders/${orderId}/status`, statusData);
    return response.data;
  } catch (error) {
    console.error('Update order status error:', error);
    throw error.response ? error.response.data : error;
  }
};

// Lấy thống kê đơn hàng theo ngày trong tuần
export const getOrdersByDayStats = async () => {
  try {
    const response = await axiosInstance.get('/admin/orders/day-stats');
    return response.data;
  } catch (error) {
    console.error('Get orders by day stats error:', error);
    throw error.response ? error.response.data : error;
  }
};

// ============= INVENTORY MANAGEMENT =============

// Lấy danh sách tồn kho
export const getInventoryList = async (params = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      lowStock = false,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;

    const response = await axiosInstance.get('/admin/inventory', {
      params: {
        page,
        limit,
        search,
        lowStock,
        sortBy,
        sortOrder
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get inventory list error:', error);
    throw error.response ? error.response.data : error;
  }
};

// Cập nhật tồn kho
export const updateInventory = async (productId, inventoryData) => {
  try {
    const response = await axiosInstance.put(`/admin/inventory/${productId}`, inventoryData);
    return response.data;
  } catch (error) {
    console.error('Update inventory error:', error);
    throw error.response ? error.response.data : error;
  }
};

// ============= REPORTS & ANALYTICS =============

// Tạo báo cáo doanh thu
export const generateRevenueReport = async (startDate, endDate) => {
  try {
    const response = await axiosInstance.get('/admin/reports/revenue', {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Generate revenue report error:', error);
    throw error.response ? error.response.data : error;
  }
};

// Tạo báo cáo sản phẩm bán chạy
export const generateProductReport = async (limit = 20) => {
  try {
    const response = await axiosInstance.get('/admin/reports/products', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Generate product report error:', error);
    throw error.response ? error.response.data : error;
  }
};

// ============= SYSTEM MANAGEMENT =============

// Lấy thông tin hệ thống
export const getSystemInfo = async () => {
  try {
    const response = await axiosInstance.get('/admin/system/info');
    return response.data;
  } catch (error) {
    console.error('Get system info error:', error);
    throw error.response ? error.response.data : error;
  }
};