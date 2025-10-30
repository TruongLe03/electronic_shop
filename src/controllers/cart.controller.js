import { CartService } from "../services/cartService.js";
import { ResponseUtil, asyncHandler } from "../utils/response.util.js";
import { ValidationUtil } from "../utils/validation.util.js";

// Lấy giỏ hàng của user hiện tại
export const getCart = asyncHandler(async (req, res) => {
  const cart = await CartService.getCartByUserId(req.user.id);
  return ResponseUtil.success(res, cart, 'Lấy giỏ hàng thành công');
});

// Thêm sản phẩm vào giỏ hàng
export const addToCart = asyncHandler(async (req, res) => {
  const { product_id, quantity } = req.body;
  const userId = req.user.id;

  // Validation
  const errors = [];
  if (!product_id) errors.push('Product ID là bắt buộc');
  if (!quantity || quantity <= 0) errors.push('Số lượng phải lớn hơn 0');
  if (product_id && !ValidationUtil.isValidObjectId(product_id)) {
    errors.push('Product ID không hợp lệ');
  }

  if (errors.length > 0) {
    return ResponseUtil.validationError(res, errors);
  }

  const cart = await CartService.addProductToCart(userId, product_id, quantity);
  
  return ResponseUtil.success(res, cart, 'Thêm sản phẩm vào giỏ hàng thành công');
});

// Cập nhật số lượng sản phẩm trong giỏ
export const updateCartItem = asyncHandler(async (req, res) => {
  const { product_id, quantity } = req.body;
  const userId = req.user.id;

  // Validation
  const errors = [];
  if (!product_id) errors.push('Product ID là bắt buộc');
  if (!quantity || quantity < 1) errors.push('Số lượng phải lớn hơn 0');
  if (product_id && !ValidationUtil.isValidObjectId(product_id)) {
    errors.push('Product ID không hợp lệ');
  }

  if (errors.length > 0) {
    return ResponseUtil.validationError(res, errors);
  }

  const cart = await CartService.updateProductQuantity(userId, product_id, quantity);
  
  return ResponseUtil.success(res, cart, 'Cập nhật giỏ hàng thành công');
});

// Xóa sản phẩm khỏi giỏ
export const removeFromCart = asyncHandler(async (req, res) => {
  const { product_id } = req.params;
  const userId = req.user.id;

  // Validation
  if (!product_id || !ValidationUtil.isValidObjectId(product_id)) {
    return ResponseUtil.validationError(res, ['Product ID không hợp lệ']);
  }

  const cart = await CartService.removeProductFromCart(userId, product_id);

  return ResponseUtil.success(res, cart, 'Đã xóa sản phẩm khỏi giỏ hàng');
});

// Xóa toàn bộ giỏ hàng
export const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  const cart = await CartService.clearCart(userId);

  return ResponseUtil.success(res, cart, 'Đã xóa toàn bộ giỏ hàng');
});

// Validate giỏ hàng trước khi checkout
export const validateCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const validation = await CartService.validateCart(userId);

    return res.json(validation);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};
