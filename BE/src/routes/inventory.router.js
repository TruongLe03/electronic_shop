import express from "express";
import {
  getInventoryByProduct,
  getAllInventories,
  updateInventory,
  createInventory,
  adjustStock,
  getStockHistory,
  reserveStock,
  releaseReservedStock,
  getLowStockReport
} from "../controllers/inventory.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const inventoryRouter = express.Router();

// Middleware to check if user is admin
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }
};

// Public routes (no auth required)
inventoryRouter.get("/check/:productId", getInventoryByProduct); // Check stock for adding to cart

// Apply auth middleware to protected routes
inventoryRouter.use(authMiddleware);
inventoryRouter.use(adminOnly);

// Admin only routes
inventoryRouter.get("/", getAllInventories);
inventoryRouter.get("/product/:productId", getInventoryByProduct);
inventoryRouter.get("/low-stock", getLowStockReport);
inventoryRouter.get("/history/:productId", getStockHistory);

// Update/Create inventory
inventoryRouter.put("/product/:productId", updateInventory);
inventoryRouter.post("/create", createInventory);

// Stock operations
inventoryRouter.post("/adjust/:productId", adjustStock);
inventoryRouter.post("/reserve", reserveStock);
inventoryRouter.post("/release", releaseReservedStock);

export default inventoryRouter;
