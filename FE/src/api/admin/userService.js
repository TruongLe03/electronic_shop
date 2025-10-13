import axiosInstance from "../../utils/axiosConfig";

// ============= USER MANAGEMENT =============

// Lấy danh sách tất cả người dùng
export const getAllUsers = async (params = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      role = "",
      status = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const response = await axiosInstance.get("/admin/users", {
      params: {
        page,
        limit,
        search,
        role,
        status,
        sortBy,
        sortOrder,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Get all users error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Lấy thông tin chi tiết người dùng
export const getUserById = async (userId) => {
  try {
    const response = await axiosInstance.get(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Get user by id error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Cập nhật thông tin người dùng
export const updateUser = async (userId, userData) => {
  try {
    const response = await axiosInstance.put(
      `/admin/users/${userId}`,
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Update user error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Thay đổi trạng thái người dùng
export const toggleUserStatus = async (userId) => {
  try {
    const response = await axiosInstance.patch(
      `/admin/users/${userId}/toggle-status`
    );
    return response.data;
  } catch (error) {
    console.error("Toggle user status error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Xóa người dùng
export const deleteUser = async (userId) => {
  try {
    const response = await axiosInstance.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Delete user error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Lấy danh sách khách hàng VIP
export const getVIPCustomers = async (limit = 10) => {
  try {
    const response = await axiosInstance.get("/admin/users/vip/customers", {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error("Get VIP customers error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Alias functions để match với index.js
export const getAllUsersAdmin = getAllUsers;
export const updateUserStatus = toggleUserStatus;

// Lấy lịch sử hoạt động của người dùng
export const getUserActivityHistory = async (userId, params = {}) => {
  try {
    const response = await axiosInstance.get(
      `/admin/users/${userId}/activity`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("Get user activity history error:", error);
    throw error.response ? error.response.data : error;
  }
};