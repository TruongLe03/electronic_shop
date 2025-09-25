import express from "express";
import {
  getCategories,
  getCategoryById,
  getSubcategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categories.controller.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";

const categoryRouter = express.Router();

// Public routes
categoryRouter.get("/", getCategories);
categoryRouter.get("/:id", getCategoryById);
categoryRouter.get("/:parentId/subcategories", getSubcategories);

// Admin routes
categoryRouter.post("/", requireAdmin, createCategory);
categoryRouter.put("/:id", requireAdmin, updateCategory);
categoryRouter.delete("/:id", requireAdmin, deleteCategory);

export default categoryRouter;
