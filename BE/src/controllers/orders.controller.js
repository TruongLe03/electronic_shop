import Order from "../models/orders.model.js";
import Product from "../models/products.model.js";
import Inventory from "../models/inventory.model.js";
import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

// Helper function to update user profile with shipping info
const updateUserProfileFromOrder = async (userId, shippingAddress) => {
  try {
    console.log('Updating user profile with shipping address:', shippingAddress);
    
    const updateData = {};
    
    // Update name if provided and different
    if (shippingAddress.name) {
      updateData.name = shippingAddress.name;
      updateData.username = shippingAddress.name; // Also update username for compatibility
    }
    
    // Update phone if provided and different
    if (shippingAddress.phone) {
      updateData.phone_number = shippingAddress.phone;
      updateData.phone = shippingAddress.phone; // Update both phone fields for compatibility
    }
    
    // Update address if provided and different
    if (shippingAddress.address) {
      updateData.address = shippingAddress.address;
    }
    
    // Add update timestamp
    updateData.updatedAt = new Date();
    
    // Only update if there's data to update
    if (Object.keys(updateData).length > 1) { // More than just updatedAt
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, { 
        new: true, 
        runValidators: true 
      });
      console.log('User profile updated successfully with:', updateData);
      return updatedUser;
    } else {
      console.log('No user profile updates needed');
      return null;
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    // Don't throw error - this is not critical for order creation
    return null;
  }
};

