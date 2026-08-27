import User from "../models/user.model.js"


    export const AdminDashboard = async (req,res) =>{
        return res.status(200).json({
            success:true,
            message:"Welcome to Admin Dashboard✅"
        })
    }

    export const allUsers = async (req,res,next) =>{
    try {
        const users = await User.find().select("-password")

        return res.status(200).json({
            success:true,
            message:"users fetched successfully ✅",
            users
        });


    } catch (error) {
        next(error);
    }
}