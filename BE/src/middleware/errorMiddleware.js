import { ResponseUtil } from "../utils/response.util.js";

/**
 * Global Error Handler Middleware
 * Xử lý tất cả các lỗi trong ứng dụng theo chuẩn
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return ResponseUtil.validationError(res, errors, 'Dữ liệu không hợp lệ');
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return ResponseUtil.validationError(res, [`${field} đã tồn tại`], 'Dữ liệu bị trùng lặp');
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return ResponseUtil.validationError(res, ['ID không hợp lệ'], 'Định dạng ID không đúng');
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return ResponseUtil.unauthorized(res, 'Token không hợp lệ');
  }

  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    return ResponseUtil.unauthorized(res, 'Token đã hết hạn');
  }

  // Custom application errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }

  // Default server error
  return ResponseUtil.error(res, 'Đã xảy ra lỗi server', 500);
};

/**
 * Not Found Handler
 */
export const notFoundHandler = (req, res) => {
  return ResponseUtil.notFound(res, `Route ${req.originalUrl} không tồn tại`);
};