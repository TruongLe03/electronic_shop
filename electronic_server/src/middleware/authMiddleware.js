import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    console.log('Auth middleware - Headers:', req.headers.authorization);
    
    // Get token from Authorization header
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      console.log('Auth middleware - No authorization header found');
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Check if token format is valid (Bearer token)
    if (!authHeader.startsWith("Bearer ")) {
      console.log('Auth middleware - Invalid token format:', authHeader);
      return res.status(401).json({
        success: false,
        message: "Invalid token format. Use Bearer token.",
      });
    }

    // Extract token from header
    const token = authHeader.split(" ")[1];
    console.log('Auth middleware - Token extracted:', token ? 'exists' : 'missing');

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log('Auth middleware - Token decoded successfully for user:', decoded.id);

    // Add user data to request object
    req.user = decoded;

    next();
  } catch (error) {
    console.log('Auth middleware - Error:', error.message);
    // Handle different types of JWT errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

export default authMiddleware;
