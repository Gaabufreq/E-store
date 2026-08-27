import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { createOrder, createRazorpayOrder, verifyPayment } from "../../api/orderApi";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const Checkout = () => {
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    address: "",
    city: "",
    postalCode: "",
    country: "India",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD"); // 'COD' or 'Razorpay'
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // 🌟 Success Animation Modal State

  const handleChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!cart?.items || cart.items.length === 0) {
      return toast.error("Your cart is empty! ❌");
    }

    setLoading(true);

    // 1️⃣ CASH ON DELIVERY (COD) FLOW
    if (paymentMethod === "COD") {
      try {
        const res = await createOrder({ shippingAddress, paymentMethod: "COD" });
        if (res.data.success) {
          toast.success("Order Placed Successfully! 🎉");
          await fetchCart();
          navigate("/my-orders");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to place order ❌");
      } finally {
        setLoading(false);
      }
    } 
    
    // 2️⃣ RAZORPAY ONLINE PAYMENT FLOW
    else if (paymentMethod === "Razorpay") {
      try {
        // Step A: Backend se Razorpay order_id aur key ID lein
        const { data } = await createRazorpayOrder();

        if (!data.success) {
          throw new Error("Razorpay Order creation failed");
        }

        // Step B: Razorpay Popup Window Configuration
        const options = {
          key: data.key,
          amount: data.order.amount,
          currency: data.order.currency,
          name: "E-Shop",
          description: "Purchase Payment",
          order_id: data.order.id,
          handler: async function (response) {
            // Step C: Payment Success hone par Backend signature verify karayein
            try {
              const verifyRes = await verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                shippingAddress,
              });

              if (verifyRes.data.success) {
                toast.success("Payment Successful! 🎉");
                await fetchCart();
                
                // 🌟 Trigger Success Animation Screen
                setIsSuccess(true);

                // 🌟 2.5 seconds animation dikhne ke baad Redirect karein
                setTimeout(() => {
                  navigate("/my-orders");
                }, 2500);
              }
            } catch (err) {
              toast.error(err.response?.data?.message || "Payment Verification Failed ❌");
            }
          },
          prefill: {
            name: user?.name || "",
            email: user?.email || "",
          },
          theme: {
            color: "#4F46E5",
          },
        };

        const razorpayWindow = new window.Razorpay(options);
        razorpayWindow.open();
      } catch (error) {
        toast.error(error.response?.data?.message || "Payment failed to initiate ❌");
      } finally {
        setLoading(false);
      }
    }
  };

  const totalPrice = cart?.totalCartPrice || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      
      {/* 🌟 PAYMENT SUCCESS ANIMATION OVERLAY */}
      {isSuccess && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4 shadow-inner"
          >
            <motion.svg 
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
              className="w-12 h-12 text-green-600 stroke-current stroke-[3]" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </motion.svg>
          </motion.div>

          <motion.h2 
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-gray-800"
          >
            Payment Successful!
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-500 mt-2 text-sm"
          >
            Redirecting to your orders...
          </motion.p>
        </motion.div>
      )}

      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Checkout 🚚</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping & Payment Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-3">
            Shipping Details
          </h2>

          <form onSubmit={handlePlaceOrder} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                name="address"
                required
                value={shippingAddress.address}
                onChange={handleChange}
                placeholder="House No, Street, Landmark"
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={shippingAddress.city}
                  onChange={handleChange}
                  placeholder="New Delhi"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  required
                  value={shippingAddress.postalCode}
                  onChange={handleChange}
                  placeholder="110001"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  required
                  value={shippingAddress.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="pt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select Payment Method
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* COD Option */}
                <label
                  className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer transition ${
                    paymentMethod === "COD"
                      ? "border-indigo-600 bg-indigo-50/50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-bold text-gray-800 text-sm">
                      Cash on Delivery (COD)
                    </span>
                  </div>
                </label>

                {/* Razorpay Option */}
                <label
                  className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer transition ${
                    paymentMethod === "Razorpay"
                      ? "border-indigo-600 bg-indigo-50/50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Razorpay"
                      checked={paymentMethod === "Razorpay"}
                      onChange={() => setPaymentMethod("Razorpay")}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-bold text-gray-800 text-sm">
                      Online Payment (Razorpay)
                    </span>
                  </div>
                  <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded font-bold">
                    UPI / Card
                  </span>
                </label>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition duration-200 disabled:opacity-50 mt-6"
            >
              {loading
                ? "Processing..."
                : paymentMethod === "Razorpay"
                ? `Pay Now (₹${totalPrice})`
                : `Confirm Order (₹${totalPrice})`}
            </motion.button>
          </form>
        </motion.div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit space-y-4">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-3">
            Items in Order
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {cart?.items?.map((item) => (
              <div key={item._id} className="flex justify-between items-center text-sm">
                <span className="line-clamp-1 text-gray-700 font-medium">
                  {item.product?.name}{" "}
                  <span className="text-xs text-gray-400">x{item.quantity}</span>
                </span>
                <span className="font-bold text-gray-900">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <hr />

          <div className="flex justify-between text-lg font-extrabold text-gray-900">
            <span>Total</span>
            <span className="text-indigo-600">₹{totalPrice}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;