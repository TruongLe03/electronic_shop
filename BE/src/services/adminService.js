import User from "../models/user.model.js";
import Product from "../models/products.model.js";
import Order from "../models/orders.model.js";
import Category from "../models/categories.model.js";

/**
 * Service để tính toán các thống kê cho admin dashboard
 */
export class AdminAnalyticsService {
  /**
   * Lấy thống kê tổng quan cho dashboard - Use AdminReportService for consistency
   */
  static async getDashboardStats() {
    return await AdminReportService.getDashboardStats();
  }

  /**
   * Lấy thông tin hệ thống
   */
  static async getSystemInfo() {
    return {
      server: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      },
      database: {
        connected: true, // Có thể thêm logic check database connection
      },
      api: {
        version: "1.0.0",
        lastDeployment: new Date().toISOString(),
      },
    };
  }

  /**
   * Lấy thống kê tăng trưởng so với tháng trước
   */
  static async getGrowthStats() {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Thống kê tháng này
    const [usersThisMonth, ordersThisMonth, revenueThisMonth] =
      await Promise.all([
        User.countDocuments({
          createdAt: { $gte: startOfThisMonth },
          role: "customer",
        }),
        Order.countDocuments({
          createdAt: { $gte: startOfThisMonth },
        }),
        Order.aggregate([
          {
            $match: {
              createdAt: { $gte: startOfThisMonth },
              status: "completed",
            },
          },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
      ]);

    // Thống kê tháng trước
    const [usersLastMonth, ordersLastMonth, revenueLastMonth] =
      await Promise.all([
        User.countDocuments({
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          role: "customer",
        }),
        Order.countDocuments({
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        }),
        Order.aggregate([
          {
            $match: {
              createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
              status: "completed",
            },
          },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
      ]);

    // Tính phần trăm tăng trưởng
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      users: {
        current: usersThisMonth,
        previous: usersLastMonth,
        growth: calculateGrowth(usersThisMonth, usersLastMonth),
      },
      orders: {
        current: ordersThisMonth,
        previous: ordersLastMonth,
        growth: calculateGrowth(ordersThisMonth, ordersLastMonth),
      },
      revenue: {
        current: revenueThisMonth[0]?.total || 0,
        previous: revenueLastMonth[0]?.total || 0,
        growth: calculateGrowth(
          revenueThisMonth[0]?.total || 0,
          revenueLastMonth[0]?.total || 0
        ),
      },
    };
  }

  /**
   * Lấy thống kê sản phẩm theo danh mục
   */
  static async getProductsByCategory() {
    return await Product.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category._id",
          categoryName: { $first: "$category.name" },
          totalProducts: { $sum: 1 },
          activeProducts: {
            $sum: {
              $cond: [{ $eq: ["$status", "active"] }, 1, 0],
            },
          },
        },
      },
      { $sort: { totalProducts: -1 } },
    ]);
  }

  /**
   * Lấy thống kê đơn hàng theo ngày trong tuần
   */
  static async getOrdersByDayOfWeek() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, "$totalAmount", 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  /**
   * Lấy danh sách khách hàng VIP (top spenders)
   */
  static async getVIPCustomers(limit = 10) {
    return await Order.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: "$userId",
          totalSpent: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$totalAmount" },
          lastOrderDate: { $max: "$createdAt" },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          totalSpent: 1,
          totalOrders: 1,
          avgOrderValue: 1,
          lastOrderDate: 1,
          "user.name": 1,
          "user.email": 1,
          "user.phone_number": 1,
        },
      },
    ]);
  }

  /**
   * Lấy dữ liệu biểu đồ doanh thu
   */
  static async getRevenueChartData(period = "month") {
    let monthsCount;

    // Xác định khoảng thời gian
    switch (period) {
      case "week":
        monthsCount = 7;
        break;
      case "quarter":
        monthsCount = 3;
        break;
      case "year":
        monthsCount = 12;
        break;
      case "month":
      default:
        monthsCount = 7;
        break;
    }

    // Tính startDate dựa trên monthsCount
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - monthsCount + 1, 1);

    // Lấy dữ liệu doanh thu từ đơn hàng đã hoàn thành hoặc đã giao
    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ["completed", "delivered"] },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Tạo mảng đầy đủ các tháng
    const chartData = [];
    const currentDate = new Date();
    
    for (let i = monthsCount - 1; i >= 0; i--) {
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth() + 1;
      
      // Tìm dữ liệu tương ứng
      const dataPoint = revenueData.find(
        (d) => d._id.year === year && d._id.month === month
      );
      
      chartData.push({
        month: `${month}/${year}`,
        revenue: dataPoint ? Number(dataPoint.revenue) || 0 : 0,
        orders: dataPoint ? Number(dataPoint.orders) || 0 : 0,
      });
    }

    return chartData;
  }

  /**
   * Lấy sản phẩm cần nhập thêm (low stock)
   */
  static async getLowStockProducts(threshold = 10) {
    return await Product.aggregate([
      {
        $lookup: {
          from: "inventories",
          localField: "_id",
          foreignField: "productId",
          as: "inventory",
        },
      },
      { $unwind: { path: "$inventory", preserveNullAndEmptyArrays: true } },
      {
        $match: {
          $or: [
            { "inventory.quantity": { $lt: threshold } },
            { inventory: { $exists: false } },
          ],
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $project: {
          name: 1,
          images: 1,
          price: 1,
          "category.name": 1,
          quantity: { $ifNull: ["$inventory.quantity", 0] },
          status: 1,
        },
      },
      { $sort: { quantity: 1 } },
    ]);
  }

  /**
   * Lấy thống kê review và rating trung bình
   */
  static async getReviewStats() {
    // Giả sử có collection reviews (chưa có trong model hiện tại)
    // Tạm thời return empty stats
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      },
    };
  }
}

