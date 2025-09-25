import express from "express";
import * as importProductsController from "../controllers/importProducts.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const importProductsRouter = express.Router();

// Tạo phiếu nhập hàng (yêu cầu đăng nhập)
importProductsRouter.post(
  "/",
  authMiddleware,
  importProductsController.createImport
);

// Lấy danh sách phiếu nhập hàng
importProductsRouter.get(
  "/",
  authMiddleware,
  importProductsController.getAllImports
);

export default importProductsRouter;
