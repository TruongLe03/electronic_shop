import { useRouter } from "vue-router";
import { useAuthStore } from "@stores/auth";
import { useNotification } from "@/composables/client/useNotification";

export function usePurchase() {
  const router = useRouter();
  const authStore = useAuthStore();
  const { showWarning } = useNotification();

  const buyNow = async (product, quantity = 1) => {
    if (!authStore.isAuthenticated) {
      // Lưu thông tin sản phẩm cần mua và trang hiện tại
      localStorage.setItem(
        "pendingPurchase",
        JSON.stringify({ product, quantity })
      );
      localStorage.setItem("intendedRoute", window.location.pathname);

      showWarning("Vui lòng đăng nhập để thực hiện mua hàng!");
      
      // Redirect đến trang login sau 1.5 giây
      setTimeout(() => {
        try {
          router.push("/login");
        } catch (e) {
          window.location.href = "/login";
        }
      }, 1500);
      
      return false;
    }

    // Nếu đã đăng nhập, thực hiện mua ngay
    try {
      // Save order data to localStorage first
      const tempOrderData = {
        items: [{
          product: product,
          quantity: quantity,
          price: product.discount_price || product.price
        }]
      };
      localStorage.setItem('tempOrder', JSON.stringify(tempOrderData));
      
      console.log('Buy Now - Navigating to payment with data:', tempOrderData);

      // Navigate to payment page which will handle the full order creation
      return router.push('/payment').then(() => {
        console.log('Navigation to payment successful');
        return true;
      }).catch(err => {
        console.error('Navigation error:', err);
        // Fallback to window.location if router fails
        window.location.href = '/payment';
        return true;
      });
    } catch (error) {
      console.error("Error in buyNow:", error);
      return false;
    }
  };

  // Kiểm tra xem có đơn hàng đang chờ không sau khi đăng nhập
  const checkPendingPurchase = async () => {
    const pendingPurchase = localStorage.getItem("pendingPurchase");
    if (pendingPurchase && authStore.isAuthenticated) {
      const { product, quantity } = JSON.parse(pendingPurchase);
      localStorage.removeItem("pendingPurchase");
      
      // Thực hiện mua ngay sau khi đăng nhập
      return await buyNow(product, quantity);
    }
    return false;
  };

  return {
    buyNow,
    checkPendingPurchase
  };
}