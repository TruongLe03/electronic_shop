import Order from "../models/orders.model.js";
import Product from "../models/products.model.js";
import Inventory from "../models/inventory.model.js";
import Payment from "../models/payment.model.js";
import mongoose from "mongoose";

// Create new order with inventory check
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, shippingAddress, paymentMethod, couponCode, notes } =
      req.body;

    // Validate items and check inventory
    let subtotal = 0;
    const orderItems = [];
    const stockChecks = [];

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: `Product with ID ${item.productId} not found`,
        });
      }

      // Check inventory availability
      const stockCheck = await Inventory.checkStock(product._id, item.quantity);
      if (!stockCheck.available) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: `Insufficient stock for product ${product.name}. Available: ${stockCheck.currentStock}, Requested: ${item.quantity}`,
        });
      }

      stockChecks.push({ productId: product._id, quantity: item.quantity });

      // Calculate pricing
      const currentPrice = product.discount_price || product.price;
      const originalPrice = product.price;
      const discountPercent = product.discount_percent || 0;
      const discountAmount = originalPrice - currentPrice;
      const itemSubtotal = currentPrice * item.quantity;

      subtotal += itemSubtotal;

      orderItems.push({
        productId: product._id,
        sku: product.sku,
        name: product.name,
        price: currentPrice,
        originalPrice: originalPrice,
        quantity: item.quantity,
        discountPercent: discountPercent,
        discountAmount: discountAmount * item.quantity,
        subtotal: itemSubtotal,
        image: product.images?.[0] || product.main_image,
      });
    }

    // Calculate fees
    const shippingFee = calculateShippingFee(shippingAddress.province);
    const tax = subtotal * 0.1; // 10% VAT
    let discount = 0;

    // Apply coupon if provided
    if (couponCode) {
      discount = await applyCouponDiscount(couponCode, subtotal);
    }

    // Create order
    const order = new Order({
      userId: req.user?.id, // If user is logged in
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingFee,
      tax,
      discount,
      couponCode,
      notes,
      statusHistory: [
        {
          status: "pending",
          updatedBy: req.user?.id,
          updatedAt: new Date(),
          notes: "Order created",
        },
      ],
    });

    await order.save({ session });

    // Reserve inventory for all items
    for (const stockCheck of stockChecks) {
      await Inventory.reserveStock(
        stockCheck.productId,
        stockCheck.quantity,
        order._id,
        req.user?.id
      );
    }

    // Create payment record if online payment
    let payment = null;
    if (paymentMethod !== "cod") {
      payment = new Payment({
        orderId: order._id,
        amount: order.total,
        method: paymentMethod,
        customerInfo: {
          name: shippingAddress.fullName,
          email: shippingAddress.email,
          phone: shippingAddress.phone,
        },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      await payment.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Order created successfully",
      order: {
        orderId: order.orderId,
        total: order.total,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentId: payment?.paymentId,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Create order error:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId })
      .populate("items.productId", "name description category")
      .populate("userId", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("orderId total status paymentStatus createdAt items");

    const total = await Order.countDocuments({ userId });

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (["processing", "shipping", "delivered"].includes(order.status)) {
      return res.status(400).json({
        message: "Cannot cancel order in current status",
      });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    order.status = "cancelled";
    order.notes = reason || "Cancelled by customer";
    order.updatedAt = new Date();

    await order.save();

    res.json({
      message: "Order cancelled successfully",
      orderId: order.orderId,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update order status (Admin only)
export const updateOrderStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId } = req.params;
    const { status, notes, trackingNumber } = req.body;

    const order = await Order.findOne({ orderId }).session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Order not found" });
    }

    const previousStatus = order.status;

    // Handle inventory based on status change
    if (status === "confirmed" && previousStatus === "pending") {
      // Convert reserved stock to sold
      for (const item of order.items) {
        await Inventory.confirmStockOut(
          item.productId,
          item.quantity,
          order._id,
          req.user?.id
        );
        // Update product sold count
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { sold: item.quantity } },
          { session }
        );
      }
    } else if (
      status === "cancelled" &&
      ["pending", "confirmed"].includes(previousStatus)
    ) {
      // Release reserved stock
      for (const item of order.items) {
        await Inventory.releaseStock(
          item.productId,
          item.quantity,
          order._id,
          req.user?.id
        );
      }
      order.cancelledAt = new Date();
      order.cancelledBy = req.user?.id;
      order.cancelReason = notes;
    }

    // Update order
    order.status = status;
    order.adminNotes = notes;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    // Add to status history
    order.statusHistory.push({
      status,
      updatedBy: req.user?.id,
      updatedAt: new Date(),
      notes,
    });

    await order.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.json({
      message: "Order status updated successfully",
      order: {
        orderId: order.orderId,
        status: order.status,
        trackingNumber: order.trackingNumber,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Update order status error:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get order statistics (Admin only)
export const getOrderStatistics = async (req, res) => {
  try {
    const { period = "30d" } = req.query;

    let dateFilter = {};
    const now = new Date();

    switch (period) {
      case "7d":
        dateFilter = {
          createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) },
        };
        break;
      case "30d":
        dateFilter = {
          createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) },
        };
        break;
      case "90d":
        dateFilter = {
          createdAt: { $gte: new Date(now - 90 * 24 * 60 * 60 * 1000) },
        };
        break;
    }

    const [statusStats, revenueStats, topProducts] = await Promise.all([
      // Order status statistics
      Order.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            total: { $sum: "$total" },
          },
        },
      ]),

      // Revenue by day
      Order.aggregate([
        {
          $match: {
            ...dateFilter,
            status: { $in: ["delivered", "confirmed"] },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$total" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Top selling products
      Order.aggregate([
        {
          $match: {
            ...dateFilter,
            status: { $in: ["delivered", "confirmed"] },
          },
        },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            name: { $first: "$items.name" },
            totalQuantity: { $sum: "$items.quantity" },
            totalRevenue: { $sum: "$items.subtotal" },
          },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 },
      ]),
    ]);

    res.json({
      statusStats,
      revenueStats,
      topProducts,
    });
  } catch (error) {
    console.error("Get order statistics error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Helper functions
const calculateShippingFee = (province) => {
  const shippingRates = {
    hanoi: 30000,
    hcm: 35000,
    danang: 40000,
  };

  return shippingRates[province?.toLowerCase()] || 50000; // Default fee
};

const applyCouponDiscount = async (couponCode, subtotal) => {
  // Mock coupon logic - replace with actual coupon system
  const coupons = {
    WELCOME10: { type: "percentage", value: 10, minOrder: 500000 },
    SAVE50K: { type: "fixed", value: 50000, minOrder: 1000000 },
  };

  const coupon = coupons[couponCode];
  if (!coupon || subtotal < coupon.minOrder) {
    return 0;
  }

  if (coupon.type === "percentage") {
    return subtotal * (coupon.value / 100);
  } else {
    return coupon.value;
  }
};

// Create order from cart
export const createOrderFromCart = async (req, res) => {
  try {
    const { Cart } = await import("../models/cart.model.js");
    
    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    // Convert cart items to order format
    const orderItems = cart.items.map(item => ({
      productId: item.product._id,
      quantity: item.quantity
    }));

    // Create order using simple method without transactions
    const orderResult = await createSimpleOrder({
      userId: req.user.id,
      items: orderItems,
      shippingAddress: req.body.shippingAddress || {},
      paymentMethod: req.body.paymentMethod || 'cod',
      notes: req.body.notes || ''
    });

    if (orderResult.success) {
      // Clear the cart after successful order creation
      await Cart.findOneAndUpdate(
        { user: req.user.id },
        { $set: { items: [] } }
      );

      res.status(201).json(orderResult);
    } else {
      res.status(400).json(orderResult);
    }
    
  } catch (error) {
    console.error("Error creating order from cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order from cart",
      error: error.message
    });
  }
};

// Create direct order (buy now)
export const createDirectOrder = async (req, res) => {
  try {
    console.log("=== CREATE DIRECT ORDER ===");
    console.log("req.user full object:", JSON.stringify(req.user, null, 2));
    console.log("req.user.id:", req.user?.id);
    console.log("req.user._id:", req.user?._id);
    console.log("Request body:", req.body);
    
    if (!req.user) {
      console.log("User not authenticated");
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

    // Try both id and _id fields
    const userId = req.user.id || req.user._id;
    console.log("Final userId to use:", userId);
    
    if (!userId) {
      console.log("User ID not found in req.user");
      return res.status(401).json({
        success: false,
        message: "User ID not found"
      });
    }
    
    // Test Order model first
    console.log("Testing Order model...");
    const testOrder = new Order({
      user_id: req.user.id, // Use actual user ID
      products: [{
        productId: new mongoose.Types.ObjectId(),
        sku: "TEST-SKU",
        name: "Test Product", 
        price: 100000,
        originalPrice: 100000,
        quantity: 1,
        subtotal: 100000,
        image: "test.jpg"
      }],
      subtotal: 100000,
      shipping_fee: 30000,
      tax: 10000,
      total: 140000,
      payment_method: 'COD',
      shipping_address: "Test shipping address", // Required field
      payment_status: 'pending',
      status: 'pending'
    });
    
    console.log("Validating test order...");
    await testOrder.validate();
    console.log("Test order validation passed!");
    
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      console.log("Missing productId");
      return res.status(400).json({
        success: false,
        message: "Product ID is required"
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      console.log("Product not found:", productId);
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    console.log("Product found:", product.name);

    // Create order using simple method without transactions
    const orderResult = await createSimpleOrder({
      userId: userId, // Use the extracted userId
      items: [{
        productId: productId,
        quantity: quantity
      }],
      shippingAddress: req.body.shippingAddress || {},
      paymentMethod: req.body.paymentMethod || 'cod',
      notes: req.body.notes || `Direct purchase: ${product.name}`
    });

    console.log("Order creation result:", orderResult.success);

    if (orderResult.success) {
      res.status(201).json(orderResult);
    } else {
      console.log("Order creation failed:", orderResult.message);
      res.status(400).json(orderResult);
    }
    
  } catch (error) {
    console.error("Error creating direct order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create direct order",
      error: error.message
    });
  }
};

// Simple order creation without transactions (for standalone MongoDB)
const createSimpleOrder = async ({ userId, items, shippingAddress, paymentMethod, notes }) => {
  try {
    console.log("=== CREATE SIMPLE ORDER ===");
    console.log("User ID:", userId);
    console.log("Items:", items);
    console.log("Shipping Address:", shippingAddress);
    
    // Validate items and check inventory
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      console.log("Processing item:", item.productId);
      const product = await Product.findById(item.productId);
      if (!product) {
        console.log("Product not found in createSimpleOrder:", item.productId);
        return {
          success: false,
          message: `Product with ID ${item.productId} not found`,
        };
      }

      console.log("Product found:", product.name, "Stock:", product.stock);

      // Simple stock check (without transactions)
      if (product.stock < item.quantity) {
        console.log("Insufficient stock:", product.stock, "requested:", item.quantity);
        return {
          success: false,
          message: `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
        };
      }

      // Calculate pricing
      const currentPrice = product.discount_price || product.price;
      const originalPrice = product.price;
      const discountPercent = product.discount_percent || 0;
      const discountAmount = originalPrice - currentPrice;
      const itemSubtotal = currentPrice * item.quantity;

      subtotal += itemSubtotal;

      orderItems.push({
        productId: product._id,
        quantity: item.quantity,
        price: currentPrice,
        originalPrice: originalPrice,
        discountPercent: discountPercent,
        discountAmount: discountAmount,
        subtotal: itemSubtotal,
        sku: product.sku,
        name: product.name,
        image: product.main_image,
      });

      // Update product stock
      await Product.findByIdAndUpdate(
        product._id,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Calculate totals
    const shippingFee = calculateShippingFee(shippingAddress?.province);
    const taxAmount = subtotal * 0.1; // 10% tax
    const totalAmount = subtotal + shippingFee + taxAmount;

    console.log("Order totals:", { subtotal, shippingFee, taxAmount, totalAmount });

    // Validate required fields
    if (!userId) {
      console.log("Missing userId");
      return {
        success: false,
        message: "User ID is required"
      };
    }

    // Create order data  
    const orderData = {
      user_id: userId || new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"), // Fallback ObjectId for testing
      products: orderItems,
      subtotal: subtotal,
      shipping_fee: shippingFee,
      total: totalAmount,
      shipping_address: shippingAddress?.address || shippingAddress?.fullName || "123 Test Address, Test City",
      payment_method: paymentMethod?.toUpperCase() || "COD",
      payment_status: "pending",
      status: "pending",
      notes: notes || "Direct order",
      createdAt: new Date(),
    };

    console.log("Final order data before save:", JSON.stringify(orderData, null, 2));
    
    // Validate that required fields are not empty
    if (!orderData.user_id) {
      console.error("user_id is missing!");
      return {
        success: false,
        message: "user_id is required"
      };
    }
    
    if (!orderData.shipping_address || orderData.shipping_address.trim() === "") {
      console.error("shipping_address is missing or empty!");
      return {
        success: false,
        message: "shipping_address is required"
      };
    }

    // Create order
    const newOrder = new Order(orderData);

    console.log("Attempting to save order...");
    let savedOrder;
    try {
      savedOrder = await newOrder.save();
      console.log("Order saved successfully:", savedOrder._id);
    } catch (saveError) {
      console.error("Order save error details:");
      console.error("Error name:", saveError.name);
      console.error("Error message:", saveError.message);
      
      if (saveError.errors) {
        console.error("Validation errors:");
        Object.keys(saveError.errors).forEach(field => {
          console.error(`- ${field}: ${saveError.errors[field].message}`);
        });
      }
      
      // Log the data that failed validation
      console.error("Order data that failed:", JSON.stringify(orderData, null, 2));
      
      return {
        success: false,
        message: "Order validation failed",
        error: saveError.message,
        validationErrors: saveError.errors
      };
    }
    
    // Populate the order for return
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate("user_id", "name email");

    console.log("Order populated successfully");

    return {
      success: true,
      message: "Order created successfully",
      data: populatedOrder,
    };

  } catch (error) {
    console.error("Error in createSimpleOrder:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    if (error.errors) {
      console.error("Validation errors:", error.errors);
    }
    return {
      success: false,
      message: "Failed to create order",
      error: error.message,
    };
  }
};
