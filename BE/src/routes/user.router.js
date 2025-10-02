import express from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/user.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const userRouter = express.Router();

// Tất cả routes đều cần authentication
userRouter.use(authMiddleware);

// Profile routes
userRouter.get("/profile", getProfile);
userRouter.put("/profile", updateProfile);
userRouter.put("/change-password", changePassword);
userRouter.post("/upload-avatar", uploadAvatar);

// Address routes
userRouter.get("/addresses", getAddresses);
userRouter.post("/addresses", addAddress);
userRouter.put("/addresses/:addressId", updateAddress);
userRouter.delete("/addresses/:addressId", deleteAddress);
userRouter.put("/addresses/:addressId/default", setDefaultAddress);

export default userRouter;
