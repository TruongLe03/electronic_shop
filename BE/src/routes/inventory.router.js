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

// ============= PUBLIC STOCK CHECK =============
inventoryRouter.get("/check/products/:productId", getInventoryByProduct);

// Apply auth middleware to protected routes
inventoryRouter.use(authMiddleware);
inventoryRouter.use(adminOnly);

// ============= INVENTORY OVERVIEW =============
inventoryRouter.get("/all-products", getAllInventories);
inventoryRouter.get("/reports/low-stock", getLowStockReport);

// ============= PRODUCT INVENTORY DETAILS =============
inventoryRouter.get("/products/:productId", getInventoryByProduct);
inventoryRouter.get("/products/:productId/history", getStockHistory);

// ============= INVENTORY MANAGEMENT =============
inventoryRouter.put("/products/:productId", updateInventory);
inventoryRouter.post("/products/create", createInventory);

// ============= STOCK OPERATIONS =============
inventoryRouter.post("/stock/adjust/:productId", adjustStock);
inventoryRouter.post("/stock/reserve", reserveStock);
inventoryRouter.post("/stock/release", releaseReservedStock);

export default inventoryRouter;
