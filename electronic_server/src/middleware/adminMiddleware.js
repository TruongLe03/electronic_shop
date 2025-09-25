import authMiddleware from "./authMiddleware.js";

// Middleware to require admin role
export const requireAdmin = (req, res, next) => {
  // First check if user is authenticated
  authMiddleware(req, res, (err) => {
    if (err) return next(err);
    
    // Then check if user has admin role
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Admin privileges required"
      });
    }
    
    next();
  });
};

export default requireAdmin;