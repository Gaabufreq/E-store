import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const ProductCard = ({ product }) => {
  const { addItemToCart } = useCart();
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to add items to cart!");
      return navigate("/login");
    }

    setAdding(true);
    try {
      await addItemToCart(product._id, 1);
      toast.success(`${product.name} added to cart! 🛒`);
    } catch (error) {
      toast.error(error || "Failed to add item ❌");
    } finally {
      setAdding(false);
    }
  };

  // Image URL handle karne ke liye fallbacks
  const imageUrl =
    product?.image?.[0]?.url ||
    "https://via.placeholder.com/300x300?text=No+Image";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col justify-between border border-gray-100 hover:shadow-xl transition-all"
    >
      <Link to={`/product/${product._id}`} className="block relative group">
        <div className="w-full h-48 overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        </div>

        {/* Stock Badge */}
        {product.stock <= 0 ? (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">
            Out of Stock
          </span>
        ) : (
          <span className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded font-bold">
            In Stock
          </span>
        )}
      </Link>

      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          {/* Category */}
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            {product.category?.name || "General"}
          </span>

          {/* Title */}
          <Link to={`/product/${product._id}`}>
            <h3 className="text-lg font-bold text-gray-800 hover:text-indigo-600 line-clamp-1 mt-1 transition">
              {product.name}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-gray-500 text-xs line-clamp-2 mt-1">
            {product.description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-medium">Price</span>
            <p className="text-xl font-extrabold text-gray-900">
              ₹{product.price}
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.92 }}
            disabled={product.stock <= 0 || adding}
            onClick={handleAddToCart}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {adding ? "Adding..." : "Add to Cart"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;