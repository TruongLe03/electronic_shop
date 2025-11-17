import Order from "../models/orders.model.js";
import Product from "../models/products.model.js";
import Category from "../models/categories.model.js";
import User from "../models/user.model.js";

/**
 * Service để xuất các loại báo cáo theo thời gian
 */
export class ReportService {
  /**
   * Tính toán khoảng thời gian dựa trên loại thời gian
   */
  static calculateDateRange(timeRange, customStartDate = null, customEndDate = null) {
    const now = new Date();
    let startDate, endDate;

    switch (timeRange) {
      case "day":
        // Hôm nay
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;

      case "week":
        // 7 ngày gần nhất
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        endDate = now;
        break;

      case "month":
        // Tháng này
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;

      case "quarter":
        // Quý này
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        endDate = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0, 23, 59, 59);
        break;

      case "year":
        // Năm này
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        break;

      case "custom":
        // Tùy chỉnh
        if (!customStartDate || !customEndDate) {
          throw new Error("Custom date range requires startDate and endDate");
        }
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        endDate.setHours(23, 59, 59, 999);
        break;

      default:
        // Mặc định: tháng này
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    return { startDate, endDate };
  }

  /**
   * Báo cáo doanh thu
   */
  static async generateRevenueReport(timeRange, customStartDate, customEndDate) {
    const { startDate, endDate } = this.calculateDateRange(
      timeRange,
      customStartDate,
      customEndDate
    );

    // Thống kê tổng quan
    const [totalRevenue, totalOrders, completedOrders, cancelledOrders] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: { $in: ["completed", "delivered"] },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),

