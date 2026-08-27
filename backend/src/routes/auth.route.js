import express from "express"
import { deleteUser, forgetPassword, getProfile, Login, logOut, register, resetPassword, updateUser } from "../controllers/auth.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { AdminDashboard, allUsers } from "../controllers/authorization.controller.js"
import { authorize } from "../middleware/authorization.middleware.js"


const authRoute = express.Router()

authRoute.post("/register",register)
authRoute.post("/login",Login)
authRoute.get("/profile",authMiddleware,getProfile)
authRoute.post("/logout", logOut)
authRoute.get("/admindashboard",authMiddleware,authorize("admin") , AdminDashboard)
authRoute.get("/allusers",authMiddleware,authorize("admin") , allUsers);
authRoute.put("/updateprofile", authMiddleware,updateUser)
authRoute.delete("/deleteuser", authMiddleware,deleteUser)
authRoute.post("/forgetpassword", forgetPassword )
authRoute.post("/resetpassword",resetPassword)

export default authRoute