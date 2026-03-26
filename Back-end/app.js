import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import categoryRouter from "./routes/category.route.js";
import productRouter from "./routes/product.route.js";
import userRouter from "./routes/user.route.js";
import cartRouter from "./routes/cart.route.js";
import accRouter from "./routes/account.route.js";
import globalErrorHandler from "./middlewares/errors/errorHandler.js";
import notFound from "./middlewares/errors/notFound.js";

const app = express();
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api", accRouter);
app.use("/api/users", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);

// Fall Back Router
app.use("/", notFound);
//Centralized global Error handling
app.use(globalErrorHandler);
export default app;
