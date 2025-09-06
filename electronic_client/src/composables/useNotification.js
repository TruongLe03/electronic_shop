import { useToast } from 'vue-toast-notification';

const toast = useToast();

export const useNotification = () => {
  const showSuccess = (message, options = {}) => {
    toast.success(message, {
      position: 'top-right',
      duration: 4000,
      dismissible: true,
      ...options
    });
  };

  const showError = (message, options = {}) => {
    toast.error(message, {
      position: 'top-right',
      duration: 5000,
      dismissible: true,
      ...options
    });
  };

  const showWarning = (message, options = {}) => {
    toast.warning(message, {
      position: 'top-right',
      duration: 4000,
      dismissible: true,
      ...options
    });
  };

  const showInfo = (message, options = {}) => {
    toast.info(message, {
      position: 'top-right',
      duration: 4000,
      dismissible: true,
      ...options
    });
  };

  const showDefault = (message, options = {}) => {
    toast.default(message, {
      position: 'top-right',
      duration: 4000,
      dismissible: true,
      ...options
    });
  };

  // Thông báo cho các action cụ thể
  const notifyLogin = (success = true, userName = '') => {
    if (success) {
      showSuccess(`Chào mừng ${userName}! Đăng nhập thành công.`);
    } else {
      showError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    }
  };

  const notifyRegister = (success = true) => {
    if (success) {
      showSuccess('Đăng ký tài khoản thành công! Chào mừng bạn đến với cửa hàng.');
    } else {
      showError('Đăng ký thất bại. Vui lòng thử lại.');
    }
  };

  const notifyLogout = () => {
    showInfo('Đã đăng xuất. Hẹn gặp lại bạn!');
  };

  const notifyAddToCart = (productName = 'Sản phẩm') => {
    showSuccess(`${productName} đã được thêm vào giỏ hàng!`);
  };

  const notifyRemoveFromCart = (productName = 'Sản phẩm') => {
    showWarning(`${productName} đã được xóa khỏi giỏ hàng.`);
  };

  const notifyUpdateCart = () => {
    showInfo('Giỏ hàng đã được cập nhật.');
  };

  const notifyClearCart = () => {
    showWarning('Giỏ hàng đã được xóa.');
  };

  const notifyOrderSuccess = (orderNumber = '') => {
    showSuccess(`Đặt hàng thành công! Mã đơn hàng: ${orderNumber}`);
  };

  const notifyProfileUpdate = () => {
    showSuccess('Cập nhật thông tin cá nhân thành công!');
  };

  const notifyPasswordChange = () => {
    showSuccess('Đổi mật khẩu thành công!');
  };

  const notifyPasswordReset = () => {
    showInfo('Link đặt lại mật khẩu đã được gửi đến email của bạn.');
  };

  const notifyNetworkError = () => {
    showError('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.');
  };

  const notifyServerError = () => {
    showError('Lỗi server. Vui lòng thử lại sau.');
  };

  return {
    // Generic toast methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showDefault,
    
    // Specific notification methods
    notifyLogin,
    notifyRegister,
    notifyLogout,
    notifyAddToCart,
    notifyRemoveFromCart,
    notifyUpdateCart,
    notifyClearCart,
    notifyOrderSuccess,
    notifyProfileUpdate,
    notifyPasswordChange,
    notifyPasswordReset,
    notifyNetworkError,
    notifyServerError
  };
};
