import express from "express";
import {
  getCategories,
  getCategoryById,
  getSubcategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categories.controller.js";

const categoryRouter = express.Router();

// ============= CATEGORY DISCOVERY =============
categoryRouter.get("/all", getCategories);
categoryRouter.get("/:id/details", getCategoryById);
categoryRouter.get("/:parentId/subcategories", getSubcategories);

// ============= CATEGORY MANAGEMENT =============
categoryRouter.post("/create", createCategory);
categoryRouter.put("/:id", updateCategory);
categoryRouter.delete("/:id", deleteCategory);

export default categoryRouter;
