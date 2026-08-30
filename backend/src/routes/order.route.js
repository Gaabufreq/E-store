import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorization.middleware.js";
import {
    cancelMyOrder,
    createOrder,
    createRazorpayOrder,
    getAllOrders,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    verifyPayment
} from "../controllers/order.controller.js";

const orderRoute = express.Router();

// Saari order routes ke liye logged-in hona compulsory hai
orderRoute.use(authMiddleware);

// user routes

orderRoute.post("/createorder", createOrder);
orderRoute.get("/myorders", getMyOrders);
orderRoute.post("/razorpay-order", createRazorpayOrder)
orderRoute.post("/verify-payment", verifyPayment)
orderRoute.put("/cancel/:id",cancelMyOrder)


// Admin only route
orderRoute.put("/status/:id", authorize("admin"), updateOrderStatus);
orderRoute.get("/allorders", authorize("admin"), getAllOrders);

// dynamic route
orderRoute.get("/:id", getOrderById);

export default orderRoute;