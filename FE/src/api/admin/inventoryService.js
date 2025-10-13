import axiosInstance from "../../utils/axiosConfig";

// ============= INVENTORY MANAGEMENT =============

// Lấy danh sách tồn kho
export const getInventory = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/admin/inventory", { params });
    return response.data;
  } catch (error) {
    console.error("Get inventory error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Cập nhật số lượng tồn kho
export const updateInventory = async (inventoryData) => {
  try {
    const response = await axiosInstance.post("/admin/inventory/update", inventoryData);
    return response.data;
  } catch (error) {
    console.error("Update inventory error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Lấy lịch sử thay đổi tồn kho
export const getInventoryHistory = async (productId, params = {}) => {
  try {
    const response = await axiosInstance.get(
      `/admin/inventory/history/${productId}`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("Get inventory history error:", error);
    throw error.response ? error.response.data : error;
  }
};