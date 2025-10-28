import express from "express";
import {
  getCategories,
  getCategoryById,
  getSubcategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categories.controller.js";
import { requireAdminAuth } from "../middleware/authMiddleware.js";

const categoryRouter = express.Router();

// ============= CATEGORY DISCOVERY - Public Routes =============
categoryRouter.get("/all", getCategories);
categoryRouter.get("/:id/details", getCategoryById);
categoryRouter.get("/:parentId/subcategories", getSubcategories);

// ============= CATEGORY MANAGEMENT - Admin Only =============
categoryRouter.post("/create", requireAdminAuth, createCategory);
categoryRouter.put("/:id", requireAdminAuth, updateCategory);
categoryRouter.delete("/:id", requireAdminAuth, deleteCategory);

export default categoryRouter;
