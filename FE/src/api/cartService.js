import axiosInstance from '../utils/axiosConfig';
import { extractResponseData } from '../utils/responseUtils';

// Lấy giỏ hàng hiện tại
export const getCart = async () => {
  try {
    const response = await axiosInstance.get('/cart/items');
    return extractResponseData(response);
  } catch (error) {
    console.error('Get cart error:', error);
    throw error.response ? error.response.data : error;
  }
};

// Thêm sản phẩm vào giỏ hàng
export const addToCart = async (productId, quantity = 1) => {
  try {
    console.log('=== ADD TO CART ===');
    console.log('Product ID:', productId);
    console.log('Quantity:', quantity);
    
    const response = await axiosInstance.post('/cart/items/add', {
      product_id: productId,
      quantity
    });
    
    console.log('Add to cart response:', response.data);
    return extractResponseData(response);
  } catch (error) {
    console.error('Add to cart error:', error);
    console.error('Error details:', error.response?.data);
    throw error.response ? error.response.data : error;
  }
};

// Cập nhật số lượng sản phẩm trong giỏ
export const updateCartItem = async (productId, quantity) => {
  try {
    const response = await axiosInstance.put('/cart/items/update', {
      product_id: productId,
      quantity
    });
    return extractResponseData(response);
  } catch (error) {
    console.error('Update cart error:', error);
    throw error.response ? error.response.data : error;
  }
};

// Xóa sản phẩm khỏi giỏ hàng
export const removeFromCart = async (productId) => {
  try {
    const response = await axiosInstance.delete(`/cart/items/${productId}`);
    return extractResponseData(response);
  } catch (error) {
    console.error('Remove from cart error:', error);
    throw error.response ? error.response.data : error;
  }
};

// Xóa toàn bộ giỏ hàng
export const clearCart = async () => {
  try {
    const response = await axiosInstance.delete('/cart/items/clear');
    return extractResponseData(response);
  } catch (error) {
    console.error('Clear cart error:', error);
    throw error.response ? error.response.data : error;
  }
};
