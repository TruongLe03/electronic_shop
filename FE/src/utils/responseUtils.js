/**
 * Utility functions để xử lý response từ backend
 * Backend sử dụng ResponseUtil với format: { success, message, data, timestamp }
 */

/**
 * Extract data từ response backend
 * @param {Object} response - Response từ axios
 * @returns {Object} - Extracted data
 */
export const extractResponseData = (response) => {
  // Nếu response đã có format mới
  if (response.data && typeof response.data === 'object' && 'success' in response.data) {
    return response.data.data;
  }
  
  // Fallback cho format cũ
  return response.data;
};

/**
 * Extract full response info
 * @param {Object} response - Response từ axios
 * @returns {Object} - { success, message, data, timestamp }
 */
export const extractFullResponse = (response) => {
  if (response.data && typeof response.data === 'object' && 'success' in response.data) {
    return response.data;
  }
  
  // Fallback cho format cũ
  return {
    success: true,
    message: 'Success',
    data: response.data,
    timestamp: new Date().toISOString()
  };
};

/**
 * Check if response is successful
 * @param {Object} response - Response từ axios
 * @returns {boolean}
 */
export const isResponseSuccessful = (response) => {
  if (response.data && typeof response.data === 'object' && 'success' in response.data) {
    return response.data.success;
  }
  
  // Fallback: nếu status code 2xx thì success
  return response.status >= 200 && response.status < 300;
};

/**
 * Extract error message từ error response
 * @param {Object} error - Error object từ axios
 * @returns {string} - Error message
 */
export const extractErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    return error.response.data.errors.join(', ');
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'Đã xảy ra lỗi không xác định';
};