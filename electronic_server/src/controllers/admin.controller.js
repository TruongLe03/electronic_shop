import User from "../models/user.model.js";
import Product from "../models/products.model.js";
import Order from "../models/orders.model.js";
import Inventory from "../models/inventory.model.js";
import mongoose from "mongoose";

// ===== DASHBOARD STATS =====
export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, revenueResult] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $in: ["delivered", "completed"] } } },
        { $group: { _id: null, totalRevenue: { $sum: "$total" } } }
      ])
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics",
      error: error.message
    });
  }
};

export const getRecentOrders = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const orders = await Order.find()
      .populate('user_id', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('_id user_id total status createdAt');

    const formattedOrders = orders.map(order => ({
      id: order._id,
      customer: order.user_id?.name || 'Unknown',
      amount: order.total,
      status: order.status,
      createdAt: order.createdAt
    }));

    res.json({
      success: true,
      data: formattedOrders
    });
  } catch (error) {
    console.error('Error getting recent orders:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching recent orders",
      error: error.message
    });
  }
};

export const getRecentUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const users = await User.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name email status createdAt');

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error getting recent users:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching recent users",
      error: error.message
    });
  }
};

// ===== USER MANAGEMENT =====
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    
    // Search filter
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { username: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Role filter
    if (req.query.role) {
      query.role = req.query.role;
    }
    
    // Status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    const [users, totalItems] = await Promise.all([
      User.find(query)
        .select('-password -resetPasswordToken -resetPasswordExpires')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .select('-password -resetPasswordToken -resetPasswordExpires');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message
    });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['active', 'inactive', 'suspended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { status, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "User status updated successfully",
      data: user
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: "Error updating user status",
      error: error.message
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    const validRoles = ['admin', 'customer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role"
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "User role updated successfully",
      data: user
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: "Error updating user role",
      error: error.message
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Prevent deleting self
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account"
      });
    }

    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message
    });
  }
};

// ===== ORDER MANAGEMENT =====
export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    
    // Status filter
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Payment status filter
    if (req.query.paymentStatus) {
      query.payment_status = req.query.paymentStatus;
    }
    
    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) {
        query.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    const [orders, totalItems] = await Promise.all([
      Order.find(query)
        .populate('user_id', 'name email phone_number')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate('user_id', 'name email phone_number');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status, updatedAt: new Date() },
      { new: true }
    ).populate('user_id', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      message: "Order status updated successfully",
      data: order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: "Error updating order status",
      error: error.message
    });
  }
};

// ===== ANALYTICS =====
export const getSalesAnalytics = async (req, res) => {
  try {
    const period = req.query.period || '30d';
    let startDate = new Date();
    
    // Calculate start date based on period
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    const analytics = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['delivered', 'completed'] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          totalSales: { $sum: '$total' },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: '$total' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error getting sales analytics:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching sales analytics",
      error: error.message
    });
  }
};

export const getUsersAnalytics = async (req, res) => {
  try {
    const period = req.query.period || '30d';
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    const analytics = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          newUsers: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error getting users analytics:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching users analytics",
      error: error.message
    });
  }
};

export const getProductsAnalytics = async (req, res) => {
  try {
    const period = req.query.period || '30d';
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Top selling products
    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['delivered', 'completed'] }
        }
      },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.product_id',
          name: { $first: '$products.name' },
          totalSold: { $sum: '$products.quantity' },
          totalRevenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        topProducts
      }
    });
  } catch (error) {
    console.error('Error getting products analytics:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching products analytics",
      error: error.message
    });
  }
};