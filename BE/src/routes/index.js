import express from "express";
import authRouter from "./auth.router.js";
import userRouter from "./user.router.js";
import productRouter from "./products.router.js";
import categoryRouter from "./categories.router.js";
import cartRouter from "./cart.router.js";
import ordersRouter from "./orders.router.js";
import inventoryRouter from "./inventory.router.js";
import paymentRouter from "./payment.router.js";
import otpRouter from "./otp.router.js";
import adminRouter from "./admin.router.js";

const appRouter = express();

appRouter.use("/auth", authRouter);
appRouter.use("/users", userRouter);
appRouter.use("/products", productRouter);
appRouter.use("/categories", categoryRouter);
appRouter.use("/cart", cartRouter);
appRouter.use("/orders", ordersRouter);
appRouter.use("/inventory", inventoryRouter);
appRouter.use("/payment", paymentRouter);
appRouter.use("/otp", otpRouter);
appRouter.use("/admin", adminRouter);

export default appRouter;
