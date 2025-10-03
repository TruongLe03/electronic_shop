import Order from "../models/orders.model.js";
import { CartService } from "./cartService.js";
import { ProductService } from "./productService.js";

export class OrderService {
  // Tạo đơn hàng mới
  static async createOrder(userId, orderData) {
    const { 
      shipping_address, 
      payment_method, 
      items, 
      discount_amount = 0,
      shipping_fee = 30000  // Default shipping fee 30k VND
    } = orderData;

    // Validate items và tính tổng
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await ProductService.getProductById(item.product_id);
      
      // Kiểm tra stock
      const hasStock = await ProductService.checkProductStock(item.product_id, item.quantity);
      if (!hasStock) {
        throw new Error(`Sản phẩm ${product.name} không đủ hàng trong kho`);
      }

      const discountedPrice = product.price * (1 - product.discount_percent / 100);
      const itemTotal = discountedPrice * item.quantity;
      
      orderItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price: product.price,
        discount_percent: product.discount_percent,
        subtotal: itemTotal
      });

      subtotal += itemTotal;
    }

    const total = subtotal - discount_amount + shipping_fee;

    // Tạo đơn hàng
    const order = new Order({
      user_id: userId,
      products: orderItems,  // Fixed: Order model expects 'products' not 'items'
      subtotal,
      discount_amount,
      shipping_fee,
      total,
      shipping_address,
      payment_method,
      status: 'pending',
      payment_status: 'pending'
    });

    const savedOrder = await order.save();

    // Cập nhật stock cho các sản phẩm
    for (const item of items) {
      await ProductService.updateProductStock(item.product_id, item.quantity, 'decrease');
    }

    return await Order.findById(savedOrder._id)
      .populate('products.product_id')  // Fixed: Order model has 'products' not 'items'
      .populate('user_id', 'name email phone_number');
  }

  // Lấy đơn hàng theo ID
  static async getOrderById(orderId) {
    const order = await Order.findById(orderId)
      .populate('products.product_id')  // Fixed: Order model has 'products' not 'items'
      .populate('user_id', 'name email phone_number');
    
    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
    }
    
    return order;
  }

  // Lấy đơn hàng của user
  static async getUserOrders(userId, page = 1, limit = 10, status = null) {
    const skip = (page - 1) * limit;
    
    let query = { user_id: userId };
    if (status) {
      query.status = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('products.product_id')  // Fixed: Order model has 'products' not 'items'
        .populate('user_id', 'name email phone_number')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query)
    ]);

    return {
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Lấy tất cả đơn hàng (admin)
  static async getAllOrders(page = 1, limit = 20, filters = {}) {
    const skip = (page - 1) * limit;
    
    let query = {};
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.payment_status) {
      query.payment_status = filters.payment_status;
    }
    if (filters.dateFrom && filters.dateTo) {
      query.createdAt = {
        $gte: new Date(filters.dateFrom),
        $lte: new Date(filters.dateTo)
      };
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('products.product_id')  // Fixed: Order model has 'products' not 'items'
        .populate('user_id', 'name email phone_number')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query)
    ]);

    return {
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Cập nhật trạng thái đơn hàng
  static async updateOrderStatus(orderId, status, userId = null) {
    // Nếu có userId, kiểm tra quyền sở hữu đơn hàng
    let query = { _id: orderId };
    if (userId) {
      query.user_id = userId;
    }

    const order = await Order.findOne(query);
    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    // Validate status transition
    const validTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered'],
      'delivered': [],
      'cancelled': []
    };

    if (!validTransitions[order.status].includes(status)) {
      throw new Error(`Không thể chuyển từ trạng thái ${order.status} sang ${status}`);
    }

    // Nếu hủy đơn hàng, hoàn trả stock
    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.items) {
        await ProductService.updateProductStock(item.product_id, item.quantity, 'increase');
      }
    }

    order.status = status;
    if (status === 'delivered') {
      order.delivered_at = new Date();
    }

    return await order.save();
  }

  // Cập nhật trạng thái thanh toán
  static async updatePaymentStatus(orderId, payment_status, payment_info = {}) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    order.payment_status = payment_status;
    if (payment_info.transaction_id) {
      order.payment_info = {
        ...order.payment_info,
        ...payment_info
      };
    }

    if (payment_status === 'completed') {
      order.paid_at = new Date();
    }

    return await order.save();
  }

  // Thống kê đơn hàng
  static async getOrderStats(dateFrom, dateTo) {
    const matchStage = {};
    if (dateFrom && dateTo) {
      matchStage.createdAt = {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo)
      };
    }

    const stats = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          avgOrderValue: { $avg: '$total' }
        }
      }
    ]);

    return stats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      avgOrderValue: 0
    };
  }

  // Lấy top sản phẩm bán chạy
  static async getBestSellingProducts(limit = 10, dateFrom = null, dateTo = null) {
    const matchStage = { status: { $ne: 'cancelled' } };
    if (dateFrom && dateTo) {
      matchStage.createdAt = {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo)
      };
    }

    return await Order.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$products.product_id',  // Fixed: Order model has 'products' not 'items'
          totalSold: { $sum: '$products.quantity' },
          totalRevenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          totalRevenue: 1,
          name: '$product.name',
          price: '$product.price',
          image: '$product.image'
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit }
    ]);
  }

  // Hủy đơn hàng
  static async cancelOrder(orderId, userId, cancelData) {
    const order = await Order.findById(orderId);
    
    if (!order) {
      return { success: false, reason: 'NOT_FOUND' };
    }

    // Kiểm tra quyền sở hữu đơn hàng
    if (order.user_id.toString() !== userId.toString()) {
      return { success: false, reason: 'UNAUTHORIZED' };
    }

    // Kiểm tra trạng thái đơn hàng (chỉ được hủy khi pending hoặc confirmed)
    if (!['pending', 'confirmed'].includes(order.status)) {
      return { success: false, reason: 'CANNOT_CANCEL' };
    }

    // Cập nhật trạng thái và lý do hủy
    order.status = 'cancelled';
    order.cancelled_at = new Date();
    if (cancelData.reason) {
      order.cancel_reason = cancelData.reason;
    }

    await order.save();

    // Hoàn trả stock cho các sản phẩm (nếu cần)
    // Có thể implement sau nếu có inventory management

    return { success: true, order };
  }

  // Tạo đơn hàng từ giỏ hàng
  static async createOrderFromCart(orderData) {
    const { userId, shippingAddress, paymentMethod, note } = orderData;

    // Lấy cart và items từ user
    const cart = await CartService.getCartByUserId(userId);
    
    if (!cart || !cart.products || cart.products.length === 0) {
      throw new Error('Giỏ hàng trống');
    }

    // Convert cart items to order products format
    const products = cart.products.map(item => ({
      product_id: item.product_id._id,
      name: item.product_id.name,
      price: item.price || item.product_id.finalPrice || item.product_id.price,
      quantity: item.quantity,
      image: item.product_id.main_image
    }));

    // Tính subtotal và total
    const subtotal = products.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping_fee = 30000; // Default 30k VND
    const total = subtotal + shipping_fee;

    // Tạo đơn hàng trực tiếp
    const order = new Order({
      user_id: userId,
      products,
      subtotal,
      shipping_fee,
      total,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      notes: note || "",
      status: 'pending',
      payment_status: 'pending'
    });

    const savedOrder = await order.save();

    // Cập nhật stock cho các sản phẩm
    for (const item of products) {
      await ProductService.updateProductStock(item.product_id, item.quantity, 'decrease');
    }

    // Xóa giỏ hàng sau khi tạo đơn hàng thành công
    await CartService.clearCart(userId);

    return await Order.findById(savedOrder._id)
      .populate('products.product_id')
      .populate('user_id', 'name email phone_number');
  }

  // Tạo đơn hàng trực tiếp (mua ngay)
  static async createDirectOrder(orderData) {
    const { userId, items, shippingAddress, paymentMethod, note } = orderData;

    return await this.createOrder(userId, {
      items,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      note
    });
  }

  // Cập nhật thông tin đơn hàng
  static async updateOrderInfo(orderId, userId, updateData) {
    const order = await Order.findById(orderId);
    
    if (!order || order.user_id.toString() !== userId.toString()) {
      return null;
    }

    // Chỉ cho phép cập nhật một số trường và khi đơn hàng còn pending
    if (order.status !== 'pending') {
      throw new Error('Chỉ có thể cập nhật đơn hàng ở trạng thái chờ xử lý');
    }

    const allowedFields = ['shipping_address', 'note'];
    const filteredData = {};
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    Object.assign(order, filteredData);
    order.updated_at = new Date();
    
    await order.save();
    return order;
  }

  // Xác nhận thanh toán
  static async confirmPayment(orderId, userId, paymentData) {
    const order = await Order.findById(orderId);
    
    if (!order) {
      return { success: false, reason: 'NOT_FOUND' };
    }

    if (order.user_id.toString() !== userId.toString()) {
      return { success: false, reason: 'UNAUTHORIZED' };
    }

    if (order.payment_status === 'paid') {
      return { success: false, reason: 'ALREADY_PAID' };
    }

    // Cập nhật trạng thái thanh toán
    order.payment_status = 'paid';
    order.paid_at = new Date();
    
    if (paymentData) {
      order.payment_info = paymentData;
    }

    // Tự động chuyển trạng thái đơn hàng sang confirmed
    if (order.status === 'pending') {
      order.status = 'confirmed';
    }

    await order.save();

    return { success: true, order };
  }
}