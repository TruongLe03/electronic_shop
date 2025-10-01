import express from "express";
import productRouter from "./products.router.js";
import categoryRouter from "./categories.rotuer.js";
import authRouter from "./auth.router.js";
import cartRouter from "./cart.router.js";
import userRouter from "./user.router.js";
import orderRouter from "./order.router.js";
import ordersRouter from "./orders.router.js";
import inventoryRouter from "./inventory.router.js";
const app = express();

app.use("/auth", authRouter);
app.use("/products", productRouter);
app.use("/categories", categoryRouter);
app.use("/cart", cartRouter);
app.use("/users", userRouter);
app.use("/orders", orderRouter);
app.use("/payment-orders", ordersRouter);
app.use("/inventory", inventoryRouter);

export default app;