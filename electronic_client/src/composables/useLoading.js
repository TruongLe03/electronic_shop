import { ref } from 'vue'
import { useLoading } from 'vue-loading-overlay'

const globalLoading = ref(false)

export const useGlobalLoading = () => {
  const $loading = useLoading({
    // Cấu hình mặc định
    color: '#3b82f6',
    height: 4,
    width: 64,
    radius: 4,
    opacity: 0.8,
    backgroundColor: '#000000',
    zIndex: 999,
  })

  const showLoading = (message = 'Đang tải...', options = {}) => {
    const defaultOptions = {
      color: '#3b82f6',
      height: 4,
      width: 64,
      radius: 4,
      opacity: 0.8,
      backgroundColor: '#000000',
      zIndex: 999,
      ...options
    }

    globalLoading.value = true
    return $loading.show({
      container: null,
      canCancel: false,
      onCancel: () => {
        globalLoading.value = false
      },
      loader: 'spinner',
      ...defaultOptions
    })
  }

  const hideLoading = (loader) => {
    globalLoading.value = false
    if (loader && typeof loader.hide === 'function') {
      loader.hide()
    }
  }

  const showPageLoading = (message = 'Đang tải trang...') => {
    return showLoading(message, {
      color: '#3b82f6',
      backgroundColor: '#ffffff',
      opacity: 0.9,
      loader: 'dots'
    })
  }

  const showFormLoading = (message = 'Đang xử lý...') => {
    return showLoading(message, {
      color: '#10b981',
      backgroundColor: '#f9fafb',
      opacity: 0.7,
      loader: 'spinner'
    })
  }

  const showApiLoading = (message = 'Đang kết nối...') => {
    return showLoading(message, {
      color: '#f59e0b',
      backgroundColor: '#1f2937',
      opacity: 0.8,
      loader: 'bars'
    })
  }

  return {
    globalLoading,
    showLoading,
    hideLoading,
    showPageLoading,
    showFormLoading,
    showApiLoading
  }
}
