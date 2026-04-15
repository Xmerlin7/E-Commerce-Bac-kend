import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import categoryRouter from "./routes/category.route.js";
import productRouter from "./routes/product.route.js";
import userRouter from "./routes/user.route.js";
import cartRouter from "./routes/cart.route.js";
import accRouter from "./routes/account.route.js";
import paymentRouter from "./routes/payment.route.js";
import globalErrorHandler from "./middlewares/errors/errorHandler.js";
import notFound from "./middlewares/errors/notFound.js";

const app = express();
app.use(morgan("dev"));
app.use(
	cors({
		origin: [
			"http://localhost:4200",
			"http://127.0.0.1:4200",
		],
		credentials: true,
	}),
);
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString("utf8");
    },
  }),
);
app.use(cookieParser());
app.use("/uploads", express.static(path.resolve("uploads")));

app.use("/api", accRouter);
app.use("/api/users", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/api/payments", paymentRouter);

// Fall Back Router
app.use("/", notFound);
//Centralized global Error handling
app.use(globalErrorHandler);
export default app;
