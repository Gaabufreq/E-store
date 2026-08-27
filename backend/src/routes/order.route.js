import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorization.middleware.js";
import {
    createOrder,
    createRazorpayOrder,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    verifyPayment
} from "../controllers/order.controller.js";

const orderRoute = express.Router();

// Saari order routes ke liye logged-in hona compulsory hai
orderRoute.use(authMiddleware);

orderRoute.post("/createorder", createOrder);
orderRoute.get("/myorders", getMyOrders);
orderRoute.get("/:id", getOrderById);
orderRoute.post("/razorpay-order", createRazorpayOrder)
orderRoute.post("/verify-payment", verifyPayment)

// Admin only route
orderRoute.put("/status/:id", authorize("admin"), updateOrderStatus);

export default orderRoute;