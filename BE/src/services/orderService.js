import Order from "../models/orders.model.js";
import { CartService } from "./cartService.js";
import { ProductService } from "./productService.js";
import NotificationService from "./notificationService.js";

export class OrderService {
  // Tạo đơn hàng mới
  static async createOrder(userId, orderData) {
    const {
      shipping_address,
      payment_method,
      items,
      discount_amount = 0,
      shipping_fee = 30000, // Default shipping fee 30k VND
    } = orderData;

    // Validate required fields
    if (
      !shipping_address ||
      !shipping_address.name ||
      !shipping_address.phone ||
      !shipping_address.address
    ) {
      throw new Error("Thông tin địa chỉ giao hàng không đầy đủ");
    }

    // Validate items và tính tổng
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      // Support both productId and product_id for compatibility
      const productId = item.productId || item.product_id;

      if (!productId) {
        throw new Error("Product ID is required in order items");
      }

      const product = await ProductService.getProductById(productId);

      // Validate product data
      if (!product.price || isNaN(product.price) || product.price <= 0) {
        throw new Error(`Giá sản phẩm ${product.name} không hợp lệ`);
      }

      // Kiểm tra stock - ném lỗi cụ thể để frontend xử lý
      const stockInfo = await ProductService.getProductStock(productId);
      if (!stockInfo || stockInfo.quantity < item.quantity) {
        const availableStock = stockInfo?.quantity || 0;
        throw new Error(`Sản phẩm "${product.name}" không đủ hàng. Số lượng còn lại: ${availableStock}, bạn đặt: ${item.quantity}`);
      }

      // Sử dụng giá khuyến mãi nếu có, nếu không thì dùng giá gốc
      const finalPrice = product.discount_price || product.price;
      const itemTotal = finalPrice * item.quantity;

      // Validate numeric values before pushing
      if (isNaN(finalPrice) || finalPrice < 0) {
        throw new Error(`Giá sản phẩm ${product.name} không hợp lệ`);
      }
      if (isNaN(item.quantity) || item.quantity <= 0) {
        throw new Error(`Số lượng sản phẩm ${product.name} không hợp lệ`);
      }

      orderItems.push({
        product_id: productId,
        name: product.name,
        price: Math.round(finalPrice), // Sử dụng giá khuyến mãi hoặc giá gốc
        quantity: parseInt(item.quantity),
        image: product.main_image || product.images?.[0] || null,
      });

      subtotal += itemTotal;
    }

    // Round values to avoid decimal issues
    subtotal = Math.round(subtotal);
    const total = Math.round(subtotal + shipping_fee); // Removed discount_amount since we're not using coupons

    // Validate numeric values
    if (isNaN(subtotal) || subtotal < 0) {
      throw new Error("Subtotal không hợp lệ");
    }
    if (isNaN(total) || total < 0) {
      throw new Error("Tổng tiền không hợp lệ");
    }

    // Tạo đơn hàng
    const order = new Order({
      user_id: userId,
      products: orderItems,
      subtotal,
      shipping_fee,
      total,
      shipping_address,
      payment_method,
      status: "pending",
      payment_status: "pending",
      notes: orderData.note || "",
    });

    const savedOrder = await order.save();

    // Tự động kiểm tra và xử lý tồn kho
    let autoConfirmed = false;
    try {
      // Cập nhật stock cho các sản phẩm và kiểm tra lại
      for (const item of items) {
        const productId = item.productId || item.product_id;
        await ProductService.updateProductStock(
          productId,
          item.quantity,
          "decrease"
        );
      }
      
      // Nếu cập nhật stock thành công, tự động chuyển sang confirmed
      await Order.findByIdAndUpdate(savedOrder._id, {
        status: "confirmed",
        confirmed_at: new Date(),
        notes: (orderData.note || "") + " [Tự động xác nhận - đủ tồn kho]"
      });
      autoConfirmed = true;
      
    } catch (stockError) {
      // Nếu có lỗi stock, giữ nguyên trạng thái pending và ghi log
      console.error("Stock update failed for order:", savedOrder._id, stockError);
      await Order.findByIdAndUpdate(savedOrder._id, {
        notes: (orderData.note || "") + ` [Chờ xử lý - ${stockError.message}]`
      });
    }

    const finalOrder = await Order.findById(savedOrder._id)
      .populate("products.product_id") // Fixed: Order model has 'products' not 'items'
      .populate("user_id", "name email phone_number");
    
    // Thêm thông tin trạng thái tự động xác nhận
    if (autoConfirmed) {
      finalOrder._doc.auto_confirmed = true;
      finalOrder._doc.confirmation_message = "Đơn hàng đã được tự động xác nhận do đủ tồn kho";
    }
    
