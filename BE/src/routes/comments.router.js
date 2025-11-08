import express from "express";
import { commentController } from "../controllers/comments.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/product/:productId", commentController.getByProduct);

// Protected routes
router.post("/", authMiddleware, commentController.create);
router.put("/:commentId", authMiddleware, commentController.update);
router.delete("/:commentId", authMiddleware, commentController.delete);
router.post("/:commentId/like", authMiddleware, commentController.like);
router.post("/:commentId/unlike", authMiddleware, commentController.unlike);

export default router;