import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import productRouter from "./routes/products.router.js";
import categoryRouter from "./routes/categories.rotuer.js";
import authRouter from "./routes/auth.router.js";
import cartRouter from "./routes/cart.router.js";
import userRouter from "./routes/user.router.js";
import orderRouter from "./routes/order.router.js";
import ordersRouter from "./routes/orders.router.js";
import inventoryRouter from "./routes/inventory.router.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/cart", cartRouter);
app.use("/api/users", userRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payment-orders", ordersRouter);
app.use("/api/inventory", inventoryRouter);

app.get("/", (req, res) => {
  res.send("Server API đang chạy 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server http://localhost:${PORT}`));
