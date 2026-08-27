import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useCart } from "../../context/CartContext";
import Loader from "../../components/common/Loader";

const Cart = () => {
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = async (productId, newQty, stock) => {
    if (newQty > stock) {
      return toast.error("Cannot add more than available stock ❌");
    }
    try {
      await updateQuantity(productId, newQty);
    } catch (error) {
      toast.error(error || "Failed to update quantity");
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeItem(productId);
      toast.success("Item removed from cart ✅");
    } catch (error) {
      toast.error(error || "Failed to remove item");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const items = cart?.items || [];
  const totalPrice = cart?.totalCartPrice || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
        Shopping Cart 🛒
      </h1>

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-sm border p-12 text-center max-w-lg mx-auto"
        >
          <div className="text-6xl mb-4">🛍️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-500 text-sm mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition"
          >
            Start Shopping
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => {
                const prod = item.product;
                // FIXED LINE 72: String URL, Array Object ({url}) aur Fallback standard URL teeno ko support karega
                const img = typeof prod?.image === "string" ? prod.image : prod?.image?.[0]?.url || "https://via.placeholder.com/100";

                return (
                  <motion.div
                    key={item._id || prod?._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4"
                  >
                    {/* Image */}
                    <img
                      src={img}
                      alt={prod?.name}
                      className="w-20 h-20 object-cover rounded-lg bg-gray-50 flex-shrink-0"
                    />

                    {/* Details */}
                    <div className="flex-grow">
                      <Link
                        to={`/product/${prod?._id}`}
                        className="font-bold text-gray-800 hover:text-indigo-600 line-clamp-1"
                      >
                        {prod?.name || "Product"}
                      </Link>
                      <p className="text-indigo-600 font-extrabold text-sm mt-1">
                        ₹{item.price}
                      </p>

                      {/* Quantity Selector */}
                      <div className="flex items-center space-x-2 mt-3">
                        <div className="flex items-center border rounded-lg bg-gray-50">
                          <button
                            disabled={item.quantity <= 1}
                            onClick={() =>
                              handleQuantityChange(prod._id, item.quantity - 1, prod.stock)
                            }
                            className="px-2 py-0.5 text-gray-600 hover:bg-gray-200 disabled:opacity-40"
                          >
                            -
                          </button>
                          <span className="px-3 text-xs font-bold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            disabled={item.quantity >= prod?.stock}
                            onClick={() =>
                              handleQuantityChange(prod._id, item.quantity + 1, prod.stock)
                            }
                            className="px-2 py-0.5 text-gray-600 hover:bg-gray-200 disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemove(prod._id)}
                          className="text-xs text-red-500 font-medium hover:underline ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Total Subprice */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-400">Total</p>
                      <p className="font-black text-gray-900 text-lg">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Cart Order Summary Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-fit space-y-4">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-3">
              Order Summary
            </h3>

            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal ({items.length} items)</span>
              <span className="font-semibold text-gray-800">₹{totalPrice}</span>
            </div>

            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping Charge</span>
              <span className="font-semibold text-emerald-600">FREE</span>
            </div>

            <hr />

            <div className="flex justify-between text-base font-extrabold text-gray-900">
              <span>Total Payable Amount</span>
              <span className="text-indigo-600">₹{totalPrice}</span>
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/checkout")}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition duration-200"
            >
              Proceed to Checkout
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;