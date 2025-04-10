import express from "express";
import dotenv from "dotenv";
const app = express();
import { db } from "./db/dbConnection";
import cors from "cors"
import authRouter from "./router/auth.router";
import tableRouter from "./router/table.router";
import restaurantRouter from "./router/restaurant.router";
import bookingRouter from "./router/booking.router";

dotenv.config();

const port = process.env.PORT || 3000;

(async () => {
  await db();
})();

app.use(
  cors({
    origin: "https://beaker-0-v1.vercel.app",
    methods: "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded());

app.use("/api/v1/user", authRouter);
app.use("/api/v1/table", tableRouter);
app.use("/api/v1/restaurant", restaurantRouter);
app.use("/api/v1/booking", bookingRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});