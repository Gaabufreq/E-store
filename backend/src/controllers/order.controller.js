import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import crypto from 'crypto'
import { razorpayInstance } from "../utility/razorpay.js";

// 1. Create New Order (From User Cart)
export const createOrder = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { shippingAddress, paymentMethod } = req.body;

        if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
            return res.status(400).json({
                success: false,
                message: "Please provide complete shipping address ❌"
            });
        }

        // Fetch user's cart
        const cart = await Cart.findOne({ user: userId }).populate("items.product");

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty ❌"
            });
        }

        // Prepare order items & reduce stock
        const orderItems = [];

        for (const item of cart.items) {
            const product = await Product.findById(item.product._id);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found ❌`
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Not enough stock for ${product.name} ❌`
                });
            }

            // Deduct Stock
            product.stock -= item.quantity;
            await product.save();

            orderItems.push({
                product: product._id,
                name: product.name,
                quantity: item.quantity,
                price: item.price
            });
        }

        // Create Order
        const order = await Order.create({
            user: userId,
            orderItems,
            shippingAddress,
            paymentMethod: paymentMethod || "COD",
            totalPrice: cart.totalCartPrice
        });

        // Clear User's Cart after order placement
        cart.items = [];
        cart.totalCartPrice = 0;
        await cart.save();

        return res.status(201).json({
            success: true,
            message: "Order placed successfully ✅",
            order
        });

    } catch (error) {
        next(error);
    }
};

// 2. Get Logged-in User Orders
export const getMyOrders = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });

    } catch (error) {
        next(error);
    }
};

// 3. Get Single Order Details by ID
export const getOrderById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id).populate("user", "name email");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found ❌"
            });
        }

        return res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        next(error);
    }
};

// 4. Update Order Status (Admin Only)
export const updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { orderStatus } = req.body;

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found ❌"
            });
        }

        order.orderStatus = orderStatus || order.orderStatus;
        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order status updated ✅",
            order
        });

    } catch (error) {
        next(error);
    }
};


// Razorpay Order Create
export const createRazorpayOrder = async (req,res,next) =>{
try {
    const userId = req.user.userId
    const cart = await Cart.findOne({user: userId})

    if(!cart){
        return res.status(400).json({
             success: false,
              message: "Cart is empty ❌",
             });
    }

    const options = {
        amount : Math.round(cart.totalCartPrice * 100), // amount ko paise me laane ke liye 
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    return res.status(200).json({
            success: true,
            order: razorpayOrder,
            key: process.env.RAZORPAY_KEY_ID,
        }); 

} catch (error) {
    next(error)
}
}

// Razorpay Signature Verification & Database Entry

export const verifyPayment = async (req,res,next) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            shippingAddress,
        } = req.body;

        // Signature verify logic using SHA256 HMAC

        const body = razorpay_order_id + "|" + razorpay_payment_id

        const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body.toString()).digest("hex");

        if(expectedSignature !== razorpay_signature){
            return res.status(400).json({
                success: false,
                message: "Payment verification failed ❌",
            });
        }

        // Fetch user's cart

        const userId = req.user.userId
        const cart = await Cart.findOne({user: userId}).populate("items.product")

        if(!cart ||  cart.items.length === 0){
            return res.status(400).json({ success: false, message: "Cart is empty ❌" });
        }

        const orderItems = cart.items.map((item) => ({
            product:item.product._id,
            name: item.product.name,
            quantity:item.quantity,
            price:item.price
        }));

        // Create Order in DB

        const order = await Order.create({
            user: userId,
            orderItems,
            shippingAddress,
            paymentMethod:"Razorpay",
            paymentInfo:{
                id: razorpay_payment_id,
                status: "Paid",
            },
            totalPrice: cart.totalCartPrice,
            orderStatus:"Processing",
        });

        // Clear Cart

        cart.items = [];
        cart.totalCartPrice = 0
        await cart.save();

        return res.status(201).json({
            success: true,
            message: "Payment successful & Order placed! 🎉",
            order,
        });

    } catch (error) {
        next(error)
    }
}