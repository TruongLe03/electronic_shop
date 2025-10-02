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

// GET routes
categoryRouter.get("/", getCategories);
categoryRouter.get("/:id", getCategoryById);
categoryRouter.get("/:parentId/subcategories", getSubcategories);

// POST routes
categoryRouter.post("/", createCategory);

// PUT routes
categoryRouter.put("/:id", updateCategory);

// DELETE routes
categoryRouter.delete("/:id", deleteCategory);

export default categoryRouter;
