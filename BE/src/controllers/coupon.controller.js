import { CouponService } from "../services/couponService.js";
import { ResponseUtil, asyncHandler } from "../utils/response.util.js";

// Tạo coupon mới (Admin)
export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await CouponService.createCoupon(req.body);
  return ResponseUtil.success(res, coupon, "Tạo mã giảm giá thành công", 201);
});

// Lấy tất cả coupons (Admin)
export const getAllCoupons = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, is_valid, search } = req.query;
  
  const filters = {};
  if (status) filters.status = status;
  if (is_valid) filters.is_valid = is_valid;
  if (search) filters.search = search;

  const result = await CouponService.getAllCoupons(
    parseInt(page),
    parseInt(limit),
    filters
  );

  return ResponseUtil.success(res, result, "Lấy danh sách mã giảm giá thành công");
});

// Lấy coupon theo ID
export const getCouponById = asyncHandler(async (req, res) => {
  const coupon = await CouponService.getCouponById(req.params.id);
  return ResponseUtil.success(res, coupon, "Lấy thông tin mã giảm giá thành công");
});

// Lấy các coupon công khai (Client)
export const getPublicCoupons = asyncHandler(async (req, res) => {
  const userId = req.user?._id || null; // Lấy userId nếu user đã login
  const coupons = await CouponService.getPublicCoupons(userId);
  return ResponseUtil.success(res, coupons, "Lấy danh sách mã giảm giá thành công");
});

// Validate coupon (Client)
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, order_value, product_ids } = req.body;

  if (!code || !order_value) {
    return ResponseUtil.error(res, "Thiếu thông tin mã giảm giá hoặc giá trị đơn hàng", 400);
  }

  const userId = req.user?._id;
  const productIds = product_ids || [];
  
  const result = await CouponService.validateAndCalculateDiscount(
    code,
    parseFloat(order_value),
    userId,
    productIds
  );

  return ResponseUtil.success(res, result, "Mã giảm giá hợp lệ");
});

// Cập nhật coupon (Admin)
export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await CouponService.updateCoupon(req.params.id, req.body);
  return ResponseUtil.success(res, coupon, "Cập nhật mã giảm giá thành công");
});

// Xóa coupon (Admin)
export const deleteCoupon = asyncHandler(async (req, res) => {
  const result = await CouponService.deleteCoupon(req.params.id);
  return ResponseUtil.success(res, result, "Xóa mã giảm giá thành công");
});

// Vô hiệu hóa coupon (Admin)
export const deactivateCoupon = asyncHandler(async (req, res) => {
  const coupon = await CouponService.deactivateCoupon(req.params.id);
  return ResponseUtil.success(res, coupon, "Vô hiệu hóa mã giảm giá thành công");
});

// Kích hoạt lại coupon (Admin)
export const activateCoupon = asyncHandler(async (req, res) => {
  const coupon = await CouponService.activateCoupon(req.params.id);
  return ResponseUtil.success(res, coupon, "Kích hoạt mã giảm giá thành công");
});

// Thống kê coupon (Admin)
export const getCouponStats = asyncHandler(async (req, res) => {
  const stats = await CouponService.getCouponStats();
  return ResponseUtil.success(res, stats, "Lấy thống kê mã giảm giá thành công");
});
