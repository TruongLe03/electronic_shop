import Order from '../models/orders.model.js';
import Product from '../models/products.model.js';

// Create new order
export const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      couponCode,
      notes
    } = req.body;

    // Validate items and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ 
          message: `Product with ID ${item.productId} not found` 
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for product ${product.name}` 
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
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
      notes
    });

    await order.save();

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        orderId: order.orderId,
        total: order.total,
        status: order.status,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({ orderId })
      .populate('items.productId', 'name description category')
      .populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Internal server error' });
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
      .select('orderId total status paymentStatus createdAt items');

    const total = await Order.countDocuments({ userId });

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, paymentStatus } = req.body;

    const updateData = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const order = await Order.findOneAndUpdate(
      { orderId },
      updateData,
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      message: 'Order updated successfully',
      order: {
        orderId: order.orderId,
        status: order.status,
        paymentStatus: order.paymentStatus,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (['processing', 'shipping', 'delivered'].includes(order.status)) {
      return res.status(400).json({ 
        message: 'Cannot cancel order in current status' 
      });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: item.quantity } }
      );
    }

    order.status = 'cancelled';
    order.notes = reason || 'Cancelled by customer';
    order.updatedAt = new Date();
    
    await order.save();

    res.json({
      message: 'Order cancelled successfully',
      orderId: order.orderId
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Helper functions
const calculateShippingFee = (province) => {
  const shippingRates = {
    'hanoi': 30000,
    'hcm': 35000,
    'danang': 40000
  };
  
  return shippingRates[province] || 50000; // Default fee
};

const applyCouponDiscount = async (couponCode, subtotal) => {
  // Mock coupon logic - replace with actual coupon system
  const coupons = {
    'WELCOME10': { type: 'percentage', value: 10, minOrder: 500000 },
    'SAVE50K': { type: 'fixed', value: 50000, minOrder: 1000000 }
  };

  const coupon = coupons[couponCode];
  if (!coupon || subtotal < coupon.minOrder) {
    return 0;
  }

  if (coupon.type === 'percentage') {
    return subtotal * (coupon.value / 100);
  } else {
    return coupon.value;
  }
};