      Order.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
      }),

      Order.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: ["completed", "delivered"] },
      }),

      Order.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
        status: "cancelled",
      }),
    ]);

    // Doanh thu theo ngày
    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ["completed", "delivered"] },
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

    // Doanh thu theo phương thức thanh toán
    const revenueByPaymentMethod = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ["completed", "delivered"] },
        },
      },
      {
        $lookup: {
          from: "payments",
          localField: "_id",
          foreignField: "orderId",
          as: "payment",
        },
      },
      { $unwind: { path: "$payment", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$payment.method",
          revenue: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const avgOrderValue =
      completedOrders > 0 ? (totalRevenue[0]?.total || 0) / completedOrders : 0;

    // Lấy chi tiết sản phẩm đã bán
    const productDetails = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ["completed", "delivered"] },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
          avgPrice: { $avg: "$items.price" },
          orderCount: { $sum: 1 },
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
        $lookup: {
          from: "categories",
          localField: "product.category_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          productId: "$_id",
          name: "$product.name",
          sku: "$product.sku",
          description: "$product.description",
          images: "$product.images",
          price: "$product.price",
          stock: "$product.stock",
          category: "$category.name",
          totalQuantity: 1,
          totalRevenue: 1,
          avgPrice: 1,
          orderCount: 1,
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    return {
      period: {
        timeRange,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      summary: {
        totalRevenue: totalRevenue[0]?.total || 0,
        totalOrders,
        completedOrders,
        cancelledOrders,
        avgOrderValue,
        completionRate:
          totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(2) : 0,
      },
      dailyRevenue: dailyRevenue.map((item) => ({
        date: `${item._id.day}/${item._id.month}/${item._id.year}`,
        revenue: item.revenue,
        orders: item.orders,
      })),
      revenueByPaymentMethod: revenueByPaymentMethod.map((item) => ({
        method: item._id || "Unknown",
        revenue: item.revenue,
        count: item.count,
      })),
      products: productDetails,
    };
  }

  /**
   * Báo cáo tồn kho
   */
  static async generateInventoryReport(timeRange, customStartDate, customEndDate) {
    const { startDate, endDate } = this.calculateDateRange(
      timeRange,
      customStartDate,
      customEndDate
    );

    // Lấy tất cả sản phẩm với thông tin category
    const products = await Product.find()
      .populate("category_id", "name")
      .select("name sku price stock status category_id images")
      .lean();

    // Thống kê tổng quan
    const totalProducts = products.length;
    const inStock = products.filter((p) => p.stock > 5).length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price || 0) * (p.stock || 0), 0);

    // Thống kê theo danh mục
    const categoryStats = {};
    products.forEach((p) => {
      const categoryName = p.category_id?.name || "Chưa phân loại";
      if (!categoryStats[categoryName]) {
        categoryStats[categoryName] = {
          name: categoryName,
          totalProducts: 0,
          inStock: 0,
          lowStock: 0,
          outOfStock: 0,
          totalValue: 0,
        };
      }

      categoryStats[categoryName].totalProducts++;
      categoryStats[categoryName].totalValue += (p.price || 0) * (p.stock || 0);

      if (p.stock > 5) categoryStats[categoryName].inStock++;
      else if (p.stock > 0) categoryStats[categoryName].lowStock++;
      else categoryStats[categoryName].outOfStock++;
    });

    // Sản phẩm cần nhập thêm
    const needsRestock = products
      .filter((p) => p.stock <= 5)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 20)
      .map((p) => ({
        id: p._id,
        name: p.name,
        sku: p.sku,
        currentStock: p.stock,
        price: p.price,
        category: p.category_id?.name || "Chưa phân loại",
        status: p.status,
      }));

    return {
      period: {
        timeRange,
        reportDate: new Date().toISOString(),
      },
      summary: {
        totalProducts,
        inStock,
        lowStock,
        outOfStock,
        totalValue,
        avgPrice: totalProducts > 0 ? totalValue / totalProducts : 0,
      },
      categoryStats: Object.values(categoryStats),
      needsRestock,
      products: products.map((p) => ({
        id: p._id,
        name: p.name,
        sku: p.sku,
        description: p.description,
        images: p.images,
        price: p.price,
        stock: p.stock,
        status: p.status,
        category: p.category_id?.name || "Chưa phân loại",
        categoryId: p.category_id?._id,
        value: (p.price || 0) * (p.stock || 0),
        stockStatus: p.stock > 5 ? 'Còn hàng' : p.stock > 0 ? 'Sắp hết' : 'Hết hàng',
      })),
    };
  }

  /**
   * Báo cáo sản phẩm bán chạy
   */
  static async generateBestSellersReport(timeRange, customStartDate, customEndDate) {
    const { startDate, endDate } = this.calculateDateRange(
      timeRange,
      customStartDate,
      customEndDate
    );

    // Sản phẩm bán chạy nhất
    const bestSellers = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ["completed", "delivered"] },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
          orderCount: { $sum: 1 },
          avgPrice: { $avg: "$items.price" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 50 },
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
          localField: "product.category_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          productId: "$_id",
          productName: "$product.name",
          sku: "$product.sku",
          description: "$product.description",
          images: "$product.images",
          price: "$product.price",
          categoryName: "$category.name",
          categoryId: "$category._id",
          totalSold: 1,
          totalRevenue: 1,
          orderCount: 1,
          avgPrice: 1,
          currentStock: "$product.stock",
          status: "$product.status",
        },
      },
    ]);

    // Sản phẩm bán chậm
    const slowMovers = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ["completed", "delivered"] },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
        },
      },
      { $sort: { totalSold: 1 } },
      { $limit: 20 },
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
          localField: "product.category_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          productId: "$_id",
          productName: "$product.name",
          sku: "$product.sku",
          description: "$product.description",
          images: "$product.images",
          price: "$product.price",
          categoryName: "$category.name",
          totalSold: 1,
          totalRevenue: 1,
          currentStock: "$product.stock",
          status: "$product.status",
        },
      },
    ]);

    // Thống kê theo danh mục
    const salesByCategory = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ["completed", "delivered"] },
        },
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "categories",
          localField: "product.category_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category._id",
          categoryName: { $first: "$category.name" },
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
          productCount: { $addToSet: "$items.productId" },
        },
      },
      { $sort: { totalRevenue: -1 } },
      {
        $project: {
          categoryName: 1,
          totalSold: 1,
          totalRevenue: 1,
          uniqueProducts: { $size: "$productCount" },
        },
      },
    ]);

    const totalRevenue = bestSellers.reduce((sum, p) => sum + p.totalRevenue, 0);
    const totalSold = bestSellers.reduce((sum, p) => sum + p.totalSold, 0);

    return {
      period: {
        timeRange,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      summary: {
        totalRevenue,
        totalSold,
        uniqueProducts: bestSellers.length,
        avgRevenuePerProduct: bestSellers.length > 0 ? totalRevenue / bestSellers.length : 0,
      },
      bestSellers,
      slowMovers,
      salesByCategory,
    };
  }

  /**
   * Báo cáo đơn hàng
   */
  static async generateOrdersReport(timeRange, customStartDate, customEndDate) {
    const { startDate, endDate } = this.calculateDateRange(
      timeRange,
      customStartDate,
      customEndDate
    );

    // Thống kê đơn hàng theo trạng thái
    const ordersByStatus = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Đơn hàng theo ngày
    const ordersByDay = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // Thống kê khách hàng
    const customerStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ["completed", "delivered"] },
        },
      },
      {
        $group: {
          _id: "$userId",
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
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
          userId: "$_id",
          name: "$user.name",
          email: "$user.email",
          orderCount: 1,
          totalSpent: 1,
          avgOrderValue: { $divide: ["$totalSpent", "$orderCount"] },
        },
      },
    ]);

    const totalOrders = await Order.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    const totalRevenue = ordersByStatus.reduce((sum, s) => sum + s.totalAmount, 0);

    // Lấy chi tiết sản phẩm trong các đơn hàng
    const productsSold = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ["completed", "delivered"] },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
          orderCount: { $sum: 1 },
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
        $lookup: {
          from: "categories",
          localField: "product.category_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          productId: "$_id",
          name: "$product.name",
          sku: "$product.sku",
          description: "$product.description",
          images: "$product.images",
          price: "$product.price",
          category: "$category.name",
          totalQuantity: 1,
          totalRevenue: 1,
          orderCount: 1,
        },
      },
      { $sort: { totalQuantity: -1 } },
    ]);

    return {
      period: {
        timeRange,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      summary: {
        totalOrders,
        totalRevenue,
        avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      },
      ordersByStatus: ordersByStatus.map((s) => ({
        status: s._id,
        count: s.count,
        totalAmount: s.totalAmount,
        percentage: totalOrders > 0 ? ((s.count / totalOrders) * 100).toFixed(2) : 0,
      })),
      ordersByDay: ordersByDay.map((d) => ({
        date: `${d._id.day}/${d._id.month}/${d._id.year}`,
        count: d.count,
        totalAmount: d.totalAmount,
      })),
      topCustomers: customerStats,
      products: productsSold,
    };
  }

  /**
   * Báo cáo theo danh mục
   */
  static async generateCategoryReport(timeRange, customStartDate, customEndDate) {
    const { startDate, endDate } = this.calculateDateRange(
      timeRange,
      customStartDate,
      customEndDate
    );

    // Thống kê bán hàng theo danh mục
    const categorySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ["completed", "delivered"] },
        },
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "categories",
          localField: "product.category_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$category._id",
          categoryName: { $first: "$category.name" },
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
          orderCount: { $sum: 1 },
          uniqueProducts: { $addToSet: "$items.productId" },
        },
      },
      { $sort: { totalRevenue: -1 } },
      {
        $project: {
          categoryId: "$_id",
          categoryName: 1,
          totalSold: 1,
          totalRevenue: 1,
          orderCount: 1,
          uniqueProducts: { $size: "$uniqueProducts" },
          avgRevenuePerOrder: { $divide: ["$totalRevenue", "$orderCount"] },
        },
      },
    ]);

    // Thống kê tồn kho theo danh mục
    const categoryInventory = await Product.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$category._id",
          categoryName: { $first: "$category.name" },
          totalProducts: { $sum: 1 },
          totalStock: { $sum: "$stock" },
          totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
          inStock: {
            $sum: {
              $cond: [{ $gt: ["$stock", 5] }, 1, 0],
            },
          },
          lowStock: {
            $sum: {
              $cond: [{ $and: [{ $gt: ["$stock", 0] }, { $lte: ["$stock", 5] }] }, 1, 0],
            },
          },
          outOfStock: {
            $sum: {
              $cond: [{ $eq: ["$stock", 0] }, 1, 0],
            },
          },
        },
      },
      { $sort: { totalValue: -1 } },
    ]);

    const totalRevenue = categorySales.reduce((sum, c) => sum + c.totalRevenue, 0);

    return {
      period: {
        timeRange,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      summary: {
        totalCategories: categorySales.length,
        totalRevenue,
      },
      categorySales: categorySales.map((c) => ({
        ...c,
        revenuePercentage: totalRevenue > 0 ? ((c.totalRevenue / totalRevenue) * 100).toFixed(2) : 0,
      })),
      categoryInventory: categoryInventory.map((c) => ({
        categoryId: c._id,
        categoryName: c.categoryName || "Chưa phân loại",
        totalProducts: c.totalProducts,
        totalStock: c.totalStock,
        totalValue: c.totalValue,
        inStock: c.inStock,
        lowStock: c.lowStock,
        outOfStock: c.outOfStock,
      })),
    };
  }

  /**
   * Tạo báo cáo tổng hợp
   */
  static async generateComprehensiveReport(timeRange, customStartDate, customEndDate) {
    const [revenue, inventory, bestSellers, orders, categories] = await Promise.all([
      this.generateRevenueReport(timeRange, customStartDate, customEndDate),
      this.generateInventoryReport(timeRange, customStartDate, customEndDate),
      this.generateBestSellersReport(timeRange, customStartDate, customEndDate),
      this.generateOrdersReport(timeRange, customStartDate, customEndDate),
      this.generateCategoryReport(timeRange, customStartDate, customEndDate),
    ]);

    return {
      reportType: "comprehensive",
      generatedAt: new Date().toISOString(),
      period: revenue.period,
      revenue,
      inventory,
      bestSellers,
      orders,
      categories,
    };
  }
}
