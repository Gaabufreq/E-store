import express from 'express'
import { createCategory, getAllCategory } from '../controllers/category.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/authorization.middleware.js'

const categoryRoute = express.Router()

categoryRoute.get("/allcategory", getAllCategory)
categoryRoute.post("/createcategory", authMiddleware, authorize("admin"), createCategory)

export default categoryRoute