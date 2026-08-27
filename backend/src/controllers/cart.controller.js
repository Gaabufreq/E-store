import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

// add Items to cart

export const addToCart = async (req,res,next) => {
    try {
        const {productId, quantity} = req.body
        const userId = req.user.userId

        const qty = Number(quantity) || 1

        const product = await Product.findById(productId)

        if(!product){
            return res.status(404).json({
                success:false,
                message:"Product Not Found"
            });
        }

        if(product.stock < qty){
            return res.status(404).json({
                success:false,
                message:"Not enough stock available ❌"
            });
        }

        let cart = await Cart.findOne({user: userId})

        if(!cart){
            // new cart create hoga
            cart = new Cart({
                user:userId,
                items:[{product:productId, quantity:qty, price: product.price }]
            });
        }else{
            const itemIndex = cart.items.findIndex(
                (item) => item.product.toString() === productId
            );
            if(itemIndex > -1){
                // item exist karta hai , quantity update karo
                cart.items[itemIndex].quantity += qty 
                cart.items[itemIndex].price = product.price 
            }else{
                // new item add kro
                    cart.items.push({product:productId, quantity:qty, price: product.price})
            }
        }

        cart.calculateTotalPrice()
        await cart.save()

        return res.status(200).json({
            success:true,
            message:"Item added to cart successfully ✅",
            cart
        });

    } catch (error) {
        next(error)
    }
};

// get user cart
export const getCart = async (req,res,next) => {
    try {
         const userId = req.user.userId

         const cart = await Cart.findOne({user:userId}).populate("items.product");

         if(!cart){
            return res.status(200).json({
                success:true,
                message:"Cart is empty",
                cart:{items:[], totalCartPrice:0}
            });
         }

         return res.status(200).json({
            success:true,
            cart
         });

    } catch (error) {
        next(error)
    }
}

// update item quantity

export const updateCartItemQuantity = async (req,res,next)=> {
    try {
        const {productId,quantity} = req.body
        const userId = req.user.userId

        if(quantity < 1){
            return res.status(400).json({
                success:false,
                message:"Quantity must be at least 1 ❌",
            });
        }

        // product find karna or stock check krna
        const product = await Product.findById(productId)
        if(!product){
            return res.status(404).json({
                success: false,
                message: "Product not found ❌"
            });
        }

        if(product.stock < quantity){
            return res.status(400).json({
                success: false,
                message: "Not enough stock available ❌"
            });
        }


        const cart = await Cart.findOne({ user : userId })
        if(!cart){
            return res.status(404).json({
                success: false,
                message: "Cart not found ❌"
            });
        }

       const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
       );

       if(itemIndex === -1){
        return res.status(404).json({
                success: false,
                message: "Item not found in cart ❌"
            });
       }

       cart.items[itemIndex].quantity = quantity

       cart.calculateTotalPrice()
       await cart.save()

       return res.status(200).json({
            success: true,
            message: "Cart updated successfully ✅",
            cart
       });

    } catch (error) {
        next(error)
    }
};

// remove items from cart

export const removeFromCart = async (req,res,next) => {
    try {
        // url or body dono se hi product id le sakta hai
        const productId = req.params.productId || req.body.productId;

        const userId = req.user.userId

        const cart = await Cart.findOne({user:userId })
        if(!cart){
            return res.status(404).json({
                success:false,
                message:"Cart not found ❌"
            });
        }

        cart.items = cart.items.filter(
            (item) => item.product.toString() !== productId
        )

        cart.calculateTotalPrice();
        await cart.save()

        return res.status(200).json({
            success:true,
            message:"Item removed from cart ✅",
            cart
        });

    } catch (error) {
        next(error)
    }
}