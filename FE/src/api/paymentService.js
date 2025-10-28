import apiClient from '@utils/axiosConfig'

export const paymentService = {
  // Create order
  createOrder: async (orderData) => {
    try {
      const response = await apiClient.post('/orders/create', orderData)
      return response.data
    } catch (error) {
      console.error('Create order error:', error)
      throw error
    }
  },

  // Process payment
  processPayment: async (paymentData) => {
    try {
      const response = await apiClient.post('/payment/process', paymentData)
      return response.data
    } catch (error) {
      console.error('Process payment error:', error)
      throw error
    }
  },

  // ====== VNPay Methods ======
  
  // Tạo payment URL (tổng quát - support nhiều payment methods)
  createPayment: async (paymentData) => {
    try {
      const response = await apiClient.post('/payment/create', paymentData)
      return response.data
    } catch (error) {
      console.error('Create payment error:', error)
      throw error
    }
  },

  // Tạo VNPay payment URL (chuyên dụng)
  createVNPayPayment: async (paymentData) => {
    try {
      const response = await apiClient.post('/vnpay/create', paymentData)
      return response.data
    } catch (error) {
      console.error('Create VNPay payment error:', error)
      throw error
    }
  },

  // Kiểm tra trạng thái thanh toán
  checkPaymentStatus: async (orderId) => {
    try {
      const response = await apiClient.get(`/vnpay/status/${orderId}`)
      return response.data
    } catch (error) {
      console.error('Check payment status error:', error)
      throw error
    }
  },

  // Get payment methods
  getPaymentMethods: async () => {
    try {
      const response = await apiClient.get('/payment/methods')
      return response.data
    } catch (error) {
      console.error('Get payment methods error:', error)
      throw error
    }
  },

  // Verify payment
  verifyPayment: async (transactionId) => {
    try {
      const response = await apiClient.get(`/payment/${transactionId}/status`)
      return response.data
    } catch (error) {
      console.error('Verify payment error:', error)
      throw error
    }
  },

  // Get shipping fee
  calculateShipping: async (address) => {
    try {
      const response = await apiClient.post('/shipping/calculate', address)
      return response.data
    } catch (error) {
      console.error('Calculate shipping error:', error)
      throw error
    }
  },

  // Apply coupon
  applyCoupon: async (couponCode) => {
    try {
      const response = await apiClient.post('/coupons/apply', { code: couponCode })
      return response.data
    } catch (error) {
      console.error('Apply coupon error:', error)
      throw error
    }
  }
}
