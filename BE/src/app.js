import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import appRouter from "./routes/index.js";
import { ResponseUtil } from "./utils/response.util.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", appRouter);

app.get("/", (req, res) => {
  res.send("Server API đang chạy 🚀");
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  // Log error for debugging
  console.error("Global Error Handler:", err.message);
  console.error("Stack:", err.stack);

  // Handle specific error types
  if (err.message === "Tài khoản không tồn tại") {
    return ResponseUtil.notFound(res, err.message);
  }

  if (
    err.message === "Mật khẩu không đúng" ||
    err.message === "Tài khoản đã bị khóa"
  ) {
    return ResponseUtil.unauthorized(res, err.message);
  }

  if (err.message.includes("validation") || err.message.includes("required")) {
    return ResponseUtil.validationError(res, [err.message]);
  }

  // Default to internal server error
  return ResponseUtil.error(res, "Đã có lỗi xảy ra trên server", 500);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server http://localhost:${PORT}`));
