import apiClient from "@/utils/axiosConfig";

/**
 * Tạo payment fields và checkout URL cho SePay
 */

export const createSepayPayment = async (orderId, total) => {
  try {
    const userId = localStorage.getItem("user")._id;
    const response = await apiClient.post("/sepay/create-payment", {
      orderId,
      total,
      userId,
    });
    console.log("Create SePay payment response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Create SePay payment error:", error);
    throw error;
  }
};

/**
 * Kiểm tra trạng thái thanh toán SePay
 */
export const checkSepayPaymentStatus = async (paymentId) => {
  try {
    const response = await apiClient.get(`/sepay/payment-status/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error("Check SePay payment status error:", error);
    throw error;
  }
};

/**
 * Lấy danh sách đơn hàng từ SePay (Admin)
 */
export const getSepayOrders = async (params = {}) => {
  try {
    const response = await apiClient.get("/sepay/orders", { params });
    return response.data;
  } catch (error) {
    console.error("Get SePay orders error:", error);
    throw error;
  }
};

/**
 * Kiểm tra trạng thái đơn hàng từ SePay API (Admin)
 */
export const checkSepayOrderStatus = async (orderInvoiceNumber) => {
  try {
    const response = await apiClient.get(
      `/sepay/order-status/${orderInvoiceNumber}`
    );
    return response.data;
  } catch (error) {
    console.error("Check SePay order status error:", error);
    throw error;
  }
};

/**
 * Test cấu hình SePay
 */
export const testSepayConfig = async () => {
  try {
    const response = await apiClient.get("/sepay/test-config");
    return response.data;
  } catch (error) {
    console.error("Test SePay config error:", error);
    throw error;
  }
};
