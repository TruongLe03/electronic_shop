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

  // Thông báo cho các action admin cụ thể
  const notifyUserCreated = (userName = '') => {
    showSuccess(`Tạo người dùng "${userName}" thành công!`);
  };

  const notifyUserUpdated = (userName = '') => {
    showSuccess(`Cập nhật thông tin người dùng "${userName}" thành công!`);
  };

  const notifyUserDeleted = (userName = '') => {
    showWarning(`Đã xóa người dùng "${userName}".`);
  };

  const notifyUserStatusChanged = (userName = '', status = '') => {
    showInfo(`Trạng thái của người dùng "${userName}" đã được thay đổi thành "${status}".`);
  };

  const notifyProductCreated = (productName = '') => {
    showSuccess(`Tạo sản phẩm "${productName}" thành công!`);
  };

  const notifyProductUpdated = (productName = '') => {
    showSuccess(`Cập nhật sản phẩm "${productName}" thành công!`);
  };

  const notifyProductDeleted = (productName = '') => {
    showWarning(`Đã xóa sản phẩm "${productName}".`);
  };

  const notifyOrderStatusUpdated = (orderNumber = '', status = '') => {
    showSuccess(`Trạng thái đơn hàng #${orderNumber} đã được cập nhật thành "${status}".`);
  };

  const notifyInventoryUpdated = (productName = '') => {
    showSuccess(`Cập nhật tồn kho cho "${productName}" thành công!`);
  };

  const notifyCategoryCreated = (categoryName = '') => {
    showSuccess(`Tạo danh mục "${categoryName}" thành công!`);
  };

  const notifyCategoryUpdated = (categoryName = '') => {
    showSuccess(`Cập nhật danh mục "${categoryName}" thành công!`);
  };

  const notifyCategoryDeleted = (categoryName = '') => {
    showWarning(`Đã xóa danh mục "${categoryName}".`);
  };

  const notifyBulkAction = (action = '', count = 0) => {
    showSuccess(`Đã thực hiện "${action}" cho ${count} mục.`);
  };

  const notifyExportSuccess = (type = '') => {
    showSuccess(`Xuất ${type} thành công!`);
  };

  const notifyImportSuccess = (type = '', count = 0) => {
    showSuccess(`Nhập ${type} thành công! ${count} mục đã được thêm.`);
  };

  const notifyConfigUpdated = () => {
    showSuccess('Cập nhật cấu hình hệ thống thành công!');
  };

  const notifyBackupCreated = () => {
    showSuccess('Tạo bản sao lưu thành công!');
  };

  const notifySystemMaintenance = () => {
    showWarning('Hệ thống đang trong chế độ bảo trì.');
  };

  const notifyUnauthorized = () => {
    showError('Bạn không có quyền thực hiện thao tác này.');
  };

  const notifyValidationError = (field = '') => {
    showError(`Dữ liệu không hợp lệ${field ? ` cho trường "${field}"` : ''}.`);
  };

  const notifyNetworkError = () => {
    showError('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.');
  };

  const notifyServerError = () => {
    showError('Lỗi server. Vui lòng thử lại sau.');
  };

  const notifyOperationFailed = (operation = '') => {
    showError(`Thao tác "${operation}" thất bại. Vui lòng thử lại.`);
  };

  return {
    // Generic toast methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showDefault,
    
    // Admin-specific notification methods
    notifyUserCreated,
    notifyUserUpdated,
    notifyUserDeleted,
    notifyUserStatusChanged,
    notifyProductCreated,
    notifyProductUpdated,
    notifyProductDeleted,
    notifyOrderStatusUpdated,
    notifyInventoryUpdated,
    notifyCategoryCreated,
    notifyCategoryUpdated,
    notifyCategoryDeleted,
    notifyBulkAction,
    notifyExportSuccess,
    notifyImportSuccess,
    notifyConfigUpdated,
    notifyBackupCreated,
    notifySystemMaintenance,
    notifyUnauthorized,
    notifyValidationError,
    notifyNetworkError,
    notifyServerError,
    notifyOperationFailed
  };
};