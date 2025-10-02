import express from "express";
import {
  handleLogin,
  register,
  getProfile,
  forgotPassword,
  resetPassword,
  validateResetToken,
} from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", handleLogin);
authRouter.get("/profile", authMiddleware, getProfile);

// Password reset routes
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.get("/validate-token/:token", validateResetToken);

export default authRouter;