/**
 * Service để xuất báo cáo admin
 */
export class AdminReportService {
  /**
   * Tạo báo cáo doanh thu theo khoảng thời gian
   */
  static async generateRevenueReport(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: "completed",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    const totalRevenue = revenueData.reduce(
      (sum, item) => sum + item.revenue,
      0
    );
    const totalOrders = revenueData.reduce((sum, item) => sum + item.orders, 0);

    return {
      period: { startDate, endDate },
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      },
      dailyData: revenueData,
    };
  }

  /**
   * Tạo báo cáo sản phẩm bán chạy
   */
  static async generateProductReport(limit = 20) {
    return await Order.aggregate([
      { $match: { status: "completed" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
          avgPrice: { $avg: "$items.price" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
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
        $lookup: {
          from: "categories",
          localField: "product.categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          totalRevenue: 1,
          avgPrice: 1,
          "product.name": 1,
          "product.images": 1,
          "category.name": 1,
        },
      },
    ]);
  }

  /**
   * Lấy thống kê dashboard tổng quan
   */
  static async getDashboardStats() {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalCategories,
      totalRevenue,
      ordersByStatus,
      topProducts,
      monthlyRevenue,
    ] = await Promise.all([
      // Thống kê tổng số
      User.countDocuments({ role: "customer" }),
      Product.countDocuments(),
      Order.countDocuments(),
      Category.countDocuments(),

      // Thống kê doanh thu (từ đơn hàng đã hoàn thành hoặc đã giao)
      Order.aggregate([
        { $match: { status: { $in: ["completed", "delivered"] } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),

      // Thống kê đơn hàng theo trạng thái
      Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      // Sản phẩm bán chạy nhất (top 5)
      Order.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            totalSold: { $sum: "$items.quantity" },
            revenue: {
              $sum: { $multiply: ["$items.quantity", "$items.price"] },
            },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
      ]),

      // Doanh thu theo tháng (12 tháng gần nhất)
      Order.aggregate([
        {
          $match: {
            status: { $in: ["completed", "delivered"] },
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            revenue: { $sum: "$totalAmount" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
    ]);

    return {
      overview: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalCategories,
        totalRevenue: Number(totalRevenue[0]?.total) || 0,
      },
      ordersByStatus,
      topProducts,
      monthlyRevenue,
    };
  }

  /**
   * Lấy thông tin hệ thống
   */
  static async getSystemInfo() {
    return {
      server: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: Math.floor(process.uptime()), // seconds
        memoryUsage: process.memoryUsage(),
      },
      database: {
        connected: true,
        // Có thể thêm thông tin MongoDB connection sau
      },
      api: {
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development",
        lastDeployment: new Date().toISOString(),
      },
    };
  }
}
