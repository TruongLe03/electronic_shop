import express from "express";
import inventoryController from "../controllers/inventory.controller.js";
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
inventoryRouter.get("/check/:productId", inventoryController.checkStock);

// Apply auth middleware to protected routes
inventoryRouter.use(authMiddleware);
inventoryRouter.use(adminOnly);

// Admin only routes
inventoryRouter.get("/", inventoryController.getInventories);

// Get inventory dashboard stats
inventoryRouter.get("/stats", inventoryController.getInventoryStats);

// Run stock migration (one-time setup)
inventoryRouter.post("/migrate-stock", inventoryController.runStockMigration);

// Get inventory by product ID
inventoryRouter.get(
  "/product/:productId",
  inventoryController.getInventoryByProduct
);

// Get stock movements history for a product
inventoryRouter.get(
  "/movements/:productId",
  inventoryController.getStockMovements
);

// Update inventory settings
inventoryRouter.put("/product/:productId", inventoryController.updateInventory);

// Add stock (stock in)
inventoryRouter.post("/add/:productId", inventoryController.addStock);

// Remove stock (stock out)
inventoryRouter.post("/remove/:productId", inventoryController.removeStock);

export default inventoryRouter;
