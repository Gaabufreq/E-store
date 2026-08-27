import app from "./app.js";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "../src/db/db.js"; 

const PORT = process.env.PORT || 8000;

app.listen(PORT, () =>{
connectDB();
    console.log(`Server is running on port ${PORT} 🚀`)
})