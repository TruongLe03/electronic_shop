import apiClient from '@utils/axiosConfig'

export const paymentService = {
  // Create order
  createOrder: async (orderData) => {
    try {
      const response = await apiClient.post('/orders', orderData)
      return response.data
    } catch (error) {
      console.error('Create order error:', error)
      throw error
    }
  },

  // Process payment
  processPayment: async (paymentData) => {
    try {
      const response = await apiClient.post('/payments/process', paymentData)
      return response.data
    } catch (error) {
      console.error('Process payment error:', error)
      throw error
    }
  },

  // Get payment methods
  getPaymentMethods: async () => {
    try {
      const response = await apiClient.get('/payments/methods')
      return response.data
    } catch (error) {
      console.error('Get payment methods error:', error)
      throw error
    }
  },

  // Verify payment
  verifyPayment: async (transactionId) => {
    try {
      const response = await apiClient.get(`/payments/verify/${transactionId}`)
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
