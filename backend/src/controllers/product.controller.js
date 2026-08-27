import Product from "../models/product.model.js";



// only admin

export const createProduct = async (req,res,next) =>{
 try {
    const {name, description,price,stock,category,brand,image} = req.body

 if(!name || !description || !price || !stock || !category || !brand || !image){
    return res.status(400).json({
        success:false,
        messgae:"All fields are required ❌"
    });
 }

 const product = await Product.create({
    name, 
    description,
    price,
    stock,
    category,
    brand,
    image
 });

 return res.status(201).json({
    success:true,
    message:"Product created successfully ✅",
    product
 });
 } catch (error) {
    console.log(error);
    next(error)
 }

}

// public

export const getAllProducts = async (req,res,next) => {
   try {
     const products = await Product.find().populate("category","name slug")

    return res.status(200).json({
        success:true,
        message:"Products fetched successfully ✅",
        count: products.length,
        products
    });

   } catch (error) {
    next(error)
   }
};

// public

export const getProductById = async (req,res,next) =>{
    try {
        const product = await Product.findById(req.params.id).populate("category", "name slug")

        if(!product){
            return res.status(404).json({
                success:false,
                message:"Product not founded ❌",
            });
        }

        return res.status(200).json({
            success:true,
            product
        });

    } catch (error) {
        next(error)
    }
}

// admin only 

export const updateProduct = async (req,res,next) =>{
    try {
        const product = await Product.findByIdAndUpdate(req.params.id,req.body, { new:true, runValidators:true })

        if(!product){
            return res.status(404).json({
                success:true,
                message:"Product not found ❌"
            });
        }

        return res.status(200).json({
            success:true,
            message:"Product updated successfully ✅",
            product
        });

    } catch (error) {
        next(error)
    }
}

// admin only

export const deleteProduct = async (req,res,next) =>{
   try {
     const product = await Product.findByIdAndDelete(req.params.id)

    if(!product){
        return res.status(404).json({
            success:false,
            message:"Product not found ❌"
        });
    }

    return res.status(200).json({
        success:true,
        message:"Product deleted successfully ✅"
    })
   } catch (error) {
    next(error)
   }
}