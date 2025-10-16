import axiosInstance from "../../utils/axiosConfig";

// ============= SYSTEM MANAGEMENT =============

// Lấy cài đặt hệ thống
export const getSystemSettings = async () => {
  try {
    const response = await axiosInstance.get("/admin/system/settings");
    return response.data;
  } catch (error) {
    console.error("Get system settings error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Cập nhật cài đặt hệ thống
export const updateSystemSettings = async (settings) => {
  try {
    const response = await axiosInstance.put("/admin/system/settings", settings);
    return response.data;
  } catch (error) {
    console.error("Update system settings error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Sao lưu dữ liệu
export const backupData = async () => {
  try {
    const response = await axiosInstance.post("/admin/backup");
    return response.data;
  } catch (error) {
    console.error("Backup data error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Lấy logs hệ thống
export const getSystemLogs = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/admin/logs", { params });
    return response.data;
  } catch (error) {
    console.error("Get system logs error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Xóa cache
export const clearCache = async (cacheType = 'all') => {
  try {
    const response = await axiosInstance.delete(`/admin/cache/${cacheType}`);
    return response.data;
  } catch (error) {
    console.error("Clear cache error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Kiểm tra trạng thái hệ thống
export const getSystemHealth = async () => {
  try {
    const response = await axiosInstance.get("/admin/system/information");
    return response.data;
  } catch (error) {
    console.error("Get system health error:", error);
    throw error.response ? error.response.data : error;
  }
};