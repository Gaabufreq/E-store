import jwt from "jsonwebtoken";
import User from "../models/user.model.js"
import bcrypt from "bcrypt"
import crypto from "crypto";
import { generateToken } from "../utility/generateToken.js";



export const register = async (req,res,next)=>{
try {
    const {name,email,age,password} = req.body

    if(!name || !email || !age || !password){
        return res.status(404).json({message:"All fields are required"});
    }

    const existUser = await User.findOne({email})

    if(existUser){
        return res.status(404).json({
            success:false,
            message:"User already exist!"
        });
    }

     const hashPass = await bcrypt.hash(password,10)

    //  otp for email verificatio 

        const user = await User.create({
            name,
            email,
            age,
            password:hashPass,
        });

        const token = generateToken(user);

        // 🔹 Cookie set karke Auto-Login feature enable kiya gaya hai
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",  
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success:true,
            message:"User registered succeddfully ✅",
            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                age:user.age
            },
        });

} catch (error) {
    next(error)
}
}

export const Login = async (req,res,next) =>{
    const {email, password} = req.body;
    try {
        if(!email || !password){
            return res.status(400).json({message:"All fields are required"})
        }

        const user = await User.findOne({email}).select("+password")
        if(!user){
            return res.status(404).json({
                success:false,
                message:"Invalid user or password"
            });
        }

        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.status(401).json({
                success:false,
                message:"Invalid user or password"
            });
        }

        const token = generateToken(user);

        res.cookie ("token", token ,{
            httpOnly:true,
            secure:true,
            sameSite:"none",  
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success:true,
            message:"Login Successfully ✅",
            user:{
                id:user.id,
                name:user.name,
                email:user.email,
                age:user.age
            },
        });

    } catch (error) {
        next(error)
    }
}

export const getProfile = async(req,res,next) =>{
    try {
        const user = await User.findById(req.user.userId).select("-password")
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }
        return res.status(200).json({
        success:true,
        message:"Profile fetched successfully",
        user
    });
    } catch (error) {
        next(error)
    }
}

export const logOut = async (req,res) =>{
    res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none"
    });

    return res.status(200).json({
        success:true,
        message:"LogOut Successful ✅"
    });
}

export const updateUser = async (req,res,next)=>{
    try {
        const {name, age} = req.body

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            {name,age},
            {
                // returnDocument: "after", // iska matlab hai updated profile show kro
                new:true,
                runValidators:true
            }
        ).select("-password")

        if(!user){
            return res.status(404).json({
                success:false,
                mesage:"User not found"
            });
        }

        return res.status(201).json({
            success:true,
            message:"Profile Updated successfull ✅",
            user
        })

    } catch (error) {
        next(error)
    }
}

export const deleteUser = async (req,res,next)=>{
    try {
        const user = await User.findByIdAndDelete(req.user.userId);

        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found ❌"
            });
        }

        res.clearCookie("token");

        return res.status(200).json({
            success:true,
            message:"Account Delete Successfull ✅"
        })

    } catch (error) {
        next(error)
    }
}

export const forgetPassword = async (req,res,next) =>{
    try {
        const {email} = req.body;

        if(!email){
            return res.status(404).json({
                success:false,
                message:"Email is required ❌"
            });
        }

        const user = await User.findOne({email});

        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found ❌"
            });
        }

        // Temporary resey token 

        const resetToken = crypto.randomBytes(32).toString("hex");

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        return res.status(200).json({
            success:true,
            message:"Password reset token generated ✅",
            resetToken
        });


    } catch (error) {
        next(error);
    }
}

export const resetPassword = async (req,res,next)=>{
   try {
     const {token, newPassword} = req.body;

    if(!token  || !newPassword){
        return res.status(404).json({
            success:false,
            message:"Token and new password are required ❌"
        })
    }
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpire:{$gt:Date.now()}

    });

    if(!user){
        return res.status(400).json({
            success:false,
            message:"Invalid or expired reset token ❌"
        });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    user.resetPasswordToken = null
    user.resetPasswordExpire = null

    await user.save()

    return res.status(200).json({
        success:true,
        message:"Password reset successfull ✅"
    });

   } catch (error) {
    next(error)
   }

}