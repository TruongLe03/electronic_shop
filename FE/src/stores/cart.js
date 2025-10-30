import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useAuthStore } from "./auth.js";
import router from "@/routes/index.js";
import { useNotification } from "@/composables/client/useNotification.js";
import {
  getCart,
  addToCart as addToCartApi,
  updateCartItem as updateCartItemApi,
  removeFromCart as removeFromCartApi,
  clearCart as clearCartApi,
} from "../api/cartService";
import { checkStock } from "../api/inventoryService.js";

export const useCartStore = defineStore("cart", () => {
  const cartItems = ref([]);
  const authStore = useAuthStore();
  const loading = ref(false);
  const isNewItemAdded = ref(false); // Thêm để trigger animation
  const {
    notifyAddToCart,
    notifyRemoveFromCart,
    notifyUpdateCart,
    notifyClearCart,
    showError,
    showWarning,
  } = useNotification();

  const cartTotal = computed(() => {
    return cartItems.value.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  });

  const cartCount = computed(() => {
    return cartItems.value.reduce((count, item) => {
      return count + item.quantity;
    }, 0);
  });

  const fetchCart = async () => {
    if (!authStore.isAuthenticated) {
      // Nếu chưa đăng nhập, giỏ hàng sẽ rỗng
      cartItems.value = [];
      return;
    }

    try {
      loading.value = true;
      const cart = await getCart();
      if (cart && cart.products) {
        cartItems.value = cart.products.map((item) => ({
          id: item.product_id._id,
          name: item.product_id.name,
          price: item.price,
          quantity: item.quantity,
          image: item.product_id.images[0],
          subtotal: item.subtotal,
        }));
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      loading.value = false;
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (!authStore.isAuthenticated) {
      // Lưu thông tin sản phẩm cần thêm và trang hiện tại
      localStorage.setItem(
        "pendingCartItem",
        JSON.stringify({ product, quantity })
      );
      localStorage.setItem("intendedRoute", window.location.pathname);

      showWarning("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      
      // Redirect đến trang login sau 1.5 giây
      setTimeout(() => {
        try {
          router.push("/login");
        } catch (e) {
          // Fallback nếu router.push không hoạt động
          window.location.href = "/login";
        }
      }, 1500);
      
      return false;
    }

    try {
      loading.value = true;

      // Check stock availability first
      const stockCheck = await checkStock(product._id, quantity);

      if (!stockCheck.available) {
        showError(
          `Sản phẩm "${product.name}" chỉ còn ${stockCheck.currentStock} sản phẩm trong kho!`
        );
        return false;
      }

      // Check if adding this quantity would exceed available stock
      const existingItem = cartItems.value.find(
        (item) => item.id === product._id
      );
      const currentCartQuantity = existingItem ? existingItem.quantity : 0;
      const totalRequestedQuantity = currentCartQuantity + quantity;

      if (totalRequestedQuantity > stockCheck.currentStock) {
        const availableToAdd =
          stockCheck.currentStock - currentCartQuantity;
        if (availableToAdd <= 0) {
          showError(
            `Bạn đã có tối đa số lượng sản phẩm "${product.name}" trong giỏ hàng!`
          );
          return false;
        } else {
          showWarning(
            `Chỉ có thể thêm tối đa ${availableToAdd} sản phẩm "${product.name}" nữa!`
          );
          return false;
        }
      }

      await addToCartApi(product._id, quantity);
      await fetchCart(); // Refresh cart data from server
      
      // Trigger animation
      isNewItemAdded.value = true;
      setTimeout(() => {
        isNewItemAdded.value = false;
      }, 600); // Reset sau 600ms
      
      notifyAddToCart(product.name);
      return true;
    } catch (error) {
      console.error("Error adding to cart:", error);
      showError("Không thể thêm sản phẩm vào giỏ hàng");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      loading.value = true;

      // Check stock availability for the new quantity
      const stockCheck = await checkStock(productId, quantity);

      if (!stockCheck.available) {
        showError(
          `Chỉ còn ${stockCheck.currentStock} sản phẩm trong kho!`
        );
        return false;
      }

      await updateCartItemApi(productId, quantity);
      await fetchCart();
      notifyUpdateCart();
      return true;
    } catch (error) {
      console.error("Error updating cart:", error);
      showError("Không thể cập nhật giỏ hàng");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      loading.value = true;
      // Lấy tên sản phẩm trước khi xóa
      const item = cartItems.value.find((item) => item.id === productId);
      const productName = item ? item.name : "Sản phẩm";

      await removeFromCartApi(productId);
      await fetchCart();
      notifyRemoveFromCart(productName);
    } catch (error) {
      console.error("Error removing from cart:", error);
      showError("Không thể xóa sản phẩm khỏi giỏ hàng");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const clearCart = async () => {
    if (!authStore.isAuthenticated) {
      cartItems.value = [];
      notifyClearCart();
      return;
    }

    try {
      loading.value = true;
      await clearCartApi();
      cartItems.value = [];
      notifyClearCart();
    } catch (error) {
      console.error("Error clearing cart:", error);
      showError("Không thể xóa giỏ hàng");
      // Fallback to local clear if API fails
      cartItems.value = [];
      notifyClearCart();
    } finally {
      loading.value = false;
    }
  };

  // Kiểm tra xem có sản phẩm đang chờ thêm vào giỏ không
  const checkPendingCartItem = async () => {
    const pendingItem = localStorage.getItem("pendingCartItem");
    if (pendingItem && authStore.isAuthenticated) {
      const { product, quantity } = JSON.parse(pendingItem);
      await addToCart(product, quantity);
      localStorage.removeItem("pendingCartItem");
    }
  };

  // Fetch cart when store is initialized and user is authenticated
  if (authStore.isAuthenticated) {
    fetchCart();
  }

  return {
    cartItems,
    cartTotal,
    cartCount,
    loading,
    isNewItemAdded,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    checkPendingCartItem,
    fetchCart,
  };
});
