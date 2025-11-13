import express from "express";
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  getPublicCoupons,
  validateCoupon,
  updateCoupon,
  deleteCoupon,
  deactivateCoupon,
  activateCoupon,
  getCouponStats,
} from "../controllers/coupon.controller.js";
import authMiddleware, { requireAdminAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// ============= PROTECTED ROUTES (Authenticated Users) =============
// Lấy danh sách coupon công khai (yêu cầu đăng nhập để filter theo user)
router.get("/public", authMiddleware, getPublicCoupons);

// ============= PROTECTED ROUTES (Authenticated Users) =============
// Validate coupon code
router.post("/validate", authMiddleware, validateCoupon);

// ============= ADMIN ROUTES =============
// Thống kê coupon
router.get("/stats", requireAdminAuth, getCouponStats);

// CRUD Operations
router.post("/", requireAdminAuth, createCoupon);
router.get("/", requireAdminAuth, getAllCoupons);
router.get("/:id", requireAdminAuth, getCouponById);
router.put("/:id", requireAdminAuth, updateCoupon);
router.delete("/:id", requireAdminAuth, deleteCoupon);

// Activate/Deactivate
router.patch("/:id/deactivate", requireAdminAuth, deactivateCoupon);
router.patch("/:id/activate", requireAdminAuth, activateCoupon);

export default router;
