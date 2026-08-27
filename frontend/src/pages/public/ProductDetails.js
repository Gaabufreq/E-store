import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getProductById } from "../../api/productApi";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/common/Loader";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItemToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await getProductById(id);
        if (res.data.success) {
          setProduct(res.data.product);
        }
      } catch (error) {
        toast.error("Failed to load product details ❌");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add items to cart!");
      return navigate("/login");
    }

    setAdding(true);
    try {
      await addItemToCart(product._id, quantity);
      toast.success(`${quantity} ${product.name} added to cart! 🛒`);
    } catch (error) {
      toast.error(error || "Failed to add item ❌");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Product Not Found</h2>
        <Link to="/" className="text-indigo-600 font-semibold hover:underline">
          Go back to Home
        </Link>
      </div>
    );
  }

  const imageUrl =
    product?.image?.[0]?.url ||
    "https://via.placeholder.com/500x500?text=No+Image";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative bg-white rounded-2xl shadow-md border border-gray-100 p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-10"
      >
        {/* 🔹 CLOSE BUTTON (Top-Right Corner) */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          title="Close details"
          className="absolute top-4 right-4 z-20 w-8 h-8 bg-gray-100 hover:bg-red-500 hover:text-white text-gray-600 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow-sm"
        >
          ✕
        </button>

        {/* Product Image */}
        <div className="w-full h-80 md:h-[450px] bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center border">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Information */}
        <div className="flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
              {product.category?.name || "General"}
            </span>

            <h1 className="text-3xl font-extrabold text-gray-900 mt-3 mb-2 pr-6">
              {product.name}
            </h1>

            {/* Price & Stock */}
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-3xl font-black text-gray-900">
                ₹{product.price}
              </span>

              {product.stock > 0 ? (
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                  In Stock ({product.stock} left)
                </span>
              ) : (
                <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">
                  Out of Stock
                </span>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed text-sm mb-6">
              {product.description}
            </p>
          </div>

          {/* Quantity Selector & Add to Cart */}
          <div className="border-t pt-6 space-y-4">
            {product.stock > 0 && (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-semibold text-gray-700">Quantity:</span>
                <div className="flex items-center border rounded-lg overflow-hidden bg-gray-50">
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 font-bold text-gray-800 text-sm">
                    {quantity}
                  </span>
                  <button
                    disabled={quantity >= product.stock}
                    onClick={() => setQuantity((prev) => Math.min(product.stock, prev + 1))}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.96 }}
              disabled={product.stock <= 0 || adding}
              onClick={handleAddToCart}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? "Adding to Cart..." : "Add to Cart 🛒"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductDetails;