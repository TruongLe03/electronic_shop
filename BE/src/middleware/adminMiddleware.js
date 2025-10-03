import User from "../models/user.model.js";

const adminMiddleware = async (req, res, next) => {
  try {
    // Kiểm tra xem user đã được xác thực chưa (từ authMiddleware)
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Bạn cần đăng nhập để truy cập"
      });
    }

    // Lấy thông tin user từ database
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Người dùng không tồn tại"
      });
    }

    // Kiểm tra quyền admin
    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập tính năng này. Chỉ admin mới được phép."
      });
    }

    // Kiểm tra trạng thái tài khoản
    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản admin đã bị vô hiệu hóa"
      });
    }

    // Gắn thông tin admin vào request
    req.admin = user;
    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi kiểm tra quyền admin",
      error: error.message
    });
  }
};

export default adminMiddleware;