import Cart from "../models/cart.model.js";
import Product from "../models/products.model.js";
import { ProductService } from "./productService.js";

export class CartService {
  /**
   * Lấy giỏ hàng của user
   */
  static async getCartByUserId(userId) {
    const cart = await Cart.findOne({ user_id: userId })
      .populate("products.product_id")
      .exec();

    if (!cart) {
      throw new Error("Giỏ hàng trống");
    }

    return cart;
  }

  /**
   * Tạo giỏ hàng mới cho user
   */
  static async createCart(userId) {
    const cart = new Cart({
      user_id: userId,
      products: [],
      total: 0,
    });
    return await cart.save();
  }

  /**
   * Thêm sản phẩm vào giỏ hàng
   */
  static async addProductToCart(userId, productId, quantity) {
    // Kiểm tra sản phẩm tồn tại
    const product = await ProductService.getProductById(productId);
    if (!product) {
      throw new Error("Sản phẩm không tồn tại");
    }

    // Kiểm tra stock
    const hasStock = await ProductService.checkProductStock(
      productId,
      quantity
    );
    if (!hasStock) {
      throw new Error("Không đủ hàng trong kho");
    }

    // Tìm hoặc tạo giỏ hàng
    let cart = await Cart.findOne({ user_id: userId });
    if (!cart) {
      cart = await this.createCart(userId);
    }

    // Kiểm tra sản phẩm đã có trong giỏ chưa
    const existingProductIndex = cart.products.findIndex(
      (item) => item.product_id.toString() === productId
    );

    // Sử dụng giá khuyến mãi nếu có, nếu không thì dùng giá gốc
    const productPrice = product.discount_price || product.price;

    if (existingProductIndex > -1) {
      // Nếu đã có, cập nhật số lượng
      const newQuantity =
        cart.products[existingProductIndex].quantity + quantity;

      // Kiểm tra stock cho số lượng mới
      const hasStockForNewQuantity = await ProductService.checkProductStock(
        productId,
        newQuantity
      );
      if (!hasStockForNewQuantity) {
        throw new Error("Không đủ hàng trong kho cho số lượng yêu cầu");
      }

      cart.products[existingProductIndex].quantity = newQuantity;
      cart.products[existingProductIndex].price = productPrice;
      cart.products[existingProductIndex].subtotal = newQuantity * productPrice;
    } else {
      // Nếu chưa có, thêm mới
      cart.products.push({
        product_id: productId,
        quantity,
        price: productPrice,
        subtotal: quantity * productPrice,
      });
    }

    // Tính lại total
    cart.total = await this.calculateCartTotal(cart.products);
    await cart.save();

    return await Cart.findOne({ user_id: userId })
      .populate("products.product_id")
      .exec();
  }

  /**
   * Cập nhật số lượng sản phẩm trong giỏ
   */
  static async updateProductQuantity(userId, productId, quantity) {
    const cart = await Cart.findOne({ user_id: userId });
    if (!cart) throw new Error("Không tìm thấy giỏ hàng");

    // Kiểm tra stock
    const hasStock = await ProductService.checkProductStock(
      productId,
      quantity
    );
    if (!hasStock) {
      throw new Error("Không đủ hàng trong kho");
    }

    const productIndex = cart.products.findIndex(
      (item) => item.product_id.toString() === productId
    );
    if (productIndex === -1) {
      throw new Error("Không tìm thấy sản phẩm trong giỏ hàng");
    }

    const product = await Product.findById(productId);
    if (!product) throw new Error("Sản phẩm không tồn tại");

    // Sử dụng giá khuyến mãi nếu có, nếu không thì dùng giá gốc
    const productPrice = product.discount_price || product.price;

    cart.products[productIndex].quantity = quantity;
    cart.products[productIndex].price = productPrice;
    cart.products[productIndex].subtotal = quantity * productPrice;
    cart.total = await this.calculateCartTotal(cart.products);

    await cart.save();

    return await Cart.findOne({ user_id: userId })
      .populate("products.product_id")
      .exec();
  }

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   */
  static async removeProductFromCart(userId, productId) {
    const cart = await Cart.findOne({ user_id: userId });
    if (!cart) throw new Error("Không tìm thấy giỏ hàng");

    cart.products = cart.products.filter(
      (item) => item.product_id.toString() !== productId
    );

    cart.total = await this.calculateCartTotal(cart.products);
    await cart.save();

    return await Cart.findOne({ user_id: userId })
      .populate("products.product_id")
      .exec();
  }

  /**
   * Xóa toàn bộ giỏ hàng
   */
  static async clearCart(userId) {
    const cart = await Cart.findOne({ user_id: userId });
    if (!cart) throw new Error("Không tìm thấy giỏ hàng");

    cart.products = [];
    cart.total = 0;

    await cart.save();

    return await Cart.findOne({ user_id: userId })
      .populate("products.product_id")
      .exec();
  }

  /**
   * Tính tổng giá trị giỏ hàng
   */
  static async calculateCartTotal(products) {
    let total = 0;

    for (const item of products) {
      if (item.subtotal) {
        total += item.subtotal;
      } else {
        const product = await Product.findById(item.product_id);
        if (product) {
          // Sử dụng giá khuyến mãi nếu có, nếu không thì dùng giá gốc
          const productPrice = product.discount_price || product.price;
          total += productPrice * item.quantity;
        }
      }
    }

    return total;
  }

  /**
   * Validate giỏ hàng trước khi checkout
   */
  static async validateCart(userId) {
    const cart = await this.getCartByUserId(userId);
    const errors = [];

    for (const item of cart.products) {
      try {
        const hasStock = await ProductService.checkProductStock(
          item.product_id._id,
          item.quantity
        );
        if (!hasStock) {
          errors.push({
            productId: item.product_id._id,
            productName: item.product_id.name,
            message: "Không đủ hàng trong kho",
          });
        }
      } catch (error) {
        errors.push({
          productId: item.product_id._id,
          message: error.message,
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
