import { ref, computed } from 'vue';
import { adminService } from '@/api/adminService.js';

export function useAdminPayments() {
  const payments = ref([]);
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  
  const stats = ref({
    total: {
      totalAmount: 0,
      totalPayments: 0,
      avgAmount: 0
    },
    byMethod: [],
    byStatus: [],
    daily: []
  });
  
  const loading = ref(false);
  const error = ref(null);

  // Lấy danh sách payments với phân trang
  const fetchPayments = async (filters = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await adminService.getPayments(filters);
      payments.value = response.data.payments;
      pagination.value = response.data.pagination;
    } catch (err) {
      error.value = err.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách thanh toán';
      console.error('Error fetching payments:', err);
    } finally {
      loading.value = false;
    }
  };

  // Lấy thống kê payments
  const fetchPaymentStats = async (startDate, endDate) => {
    try {
      const response = await adminService.getPaymentStats(startDate, endDate);
      stats.value = response.data;
    } catch (err) {
      console.error('Error fetching payment stats:', err);
    }
  };

  // Lấy chi tiết payment
  const getPaymentById = async (paymentId) => {
    try {
      const response = await adminService.getPaymentById(paymentId);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin thanh toán';
      throw new Error(message);
    }
  };

  // Cập nhật trạng thái payment
  const updatePaymentStatus = async (paymentId, updateData) => {
    try {
      const response = await adminService.updatePaymentStatus(paymentId, updateData);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái thanh toán';
      throw new Error(message);
    }
  };

  // Xử lý hoàn tiền
  const processRefund = async (paymentId, refundData) => {
    try {
      const response = await adminService.processRefund(paymentId, refundData);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Có lỗi xảy ra khi xử lý hoàn tiền';
      throw new Error(message);
    }
  };

  // Utility functions
  const formatCurrency = (amount) => {
    if (!amount) return '0 ₫';
    
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      success: 'bg-green-100 text-green-800', // For backward compatibility
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      refunded: 'bg-purple-100 text-purple-800',
      partially_refunded: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Chờ xử lý',
      processing: 'Đang xử lý',
      completed: 'Thành công',
      success: 'Thành công', // For backward compatibility
      failed: 'Thất bại',
      cancelled: 'Đã hủy',
      refunded: 'Đã hoàn tiền',
      partially_refunded: 'Hoàn tiền 1 phần'
    };
    return labels[status] || status;
  };

  const getMethodColor = (method) => {
    const colors = {
      cod: 'bg-yellow-100 text-yellow-800',
      vnpay: 'bg-blue-100 text-blue-800',
      momo: 'bg-pink-100 text-pink-800',
      zalopay: 'bg-cyan-100 text-cyan-800',
      stripe: 'bg-purple-100 text-purple-800',
      paypal: 'bg-indigo-100 text-indigo-800',
      bank_transfer: 'bg-green-100 text-green-800'
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
  };

  const getMethodLabel = (method) => {
    const labels = {
      cod: 'COD',
      vnpay: 'VNPay',
      momo: 'MoMo',
      zalopay: 'ZaloPay',
      stripe: 'Stripe',
      paypal: 'PayPal',
      bank_transfer: 'Chuyển khoản'
    };
    return labels[method] || method;
  };

  // Computed
  const totalPayments = computed(() => pagination.value.total);
  const totalRevenue = computed(() => stats.value.total.totalAmount);
  const hasPayments = computed(() => payments.value.length > 0);
  const isEmpty = computed(() => !loading.value && payments.value.length === 0);

  // Payment method stats
  const methodStats = computed(() => stats.value.byMethod || []);
  const statusStats = computed(() => stats.value.byStatus || []);
  const dailyStats = computed(() => stats.value.daily || []);

  return {
    // State
    payments,
    pagination,
    stats,
    loading,
    error,
    
    // Actions
    fetchPayments,
    fetchPaymentStats,
    getPaymentById,
    updatePaymentStatus,
    processRefund,
    
    // Computed
    totalPayments,
    totalRevenue,
    hasPayments,
    isEmpty,
    methodStats,
    statusStats,
    dailyStats,
    
    // Utils
    formatCurrency,
    formatDate,
    getStatusColor,
    getStatusLabel,
    getMethodColor,
    getMethodLabel
  };
}