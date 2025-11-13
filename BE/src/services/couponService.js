import Coupon from "../models/coupon.model.js";

export class CouponService {
  // Tạo coupon mới (Admin)
  static async createCoupon(couponData) {
    const {
      code,
      title,
      description,
      discount_type,
      discount_value,
      min_order_value,
      max_discount_amount,
      max_uses,
      expiry_date,
    } = couponData;

    // Validate discount_value cho percent
    if (
      discount_type === "percent" &&
      (discount_value < 0 || discount_value > 100)
    ) {
      throw new Error("Giá trị giảm giá phần trăm phải từ 0 đến 100");
    }

    // Kiểm tra code đã tồn tại
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      throw new Error("Mã giảm giá đã tồn tại");
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      title,
      description,
      discount_type,
      discount_value,
      min_order_value: min_order_value || 0,
      max_discount_amount,
      max_uses,
      expiry_date,
      status: "active",
    });

    return await coupon.save();
  }

  // Lấy tất cả coupons (Admin)
  static async getAllCoupons(page = 1, limit = 20, filters = {}) {
    const skip = (page - 1) * limit;
    let query = {};

    // Filter theo status
    if (filters.status) {
      query.status = filters.status;
    }

    // Filter theo còn hiệu lực hay không
    if (filters.is_valid === "true") {
      query.status = "active";
      query.expiry_date = { $gt: new Date() };
    }

    // Search theo code hoặc title
    if (filters.search) {
      query.$or = [
        { code: { $regex: filters.search, $options: "i" } },
        { title: { $regex: filters.search, $options: "i" } },
      ];
    }

    const [coupons, total] = await Promise.all([
      Coupon.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Coupon.countDocuments(query),
    ]);

    return {
      coupons,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Lấy coupon theo ID
  static async getCouponById(couponId) {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      throw new Error("Không tìm thấy mã giảm giá");
    }
    return coupon;
  }

  // Lấy các coupon công khai (Client) - chỉ các coupon còn hiệu lực
  static async getPublicCoupons(userId = null) {
    const now = new Date();
    const coupons = await Coupon.find({
      status: "active",
      expiry_date: { $gt: now },
      $or: [
        { max_uses: null },
        { $expr: { $lt: ["$used_count", "$max_uses"] } },
      ],
    }).sort({ createdAt: -1 });
    
    console.log("📋 getPublicCoupons - userId:", userId);
    console.log("📋 Total coupons found:", coupons.length);
    
    // Nếu user đã login, filter ra những coupon đã sử dụng hết lượt
    if (userId) {
      const availableCoupons = coupons.filter(coupon => {
        // Tìm user trong used_by
        const userUsage = coupon.used_by.find(
          item => item.user_id.toString() === userId.toString()
        );
        
        console.log(`Coupon ${coupon.code}:`, {
          userUsage: userUsage ? {
            used_count: userUsage.used_count,
            usage_limit: coupon.usage_limit_per_user
          } : 'Not used yet',
          shouldShow: !userUsage || userUsage.used_count < coupon.usage_limit_per_user
        });
        
        // Nếu user chưa dùng hoặc chưa dùng hết lượt thì hiển thị
        if (!userUsage) return true;
        return userUsage.used_count < coupon.usage_limit_per_user;
      });
      
      console.log(`✅ Available coupons for user ${userId}:`, availableCoupons.length, '/', coupons.length);
      return availableCoupons;
    }
    
    console.log("⚠️ Public Coupons (no user):", coupons.length);
    return coupons;
  }

  // Validate và tính toán discount cho coupon
  static async validateAndCalculateDiscount(code, orderValue, userId = null, productIds = []) {
    const coupon = await Coupon.findValidByCode(code);

    if (!coupon) {
      throw new Error("Mã giảm giá không tồn tại hoặc đã hết hạn");
    }

    // Kiểm tra coupon có hợp lệ không (bao gồm check user và product)
    const canUseResult = coupon.canUse(orderValue, userId, productIds);
    if (!canUseResult.valid) {
      throw new Error(canUseResult.message);
    }

    // Tính toán discount
    const discountAmount = coupon.calculateDiscount(orderValue);

    return {
      coupon_id: coupon._id,
      code: coupon.code,
      title: coupon.title,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      discount_amount: Math.round(discountAmount),
      final_total: Math.round(orderValue - discountAmount),
    };
  }

  // Áp dụng coupon vào order (gọi sau khi tạo order thành công)
  static async applyCouponToOrder(couponId, userId, orderId) {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      throw new Error("Không tìm thấy mã giảm giá");
    }

    await coupon.markAsUsed(userId, orderId);
    return coupon;
  }

  // Cập nhật coupon (Admin)
  static async updateCoupon(couponId, updateData) {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      throw new Error("Không tìm thấy mã giảm giá");
    }

    // Validate discount_value nếu có update
    if (updateData.discount_type === "percent" && updateData.discount_value) {
      if (updateData.discount_value < 0 || updateData.discount_value > 100) {
        throw new Error("Giá trị giảm giá phần trăm phải từ 0 đến 100");
      }
    }

    // Không cho phép thay đổi code nếu coupon đã được sử dụng
    if (updateData.code && coupon.used_count > 0) {
      throw new Error("Không thể thay đổi mã giảm giá đã được sử dụng");
    }

    Object.assign(coupon, updateData);
    return await coupon.save();
  }

  // Xóa coupon (Admin)
  static async deleteCoupon(couponId) {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      throw new Error("Không tìm thấy mã giảm giá");
    }

    // Không cho phép xóa coupon đã được sử dụng
    if (coupon.used_count > 0) {
      throw new Error(
        "Không thể xóa mã giảm giá đã được sử dụng. Hãy đặt trạng thái là inactive"
      );
    }

    await Coupon.findByIdAndDelete(couponId);
    return { success: true, message: "Xóa mã giảm giá thành công" };
  }

  // Vô hiệu hóa coupon (Admin)
  static async deactivateCoupon(couponId) {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      throw new Error("Không tìm thấy mã giảm giá");
    }

    coupon.status = "inactive";
    return await coupon.save();
  }

  // Kích hoạt lại coupon (Admin)
  static async activateCoupon(couponId) {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      throw new Error("Không tìm thấy mã giảm giá");
    }

    // Kiểm tra ngày hết hạn
    if (coupon.expiry_date <= new Date()) {
      throw new Error("Không thể kích hoạt mã giảm giá đã hết hạn");
    }

    coupon.status = "active";
    return await coupon.save();
  }

  // Thống kê coupon
  static async getCouponStats() {
    const totalCoupons = await Coupon.countDocuments();
    const activeCoupons = await Coupon.countDocuments({
      status: "active",
      expiry_date: { $gt: new Date() },
    });
    const expiredCoupons = await Coupon.countDocuments({
      $or: [{ status: "expired" }, { expiry_date: { $lte: new Date() } }],
    });
    const totalUsed = await Coupon.aggregate([
      { $group: { _id: null, total: { $sum: "$used_count" } } },
    ]);

    return {
      total: totalCoupons,
      active: activeCoupons,
      expired: expiredCoupons,
      totalUsed: totalUsed[0]?.total || 0,
    };
  }
}
