import express from "express";
import authRouter from "./auth.router.js";
import userRouter from "./user.router.js";
import productRouter from "./products.router.js";
import categoryRouter from "./categories.router.js";
import cartRouter from "./cart.router.js";
import ordersRouter from "./orders.router.js";
import inventoryRouter from "./inventory.router.js";
import paymentRouter from "./payment.router.js";
import vnpayRouter from "./vnpay.router.js";
import adminRouter from "./admin.router.js";
import stockNotificationRouter from "./stockNotification.router.js";
import commentsRouter from "./comments.router.js";
import notificationRouter from "./notification.router.js";

const appRouter = express();

// ============= SEMANTIC API STRUCTURE =============
// Authentication & Authorization
appRouter.use("/auth", authRouter);

// User Management
appRouter.use("/users", userRouter);

// Product Catalog
appRouter.use("/products", productRouter);
appRouter.use("/categories", categoryRouter);

// Shopping Experience
appRouter.use("/cart", cartRouter);
appRouter.use("/orders", ordersRouter);

// Commerce Operations
appRouter.use("/inventory", inventoryRouter);
appRouter.use("/payment", paymentRouter);
appRouter.use("/vnpay", vnpayRouter);

// Administrative
appRouter.use("/admin", adminRouter);

// Stock Notifications
appRouter.use("/stock-notifications", stockNotificationRouter);

// Comments & Reviews
appRouter.use("/comments", commentsRouter);

// Notifications
appRouter.use("/notifications", notificationRouter);

export default appRouter;
