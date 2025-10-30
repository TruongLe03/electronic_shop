import router from "@/routes/index.js";
import { useAuthStore } from "@stores/auth";
import { useNotification } from "@/composables/client/useNotification";

export function usePurchase() {
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
      // Tính giá thực tế (có thể có discount)
      let actualPrice = product.price;
      
      // Ưu tiên discount_price nếu có
      if (product.discount_price && product.discount_price > 0) {
        actualPrice = product.discount_price;
      }
      // Nếu không có discount_price, dùng discount_percent
      else if (product.discount_percent && product.discount_percent > 0) {
        actualPrice = product.price * (1 - product.discount_percent / 100);
      }
      
      // Tạo đơn hàng tạm thời với sản phẩm này
      const orderData = {
        items: [{
          product: product,
          quantity: quantity,
          price: actualPrice
        }],
        total: actualPrice * quantity
      };

      // Lưu vào localStorage để sử dụng ở trang payment
      localStorage.setItem("tempOrder", JSON.stringify(orderData));
      
      // Chuyển đến trang thanh toán
      router.push("/payment");
      return true;
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