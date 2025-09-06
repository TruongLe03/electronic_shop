import express from "express";
import {
  getCategories,
  createCategory,
} from "../controllers/categories.controller.js";

const categoryRouter = express.Router();

categoryRouter.get("/", getCategories);
categoryRouter.post("/", createCategory);

export default categoryRouter;