    // Tạo thông báo cho đơn hàng mới (không throw error nếu fail)
    try {
      // Lấy thông tin user để kiểm tra role
      const User = (await import("../models/user.model.js")).default;
      const user = await User.findById(userId).select("role");
      const isAdmin = user?.role === "admin";

      // Thông báo cho khách hàng (client hoặc admin đều nhận)
      await NotificationService.createOrderNotification(
        userId,
        savedOrder._id,
        "order_created",
        {
          orderId: savedOrder.orderId,
          total: savedOrder.total,
        }
      );
      
      // Chỉ tạo thông báo cho admin khi KHÁCH HÀNG (không phải admin) đặt hàng
      if (!isAdmin) {
        await NotificationService.createAdminNotification(
          savedOrder._id,
          "order_created",
          {
            orderId: savedOrder.orderId,
            total: savedOrder.total,
            customerName: shipping_address.name,
          }
        );
        console.log("✅ Admin notification created for customer order:", savedOrder.orderId);
      } else {
        console.log("ℹ️ Skipped admin notification (order by admin):", savedOrder.orderId);
      }
      
      console.log("✅ Notifications created for order:", savedOrder.orderId);
    } catch (notifError) {
      console.error("❌ Error creating notification:", notifError);
      // Don't throw - order creation should succeed even if notification fails
    }
    
