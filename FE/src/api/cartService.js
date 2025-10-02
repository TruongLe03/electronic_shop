import axiosInstance from '../utils/axiosConfig';

// Lấy giỏ hàng hiện tại
export const getCart = async () => {
  try {
    const response = await axiosInstance.get('/cart');
    return response.data;
  } catch (error) {
    console.error('Get cart error:', error);
    throw error.response ? error.response.data : error;
  }
};

// Thêm sản phẩm vào giỏ hàng
export const addToCart = async (productId, quantity = 1) => {
  try {
    const response = await axiosInstance.post('/cart/add', {
      product_id: productId,
      quantity
    });
    return response.data;
  } catch (error) {
    console.error('Add to cart error:', error);
    throw error.response ? error.response.data : error;
  }
};

// Cập nhật số lượng sản phẩm trong giỏ
export const updateCartItem = async (productId, quantity) => {
  try {
    const response = await axiosInstance.put('/cart/update', {
      product_id: productId,
      quantity
    });
    return response.data;
  } catch (error) {
    console.error('Update cart error:', error);
    throw error.response ? error.response.data : error;
  }
};

// Xóa sản phẩm khỏi giỏ hàng
export const removeFromCart = async (productId) => {
  try {
    const response = await axiosInstance.delete(`/cart/remove/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Remove from cart error:', error);
    throw error.response ? error.response.data : error;
  }
};
