import express from "express";
import { errorHandle } from "../src/middleware/error.middleware.js";
import authRoute from "../src/routes/auth.route.js";
import cookieParser from "cookie-parser";
import productRoute from "./routes/product.route.js";
import categoryRoute from "./routes/category.route.js";
import cartRoute from "./routes/cart.route.js";
import orderRoute from "./routes/order.route.js";
import cors from 'cors'

const app = express();  

const allowedOrigin = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https:https://e-store-1-pxaw.onrender.com"
]

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigin.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));




app.use(express.json());
app.use(cookieParser())

app.use("/api/auth",authRoute)
app.use("/api/product", productRoute)
app.use("/api/category", categoryRoute)
app.use("/api/cart",cartRoute)
app.use("/api/order",orderRoute)


// middleware
app.use(errorHandle)

export default app;