    return finalOrder;
  }

  // Lấy đơn hàng theo ID
  static async getOrderById(orderId) {
    const order = await Order.findById(orderId)
      .populate("products.product_id") // Fixed: Order model has 'products' not 'items'
      .populate("user_id", "name email phone_number");

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
        .populate("products.product_id") // Fixed: Order model has 'products' not 'items'
        .populate("user_id", "name email phone_number")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ]);
    return {
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
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
        $lte: new Date(filters.dateTo),
      };
    }

    if (filters.userId) {
      query.user_id = filters.userId;
    }

    // Build sort
    let sort = {};
    const sortBy = filters.sortBy || "createdAt";
    const sortOrder = filters.sortOrder === "asc" ? 1 : -1;
    sort[sortBy] = sortOrder;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("products.product_id") // Fixed: Order model has 'products' not 'items'
        .populate("user_id", "name email phone_number")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ]);

    return {
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
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

    // Validate status transition - Updated flow
    const validTransitions = {
      "pending": ["payment_pending", "confirmed", "cancelled"],
      "payment_pending": ["payment_failed", "confirmed", "cancelled"],
      "payment_failed": ["pending", "cancelled"],
      "confirmed": ["processing", "cancelled"], 
      // Allow admin to move directly from processing to shipping in some workflows
      "processing": ["ready_to_ship", "shipping", "cancelled"],
      "ready_to_ship": ["shipping", "cancelled"],
      "shipping": ["delivered", "returned"],
      "delivered": ["returned"],
      "cancelled": [],
      "returned": [],
    };

    if (!validTransitions[order.status] || !validTransitions[order.status].includes(status)) {
      throw new Error(
        `Không thể chuyển từ trạng thái ${order.status} sang ${status}`
      );
    }

    // Nếu hủy đơn hàng, hoàn trả stock
    if (status === "cancelled" && order.status !== "cancelled") {
      for (const item of order.products) {
        // Fixed: Use 'products' not 'items'
        const productId = item.product_id || item.productId;
        await ProductService.updateProductStock(
          productId,
          item.quantity,
          "increase"
        );
      }
    }

    // Cập nhật status và timestamps tương ứng
    order.status = status;
    const now = new Date();
    
    switch (status) {
      case "confirmed":
        order.confirmed_at = now;
        break;
      case "processing":
        order.processing_at = now;
        break;
      case "ready_to_ship":
        // Có thể thêm ready_to_ship_at nếu cần
        break;
      case "shipping":
        order.shipped_at = now;
        break;
      case "delivered":
        order.delivered_at = now;
        order.delivery_date = now;
        break;
      case "cancelled":
        order.cancelled_at = now;
        break;
    }

    const updatedOrder = await order.save();
    
    // Tạo thông báo theo trạng thái
    const notificationTypes = {
      confirmed: "order_confirmed",
      processing: "order_processing",
      shipping: "order_shipping",
      delivered: "order_delivered",
      cancelled: "order_cancelled",
    };

    if (notificationTypes[status]) {
      // Thông báo cho khách hàng
      await NotificationService.createOrderNotification(
        order.user_id,
        order._id,
        notificationTypes[status],
        {
          orderId: order.orderId,
          total: order.total,
        }
      );

      // Thông báo cho admin (chỉ cho confirmed và cancelled)
      if (status === "confirmed" || status === "cancelled") {
        await NotificationService.createAdminNotification(
          order._id,
          notificationTypes[status],
          {
            orderId: order.orderId,
            total: order.total,
            customerName: order.shipping_address?.name,
            cancelledBy: status === "cancelled" ? "admin" : null,
          }
        );
      }
    }
    
    // Return populated order for better response
    return await Order.findById(updatedOrder._id)
      .populate("products.product_id")
      .populate("user_id", "name email phone_number");
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
        ...payment_info,
      };
    }

    if (payment_status === "completed") {
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
        $lte: new Date(dateTo),
      };
    }

    const stats = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          completedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          avgOrderValue: { $avg: "$total" },
        },
      },
    ]);

    return (
      stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        avgOrderValue: 0,
      }
    );
  }

  // Lấy top sản phẩm bán chạy
  static async getBestSellingProducts(
    limit = 10,
    dateFrom = null,
    dateTo = null
  ) {
    const matchStage = { status: { $ne: "cancelled" } };
    if (dateFrom && dateTo) {
      matchStage.createdAt = {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo),
      };
    }

    return await Order.aggregate([
      { $match: matchStage },
      { $unwind: "$products" }, // Fixed: Order model has 'products' not 'items'
      {
        $group: {
          _id: "$products.product_id", // Fixed: Order model has 'products' not 'items'
          totalSold: { $sum: "$products.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$products.price", "$products.quantity"] },
          },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          totalRevenue: 1,
          name: "$product.name",
          price: "$product.price",
          image: "$product.main_image",
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
    ]);
  }

  // Hủy đơn hàng
  static async cancelOrder(orderId, userId, cancelData) {
    const order = await Order.findById(orderId);

    if (!order) {
      return { success: false, reason: "NOT_FOUND" };
    }

    // Kiểm tra quyền sở hữu đơn hàng
    if (order.user_id.toString() !== userId.toString()) {
      return { success: false, reason: "UNAUTHORIZED" };
    }

    // Kiểm tra trạng thái đơn hàng (chỉ được hủy khi pending hoặc confirmed)
    if (!["pending", "confirmed"].includes(order.status)) {
      return { success: false, reason: "CANNOT_CANCEL" };
    }

    // Cập nhật trạng thái và lý do hủy
    order.status = "cancelled";
    order.cancelled_at = new Date();
    if (cancelData.reason) {
      order.cancel_reason = cancelData.reason;
    }

    await order.save();

    // Hoàn trả stock cho các sản phẩm (nếu cần)
    // Có thể implement sau nếu có inventory management

    // Tạo thông báo hủy đơn hàng (không await để không block)
    NotificationService.createOrderNotification(
      order.user_id,
      order._id,
      "order_cancelled",
      {
        orderId: order.orderId,
        total: order.total,
        cancelReason: cancelData.reason,
      }
    ).catch(err => console.error("Error creating cancel notification:", err));

    return { success: true, order };
  }

  // Tạo đơn hàng từ giỏ hàng
  static async createOrderFromCart(orderData) {
    const { userId, shippingAddress, paymentMethod, note } = orderData;

    // Validate shipping address
    if (
      !shippingAddress ||
      !shippingAddress.name ||
      !shippingAddress.phone ||
      !shippingAddress.address
    ) {
      throw new Error("Thông tin địa chỉ giao hàng không đầy đủ");
    }

    // Lấy cart và items từ user
    const cart = await CartService.getCartByUserId(userId);

    if (!cart || !cart.products || cart.products.length === 0) {
      throw new Error("Giỏ hàng trống");
    }

    // Convert cart items to order products format
    const products = cart.products.map((item) => ({
      product_id: item.product_id._id,
      name: item.product_id.name,
      price: item.price || item.product_id.discount_price || item.product_id.price,
      quantity: item.quantity,
      image: item.product_id.main_image,
    }));

    // Tính subtotal và total
    const subtotal = products.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
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
      status: "pending",
      payment_status: "pending",
    });

    const savedOrder = await order.save();

    // Cập nhật stock cho các sản phẩm
    for (const item of products) {
      const productId = item.product_id || item.productId;
      await ProductService.updateProductStock(
        productId,
        item.quantity,
        "decrease"
      );
    }

    // Xóa giỏ hàng sau khi tạo đơn hàng thành công
    await CartService.clearCart(userId);

    const populatedOrder = await Order.findById(savedOrder._id)
      .populate("products.product_id")
      .populate("user_id", "name email phone_number");

    // Tạo thông báo (không throw error nếu fail)
    try {
      // Lấy thông tin user để kiểm tra role
      const User = (await import("../models/user.model.js")).default;
      const user = await User.findById(userId).select("role");
      const isAdmin = user?.role === "admin";

      // Thông báo cho khách hàng (client hoặc admin đều nhận)
      await NotificationService.createOrderNotification(
        userId,
        savedOrder._id,
        "order_created",
        {
          orderId: savedOrder.orderId,
          total: savedOrder.total,
        }
      );
      
      // Chỉ tạo thông báo cho admin khi KHÁCH HÀNG (không phải admin) đặt hàng
      if (!isAdmin) {
        await NotificationService.createAdminNotification(
          savedOrder._id,
          "order_created",
          {
            orderId: savedOrder.orderId,
            total: savedOrder.total,
            customerName: shippingAddress.name,
          }
        );
        console.log("✅ Admin notification created for customer order:", savedOrder.orderId);
      } else {
        console.log("ℹ️ Skipped admin notification (order by admin):", savedOrder.orderId);
      }
      
      console.log("✅ Notifications created for order:", savedOrder.orderId);
    } catch (notifError) {
      console.error("❌ Error creating notification:", notifError);
      // Don't throw - order creation should succeed even if notification fails
    }

    return populatedOrder;
  }

  // Tạo đơn hàng trực tiếp (mua ngay)
  static async createDirectOrder(userId, orderData) {
    // Validate orderData
    if (!orderData || typeof orderData !== "object") {
      throw new Error("Dữ liệu đơn hàng không hợp lệ");
    }

    const { items, shippingAddress, paymentMethod, note } = orderData;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Danh sách sản phẩm không hợp lệ");
    }

    return await this.createOrder(userId, {
      items,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      note,
    });
  }

  // Cập nhật thông tin đơn hàng
  static async updateOrderInfo(orderId, userId, updateData) {
    const order = await Order.findById(orderId);

    if (!order || order.user_id.toString() !== userId.toString()) {
      return null;
    }

    // Chỉ cho phép cập nhật một số trường và khi đơn hàng còn pending
    if (order.status !== "pending") {
      throw new Error("Chỉ có thể cập nhật đơn hàng ở trạng thái chờ xử lý");
    }

    const allowedFields = ["shipping_address", "note"];
    const filteredData = {};

    allowedFields.forEach((field) => {
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
      return { success: false, reason: "NOT_FOUND" };
    }

    if (order.user_id.toString() !== userId.toString()) {
      return { success: false, reason: "UNAUTHORIZED" };
    }

    if (order.payment_status === "paid") {
      return { success: false, reason: "ALREADY_PAID" };
    }

    // Cập nhật trạng thái thanh toán
    order.payment_status = "paid";
    order.paid_at = new Date();

    if (paymentData) {
      order.payment_info = paymentData;
    }

    // Tự động chuyển trạng thái đơn hàng sang confirmed
    if (order.status === "pending") {
      order.status = "confirmed";
    }

    await order.save();

    // Tạo thông báo thanh toán thành công
    try {
      // Thông báo cho khách hàng
      await NotificationService.createOrderNotification(
        order.user_id,
        order._id,
        "payment_success",
        {
          orderId: order.orderId,
          total: order.total,
        }
      );

      // Thông báo cho admin
      await NotificationService.createAdminNotification(
        order._id,
        "payment_success",
        {
          orderId: order.orderId,
          total: order.total,
          customerName: order.shipping_address?.name,
        }
      );
    } catch (notifError) {
      console.error("❌ Error creating payment notification:", notifError);
    }

    return { success: true, order };
  }

  // Xóa đơn hàng (Admin only)
  static async deleteOrder(orderId) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    // Chỉ cho phép xóa đơn hàng đã hủy hoặc chờ xác nhận
    if (!["cancelled", "pending"].includes(order.status)) {
      throw new Error("Chỉ có thể xóa đơn hàng ở trạng thái 'Chờ xác nhận' hoặc 'Đã hủy'");
    }

    // Nếu đơn hàng chưa bị hủy, hoàn trả stock
    if (order.status !== "cancelled") {
      for (const item of order.products) {
        const productId = item.product_id || item.productId;
        await ProductService.updateProductStock(
          productId,
          item.quantity,
          "increase"
        );
      }
    }

    // Xóa đơn hàng
    await Order.findByIdAndDelete(orderId);
    
    return { success: true, message: "Xóa đơn hàng thành công" };
  }

  // Helper method để get status description
  static getStatusDescription(status) {
    const statusMap = {
      "pending": "Chờ xử lý",
      "payment_pending": "Chờ thanh toán", 
      "payment_failed": "Thanh toán thất bại",
      "confirmed": "Đã xác nhận",
      "processing": "Đang chuẩn bị hàng",
      "ready_to_ship": "Sẵn sàng giao hàng", 
      "shipping": "Đang giao hàng",
      "delivered": "Đã giao thành công",
      "cancelled": "Đã hủy",
      "returned": "Đã trả hàng",
    };
    
    return statusMap[status] || status;
  }

  // Helper method để get payment status description  
  static getPaymentStatusDescription(status) {
    const statusMap = {
      "pending": "Chờ thanh toán",
      "completed": "Đã thanh toán", 
      "failed": "Thanh toán thất bại",
      "refunded": "Đã hoàn tiền",
    };
    
    return statusMap[status] || status;
  }
}
