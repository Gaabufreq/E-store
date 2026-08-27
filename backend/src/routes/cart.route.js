import express from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { addToCart, getCart, removeFromCart, updateCartItemQuantity } from '../controllers/cart.controller.js'

const cartRoute = express.Router()

// logged-in users ke liye sirf hai ye route
cartRoute.use(authMiddleware)

cartRoute.post("/addtocart", addToCart)
cartRoute.get("/getcarts", getCart)
cartRoute.put("/updatecart", updateCartItemQuantity)
cartRoute.delete("/deletecart/:productId", removeFromCart)

export default cartRoute