// Helper function to create simple order
const createSimpleOrder = async (userId, items, shippingAddress = {}) => {
  try {
    console.log('=== CREATE SIMPLE ORDER START ===');
    console.log('User ID:', userId);
    console.log('Items:', items);
    console.log('Shipping address:', shippingAddress);
    
    let subtotal = 0;
    const orderProducts = [];

    // Process each item
    console.log('Processing items...');
    for (const item of items) {
      console.log('Processing item:', item);
      const product = await Product.findById(item.productId);
      if (!product) {
        console.log('ERROR: Product not found:', item.productId);
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      console.log('Product found:', product.name, 'Stock:', product.stock);

      // Check stock
      if (product.stock < item.quantity) {
        console.log('ERROR: Insufficient stock');
        throw new Error(
          `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        );
      }

      // Validate price - ensure price is a valid number
      const originalPrice = parseFloat(product.price) || 0;
      const sellingPrice = product.discount_price ? parseFloat(product.discount_price) : originalPrice;
      
      if (originalPrice <= 0) {
        console.log('ERROR: Invalid original price for product:', product.name, 'Price:', product.price);
        throw new Error(`Invalid price for product ${product.name}`);
      }

      const itemSubtotal = sellingPrice * item.quantity;
      subtotal += itemSubtotal;
      console.log('Item subtotal:', itemSubtotal, 'Running total:', subtotal);

      const imageUrl = product.images && product.images.length > 0 ? product.images[0] : null;
      console.log('Product image for order item:', imageUrl);

      orderProducts.push({
        product_id: product._id,  // Changed from productId to product_id
        quantity: item.quantity,
        price: sellingPrice,
        name: product.name,
        image: imageUrl,  // Add image field
        // Note: Removed fields not in new schema
      });
    }

    // Calculate totals
    const shippingFee = 30000; // Fixed shipping fee: 30,000 VND
    const totalAmount = subtotal + shippingFee;
    
    // Validate totals
    if (isNaN(subtotal) || isNaN(totalAmount)) {
      console.log('ERROR: Invalid calculation - Subtotal:', subtotal, 'Total:', totalAmount);
      throw new Error('Invalid price calculation');
    }
    
    console.log('Totals calculated - Subtotal:', subtotal, 'Shipping:', shippingFee, 'Total:', totalAmount);

    // Create order data
    const orderData = {
      user_id: userId,
      products: orderProducts,
      subtotal: subtotal,
      shipping_fee: shippingFee,
      total: totalAmount, // Use 'total' to match model
      shipping_address: { // Use 'shipping_address' to match model
        name: shippingAddress.name,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
      },
      payment_method: "COD", // Keep uppercase to match enum
      payment_status: "pending",
      status: "pending",
      notes: shippingAddress.note || (
        orderProducts.length === 1
          ? `Direct purchase: ${orderProducts[0].name}`
          : "Cart purchase"
      ),
      createdAt: new Date(),
    };
    console.log('Order data prepared:', JSON.stringify(orderData, null, 2));

    // Create and save order
    console.log('Creating order document...');
    const order = new Order(orderData);
    const savedOrder = await order.save();
    console.log('Order saved with ID:', savedOrder._id);

    // Populate user info
    console.log('Populating user info...');
    const populatedOrder = await Order.findById(savedOrder._id).populate(
      "user_id",
      "full_name email phone"
    );
    console.log('Order populated successfully');

    // Update user profile with shipping address from order
    await updateUserProfileFromOrder(userId, shippingAddress);

    return {
      success: true,
      message: "Order created successfully",
      data: populatedOrder,
    };
  } catch (error) {
    console.log('ERROR in createSimpleOrder:', error);
    return {
      success: false,
      message: "Failed to create order",
      error: error.message,
    };
  }
};

// Create new order with inventory check
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode, notes } =
      req.body;
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items are required",
      });
    }

    const result = await createSimpleOrder(userId, items, shippingAddress);

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;  // Changed from id to orderId
    console.log('Fetching order with ID:', orderId);
    
    const order = await Order.findById(orderId).populate(
      "user_id",
      "full_name email phone"
    );

    if (!order) {
      console.log('Order not found:', orderId);
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    console.log('Order found:', order._id);
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.log('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message,
    });
  }
};

// Get user orders
export const getUserOrders = async (req, res) => {
  try {
    console.log('=== GET USER ORDERS START ===');
    console.log('Request user:', req.user);
    
    const userId = req.user?.id || req.user?._id;
    console.log('User ID:', userId);

    if (!userId) {
      console.log('ERROR: No user ID found');
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    console.log('Fetching orders for user:', userId);
    const orders = await Order.find({ user_id: userId })
      .populate("user_id", "name email phone_number")
      .sort({ createdAt: -1 });

    console.log('Orders found:', orders.length);
    console.log('Orders data:', orders);

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Error in getUserOrders:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching user orders",
      error: error.message,
    });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id || req.user?._id;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if user owns this order
    if (order.user_id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to cancel this order",
      });
    }

    // Check if order can be cancelled
    if (!["pending", "confirmed"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled at this stage",
      });
    }

    order.status = "cancelled";
    order.updatedAt = new Date();
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error cancelling order",
      error: error.message,
    });
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipping",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;
    order.updatedAt = new Date();
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating order status",
      error: error.message,
    });
  }
};

// Get order statistics (admin)
export const getOrderStatistics = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const confirmedOrders = await Order.countDocuments({ status: "confirmed" });
    const shippingOrders = await Order.countDocuments({ status: "shipping" });
    const deliveredOrders = await Order.countDocuments({ status: "delivered" });
    const cancelledOrders = await Order.countDocuments({ status: "cancelled" });

    // Calculate total revenue from delivered orders
    const revenueResult = await Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
    ]);

    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Recent orders
    const recentOrders = await Order.find()
      .populate("user_id", "full_name email")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        shippingOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
        recentOrders,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching order statistics",
      error: error.message,
    });
  }
};

// Create direct order (buy now)
export const createDirectOrder = async (req, res) => {
  try {
    console.log('=== CREATE DIRECT ORDER START ===');
    console.log('Request body:', req.body);
    console.log('Request user:', req.user);
    
    if (!req.user) {
      console.log('ERROR: No user found in request');
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const userId = req.user?.id || req.user?._id;
    console.log('User ID:', userId);

    if (!userId) {
      console.log('ERROR: User ID not found');
      return res.status(401).json({
        success: false,
        message: "User ID not found",
      });
    }

    const { productId, name, price, discount_price, image, quantity = 1, shipping_info, payment_method } = req.body;
    console.log('Product info received:', { productId, name, price, discount_price, image, quantity });
    console.log('Shipping info received:', shipping_info);
    console.log('Payment method received:', payment_method);

    if (!productId) {
      console.log('ERROR: Product ID missing');
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    if (!name || !price) {
      console.log('ERROR: Product name or price missing');
      return res.status(400).json({
        success: false,
        message: "Product name and price are required",
      });
    }

    if (!shipping_info || !shipping_info.name || !shipping_info.phone || !shipping_info.address) {
      console.log('ERROR: Shipping info missing');
      return res.status(400).json({
        success: false,
        message: "Shipping information is required",
      });
    }

    // Verify product exists (optional - for security)
    console.log('Verifying product exists...');
    const product = await Product.findById(productId);
    if (!product) {
      console.log('ERROR: Product not found in database');
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    console.log('Product verified:', product.name);
    console.log('Product images from DB:', product.images);
    console.log('Image from frontend:', image);

    // Use data from frontend instead of querying database
    const originalPrice = parseFloat(price) || 0;
    const sellingPrice = discount_price ? parseFloat(discount_price) : originalPrice;
    
    if (originalPrice <= 0) {
      console.log('ERROR: Invalid price from frontend:', price);
      return res.status(400).json({
        success: false,
        message: "Invalid price",
      });
    }

    // Create order item using frontend data + fallback to DB image
    const finalImage = image || (product.images && product.images.length > 0 ? product.images[0] : null);
    console.log('Final image to save:', finalImage);
    
    const orderItem = {
      product_id: productId,
      name: name,
      price: sellingPrice,
      quantity: quantity,
      image: finalImage,
      sku: product.sku || ''
    };
    console.log('Order item prepared:', orderItem);

    // Calculate totals
    const subtotal = sellingPrice * quantity;
    const shippingFee = 30000;
    const totalAmount = subtotal + shippingFee;
    
    console.log('Totals calculated - Subtotal:', subtotal, 'Shipping:', shippingFee, 'Total:', totalAmount);

    // Create order data
    const orderData = {
      user_id: userId,
      products: [orderItem],
      subtotal: subtotal,
      shipping_fee: shippingFee,
      total: totalAmount, // Use 'total' to match model
      shipping_address: { // Use 'shipping_address' to match model
        name: shipping_info.name,
        phone: shipping_info.phone,
        address: shipping_info.address,
      },
      payment_method: (payment_method || "cod").toUpperCase(), // Convert to uppercase to match enum
      payment_status: "pending",
      status: "pending",
      notes: shipping_info.note || `Direct purchase: ${name}`,
      createdAt: new Date(),
    };
    console.log('Order data prepared:', JSON.stringify(orderData, null, 2));

    // Create and save order
    console.log('Creating order document...');
    const order = new Order(orderData);
    const savedOrder = await order.save();
    console.log('Order saved with ID:', savedOrder._id);

    // Populate user info
    console.log('Populating user info...');
    const populatedOrder = await Order.findById(savedOrder._id).populate(
      "user_id",
      "full_name email phone"
    );
    console.log('Order populated successfully');

    // Update user profile with shipping address from order
    await updateUserProfileFromOrder(userId, {
      name: shipping_info.name,
      phone: shipping_info.phone,
      address: shipping_info.address
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: populatedOrder,
    });
  } catch (error) {
    console.log('ERROR in createDirectOrder:', error);
    res.status(500).json({
      success: false,
      message: "Error creating direct order",
      error: error.message,
    });
  }
};

// Create order from cart
export const createOrderFromCart = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const { shipping_info, payment_method, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    if (!shipping_info || !shipping_info.name || !shipping_info.phone || !shipping_info.address) {
      return res.status(400).json({
        success: false,
        message: "Shipping information is required",
      });
    }

    // Format shipping address object with real data
    const shippingAddress = {
      name: shipping_info.name,
      phone: shipping_info.phone,
      email: shipping_info.email || '',
      address: shipping_info.address,
      note: shipping_info.note || ''
    };

    const result = await createSimpleOrder(userId, items, shippingAddress);

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating order from cart",
      error: error.message,
    });
  }
};

// Update order information
export const updateOrderInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { shipping_info, payment_method } = req.body;
    const userId = req.user?.id || req.user?._id;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if user owns this order
    if (order.user_id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this order",
      });
    }

    // Update fields
    if (shipping_info) {
      order.shipping_address = {
        name: shipping_info.name,
        phone: shipping_info.phone,
        address: shipping_info.address,
        email: shipping_info.email || ''
      };
      if (shipping_info.note) {
        order.notes = shipping_info.note;
      }
    }

    if (payment_method) {
      order.payment_method = payment_method;
    }

    order.updatedAt = new Date();
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating order",
      error: error.message,
    });
  }
};

// Confirm payment
export const confirmPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method } = req.body;
    const userId = req.user?.id || req.user?._id;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if user owns this order
    if (order.user_id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to confirm this order",
      });
    }

    // Update order status based on payment method
    if (payment_method === "cod") {
      order.status = "confirmed";
      order.payment_status = "cod";
    } else {
      order.payment_status = "paid";
      order.status = "confirmed";
    }

    order.updatedAt = new Date();
    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment confirmed successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error confirming payment",
      error: error.message,
    });
  }
};
