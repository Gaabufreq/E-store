import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Name is required"],
        minlength:[3, "Name must be atleast 3 characters"]
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        match:[/^\S+@\S+\.\S+$/, "Please enter a valid email"] // ye check krta hai ki name "name@domain.com" is format me ho
    },
    age:{
        type:Number,
        required:true,
        min:[10, "min age must be 10"], // min age 10 honi chahiye
        max:[100, "max age must be 100"] // max age 100 honi chahiye
    },
    password:{
        type:String,
        required:true,
        minlength:[4 ,"password must be atleast 4 characters"],
        select:false  //ye iss liye kiya taaki jab getUser kare to password na show ho output me
    },

    role:{
        type:String,
        enum:["user", "admin"],
        default:"user"
    },
    resetPasswordToken:{
        type:String,
        default:null

    },

        resetPasswordExpire:{
        type:Date,
        default:null

    },

    verificationOtp:{
        type:String,
        default:null
    },

    verificationOtpExpire:{
        type:Date,
        default:null
    }

},{timestamps:true} )

const User = mongoose.model("User", userSchema);
export default User