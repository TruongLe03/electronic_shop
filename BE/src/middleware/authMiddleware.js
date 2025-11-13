import { verifyToken } from "../utils/auth.util.js";
import { ResponseUtil } from "../utils/response.util.js";
import User from "../models/user.model.js";

// Middleware xác thực cơ bản
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return ResponseUtil.unauthorized(
        res,
        "Token xác thực không được cung cấp"
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    // Kiểm tra user có tồn tại và active không
    const user = await User.findById(decoded.id);
    if (!user) {
      return ResponseUtil.unauthorized(res, "Người dùng không tồn tại");
    }

    if (user.status !== "active") {
      return ResponseUtil.unauthorized(res, "Tài khoản đã bị vô hiệu hóa");
    }

    // Provide both `id` and `_id` for backward compatibility across controllers
    req.user = {
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return ResponseUtil.unauthorized(res, "Token không hợp lệ hoặc đã hết hạn");
  }
};

// Middleware kiểm tra quyền admin (sử dụng sau authMiddleware)
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return ResponseUtil.unauthorized(res, "Bạn cần đăng nhập để truy cập");
  }

  if (req.user.role !== "admin") {
    return ResponseUtil.forbidden(
      res,
      "Bạn không có quyền truy cập tính năng này"
    );
  }

  next();
};

// Middleware kiểm tra quyền customer
export const requireCustomer = (req, res, next) => {
  if (!req.user) {
    return ResponseUtil.unauthorized(res, "Bạn cần đăng nhập để truy cập");
  }

  if (req.user.role !== "customer") {
    return ResponseUtil.forbidden(res, "Tính năng này chỉ dành cho khách hàng");
  }

  next();
};

// Middleware kiểm tra owner (user chỉ được truy cập data của mình)
export const requireOwner = (userIdField = "userId") => {
  return (req, res, next) => {
    if (!req.user) {
      return ResponseUtil.unauthorized(res, "Bạn cần đăng nhập để truy cập");
    }

    // Admin có thể truy cập tất cả
    if (req.user.role === "admin") {
      return next();
    }

    const resourceUserId =
      req.params[userIdField] ||
      req.body[userIdField] ||
      req.query[userIdField];

    if (!resourceUserId) {
      return ResponseUtil.badRequest(
        res,
        `Không tìm thấy ${userIdField} trong request`
      );
    }

    if (req.user.id.toString() !== resourceUserId.toString()) {
      return ResponseUtil.forbidden(
        res,
        "Bạn chỉ có thể truy cập dữ liệu của chính mình"
      );
    }

    next();
  };
};

// Middleware kết hợp: auth + admin
export const requireAdminAuth = [authMiddleware, requireAdmin];

// Middleware kết hợp: auth + customer
export const requireCustomerAuth = [authMiddleware, requireCustomer];

// Export default để backward compatibility
export default authMiddleware;
