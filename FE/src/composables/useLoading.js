import { ref, readonly } from "vue";

const isLoading = ref(false);
const loadingMessage = ref("");

export const useLoading = () => {
  const showLoading = (message = "Đang tải...") => {
    isLoading.value = true;
    loadingMessage.value = message;
  };

  const hideLoading = () => {
    isLoading.value = false;
    loadingMessage.value = "";
  };

  const showFormLoading = (message = "Đang xử lý...") => {
    showLoading(message);
  };

  return {
    isLoading: readonly(isLoading),
    loadingMessage: readonly(loadingMessage),
    showLoading,
    hideLoading,
    showFormLoading,
  };
};