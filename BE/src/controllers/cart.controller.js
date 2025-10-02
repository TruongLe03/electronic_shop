import Cart from "../models/cart.model.js";
import Product from "../models/products.model.js";

// Lấy giỏ hàng của user hiện tại
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user_id: req.user.id })
      .populate("products.product_id")
      .exec();

    if (!cart) {
      return res.status(404).json({
        message: "Giỏ hàng trống",
      });
    }

    return res.json(cart);
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({
      message: "Lỗi khi lấy thông tin giỏ hàng",
      error: error.message,
    });
  }
};

// Thêm sản phẩm vào giỏ hàng
export const addToCart = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const userId = req.user.id;

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    // Tìm hoặc tạo giỏ hàng cho user
    let cart = await Cart.findOne({ user_id: userId });
    if (!cart) {
      cart = new Cart({
        user_id: userId,
        products: [],
        total: 0,
      });
    }

    // Kiểm tra xem sản phẩm đã có trong giỏ chưa
    const existingProductIndex = cart.products.findIndex(
      (item) => item.product_id.toString() === product_id
    );

    if (existingProductIndex > -1) {
      // Nếu sản phẩm đã có, cập nhật số lượng
      cart.products[existingProductIndex].quantity += quantity;
      cart.products[existingProductIndex].subtotal =
        cart.products[existingProductIndex].quantity * product.price;
    } else {
      // Nếu chưa có, thêm mới vào giỏ
      cart.products.push({
        product_id,
        quantity,
        price: product.price,
        subtotal: product.price * quantity,
      });
    }

    // Tính tổng tiền
    cart.total = cart.products.reduce((sum, item) => sum + item.subtotal, 0);

    // Lưu giỏ hàng
    await cart.save();

    // Trả về giỏ hàng đã cập nhật
    const updatedCart = await Cart.findById(cart._id)
      .populate("products.product_id")
      .exec();

    return res.json(updatedCart);
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({
      message: "Lỗi khi thêm vào giỏ hàng",
      error: error.message,
    });
  }
};

// Cập nhật số lượng sản phẩm trong giỏ
export const updateCartItem = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const userId = req.user.id;

    if (quantity < 1) {
      return res.status(400).json({
        message: "Số lượng phải lớn hơn 0",
      });
    }

    const cart = await Cart.findOne({ user_id: userId });
    if (!cart) {
      return res.status(404).json({
        message: "Không tìm thấy giỏ hàng",
      });
    }

    const productIndex = cart.products.findIndex(
      (item) => item.product_id.toString() === product_id
    );

    if (productIndex === -1) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm trong giỏ hàng",
      });
    }

    // Cập nhật số lượng và tính lại tổng tiền
    cart.products[productIndex].quantity = quantity;
    cart.products[productIndex].subtotal =
      cart.products[productIndex].price * quantity;
    cart.total = cart.products.reduce((sum, item) => sum + item.subtotal, 0);

    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate("products.product_id")
      .exec();

    return res.json(updatedCart);
  } catch (error) {
    console.error("Update cart item error:", error);
    return res.status(500).json({
      message: "Lỗi khi cập nhật giỏ hàng",
      error: error.message,
    });
  }
};

// Xóa sản phẩm khỏi giỏ
export const removeFromCart = async (req, res) => {
  try {
    const { product_id } = req.params;
    const userId = req.user.id;

    const cart = await Cart.findOne({ user_id: userId });
    if (!cart) {
      return res.status(404).json({
        message: "Không tìm thấy giỏ hàng",
      });
    }

    // Lọc bỏ sản phẩm cần xóa
    cart.products = cart.products.filter(
      (item) => item.product_id.toString() !== product_id
    );

    // Tính lại tổng tiền
    cart.total = cart.products.reduce((sum, item) => sum + item.subtotal, 0);

    await cart.save();

    return res.json({
      message: "Đã xóa sản phẩm khỏi giỏ hàng",
      cart,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return res.status(500).json({
      message: "Lỗi khi xóa sản phẩm khỏi giỏ hàng",
      error: error.message,
    });
  }
};
