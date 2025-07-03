import express from "express";
import dotenv from "dotenv";
export const app = express();
import { db } from "./db/dbConnection";
import cors from "cors";
import authRouter from "./router/auth.router";
import tableRouter from "./router/table.router";
import restaurantRouter from "./router/restaurant.router";
import bookingRouter from "./router/booking.router";
import cookieParser from "cookie-parser";
import { ApiError } from "./utils/apiError";
import externalRouter from "../src/services/external.service";

dotenv.config();

const port = process.env.PORT || 3000;

(async () => {
  await db();
})();

app.use(cookieParser());

app.use(
  cors({
    origin: ["https://beaker-0-v1.vercel.app", "http://localhost:5173"],
    methods: "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/user", authRouter);
app.use("/api/v1/table", tableRouter);
app.use("/api/v1/restaurant", restaurantRouter);
app.use("/api/v1/booking", bookingRouter);
app.use("/api/v1/external", externalRouter);

app.get("/", (req, res) => {
  res.send("backend started!");
});

app.use((err, req, res, next) => {
  if (err.name === "MongoServerError" && err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate key error",
      error: err.message,
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

app.listen(port, () => {
  return console.log(`Express is listening at ${port}`);
});
