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
import authMiddleware, { requireOwner } from "../middleware/authMiddleware.js";

const userRouter = express.Router();

// ==== USER PROFILE ====
userRouter.get("/profile", authMiddleware, getProfile);
userRouter.put("/profile", authMiddleware, updateProfile);
userRouter.post("/profile/avatar", authMiddleware, uploadAvatar);

// ==== PASSWORD ====
userRouter.put("/password/change", authMiddleware, changePassword);

// ==== ADDRESSES ====
userRouter.get("/addresses", authMiddleware, getAddresses);
userRouter.post("/addresses", authMiddleware, addAddress);
userRouter.put("/addresses/:addressId", authMiddleware, requireOwner("userId"), updateAddress);
userRouter.delete("/addresses/:addressId", authMiddleware, requireOwner("userId"), deleteAddress);
userRouter.put("/addresses/:addressId/set-default", authMiddleware, requireOwner("userId"), setDefaultAddress);

export default userRouter;
