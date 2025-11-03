import axiosInstance from "@/utils/axiosConfig.js";

/**
 * Get all payments with pagination and filters
 * @param {Object} filters - Filter options
 * @returns {Promise} API response
 */
export const getPayments = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    // Add filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        params.append(key, value);
      }
    });

    const response = await axiosInstance.get(
      `/admin/payments/all?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get payment statistics
 * @param {string} startDate - Start date for stats
 * @param {string} endDate - End date for stats
 * @returns {Promise} API response
 */
export const getPaymentStats = async (startDate, endDate) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await axiosInstance.get(
      `/admin/payments/statistics?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get payment by ID
 * @param {string} paymentId - Payment ID
 * @returns {Promise} API response
 */
export const getPaymentById = async (paymentId) => {
  try {
    const response = await axiosInstance.get(`/admin/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update payment status
 * @param {string} paymentId - Payment ID
 * @param {Object} updateData - Update data
 * @returns {Promise} API response
 */
export const updatePaymentStatus = async (paymentId, updateData) => {
  try {
    const response = await axiosInstance.patch(
      `/admin/payments/${paymentId}/status`,
      updateData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Process refund for payment
 * @param {string} paymentId - Payment ID
 * @param {Object} refundData - Refund data
 * @returns {Promise} API response
 */
export const processRefund = async (paymentId, refundData) => {
  try {
    const response = await axiosInstance.post(
      `/admin/payments/${paymentId}/refund`,
      refundData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get payment refund history
 * @param {string} paymentId - Payment ID
 * @returns {Promise} API response
 */
export const getPaymentRefunds = async (paymentId) => {
  try {
    const response = await axiosInstance.get(
      `/admin/payments/${paymentId}/refunds`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Export payments data
 * @param {Object} filters - Export filters
 * @returns {Promise} API response
 */
export const exportPayments = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        params.append(key, value);
      }
    });

    const response = await axiosInstance.get(
      `/admin/payments/export?${params.toString()}`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get payment method statistics
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {Promise} API response
 */
export const getPaymentMethodStats = async (startDate, endDate) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await axiosInstance.get(
      `/admin/payments/method-stats?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
