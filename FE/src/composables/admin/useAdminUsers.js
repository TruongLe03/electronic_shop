import { ref, reactive, computed } from "vue";
import * as adminService from "@/api/adminService";

export function useAdminUsers() {
  const users = ref([]);
  const currentUser = ref(null);
  const vipCustomers = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Pagination state
  const pagination = reactive({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Filter state
  const filters = reactive({
    search: "",
    role: "",
    status: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Lấy danh sách người dùng
  const fetchUsers = async (params = {}) => {
    try {
      loading.value = true;
      error.value = null;

      const queryParams = {
        page: pagination.currentPage,
        limit: 10,
        ...filters,
        ...params,
      };

      const response = await adminService.getAllUsers(queryParams);
      users.value = response.data.users;

      // Update pagination
      Object.assign(pagination, response.data.pagination);
    } catch (err) {
      error.value = err.message || "Lỗi khi lấy danh sách người dùng";
      console.error("Fetch users error:", err);
    } finally {
      loading.value = false;
    }
  };

  // Lấy thông tin chi tiết người dùng
  const fetchUserById = async (userId) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await adminService.getUserById(userId);
      currentUser.value = response.data;
    } catch (err) {
      error.value = err.message || "Lỗi khi lấy thông tin người dùng";
      console.error("Fetch user by id error:", err);
    } finally {
      loading.value = false;
    }
  };

  // Cập nhật người dùng
  const updateUser = async (userId, userData) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await adminService.updateUser(userId, userData);

      // Update user in list
      const index = users.value.findIndex((user) => user._id === userId);
      if (index !== -1) {
        users.value[index] = response.data;
      }

      return response;
    } catch (err) {
      error.value = err.message || "Lỗi khi cập nhật người dùng";
      console.error("Update user error:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Thay đổi trạng thái người dùng
  const toggleUserStatus = async (userId) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await adminService.toggleUserStatus(userId);

      // Update user status in list
      const user = users.value.find((user) => user._id === userId);
      if (user) {
        user.status = response.data.status;
      }

      return response;
    } catch (err) {
      error.value = err.message || "Lỗi khi thay đổi trạng thái người dùng";
      console.error("Toggle user status error:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Xóa người dùng
  const deleteUser = async (userId) => {
    try {
      loading.value = true;
      error.value = null;
      await adminService.deleteUser(userId);

      // Remove user from list
      users.value = users.value.filter((user) => user._id !== userId);

      return true;
    } catch (err) {
      error.value = err.message || "Lỗi khi xóa người dùng";
      console.error("Delete user error:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Lấy danh sách khách hàng VIP
  const fetchVIPCustomers = async (limit = 10) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await adminService.getVIPCustomers(limit);
      vipCustomers.value = response.data;
    } catch (err) {
      error.value = err.message || "Lỗi khi lấy danh sách khách hàng VIP";
      console.error("Fetch VIP customers error:", err);
    } finally {
      loading.value = false;
    }
  };

  // Search users
  const searchUsers = (searchTerm) => {
    filters.search = searchTerm;
    pagination.currentPage = 1;
    fetchUsers();
  };

  // Filter users
  const filterUsers = (filterParams) => {
    Object.assign(filters, filterParams);
    pagination.currentPage = 1;
    fetchUsers();
  };

  // Change page
  const changePage = (page) => {
    pagination.currentPage = page;
    fetchUsers();
  };

  // Computed properties
  const activeUsers = computed(() => {
    return users.value.filter((user) => user.status === "active");
  });

  const inactiveUsers = computed(() => {
    return users.value.filter((user) => user.status === "inactive");
  });

  const adminUsers = computed(() => {
    return users.value.filter((user) => user.role === "admin");
  });

  const customerUsers = computed(() => {
    return users.value.filter((user) => user.role === "customer");
  });

  return {
    users,
    currentUser,
    vipCustomers,
    loading,
    error,
    pagination,
    filters,
    fetchUsers,
    fetchUserById,
    updateUser,
    toggleUserStatus,
    deleteUser,
    fetchVIPCustomers,
    searchUsers,
    filterUsers,
    changePage,
    activeUsers,
    inactiveUsers,
    adminUsers,
    customerUsers,
  };
}
