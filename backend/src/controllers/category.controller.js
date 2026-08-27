import Category from '../models/category.model.js'

export const createCategory = async (req,res,next) =>{
    try {
        const {name} = req.body

        if(!name){
            return res.status(404).json({
                success:false,
                message:"Name must be required ❌"
            })
        }

        const slug = name.toLowerCase().trim().replace( /\s+/g , "-" );

        const category = await Category.create({name , slug})

        return res.status(201).json({
            success:true,
            message:"Category created ✅",
            category
        })
        
    } catch (error) {
        next(error)
    }
};

export const getAllCategory = async (req,res,next) => {
    try {
        const category = await Category.find();
        return res.status(200).json({
            success:true,
            category
        });

    } catch (error) {
        next(error);
    }
};