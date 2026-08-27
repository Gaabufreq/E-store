import mongoose from "mongoose";

const connectdb = async () =>{
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Database connected successfully ✅")
    } catch (error) {
        console.error("Error connecting to database:", error.message)
    }
}
export default connectdb;