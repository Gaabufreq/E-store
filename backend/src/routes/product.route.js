import express from 'express'
import { createProduct, deleteProduct, getAllProducts, getProductById, updateProduct } from '../controllers/product.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/authorization.middleware.js'

const productRoute = express.Router()

productRoute.get("/allproducts", getAllProducts)
productRoute.get("/:id", getProductById)
productRoute.post("/createproduct", authMiddleware, authorize("admin") ,createProduct)
productRoute.put("/:id", authMiddleware, authorize("admin") ,updateProduct)
productRoute.delete("/:id", authMiddleware, authorize("admin"), deleteProduct)
 


export default productRoute