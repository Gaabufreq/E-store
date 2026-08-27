import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true,
        min:0
    },
    stock:{
            type:Number,
            required:true,
            min:0,
            default:0
    },
    image:[
        {
            url: {type: String, required:true},
            public_id: {type:String, required:true} // cloudinary ke liye hai 
        }
    ],
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required:true
    },
    
    ratings:{
        type:Number,
        default:0
    },
    numReview:{
        type:Number,
        default:0
    },
}, {timestamps:true})

productSchema.index({name:"text", description:"text"})

const Product = mongoose.model("Product", productSchema)
export default Product