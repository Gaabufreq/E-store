import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getMyOrders, updateOrderStatus } from "../../api/orderApi";
import Loader from "../../components/common/Loader";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getMyOrders();
      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (error) {
      console.error("Orders fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Cancel Order Handler
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const res = await updateOrderStatus(orderId, "Cancelled");
      if (res.data.success) {
        toast.success("Order cancelled successfully! ❌");
        fetchOrders();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    }
  };

  const getStatusBadge = (status = "") => {
    const s = status.toLowerCase();
    if (s === "delivered") return "bg-emerald-100 text-emerald-700 border-emerald-300";
    if (s === "shipped") return "bg-blue-100 text-blue-700 border-blue-300";
    if (s === "processing" || s === "pending") return "bg-amber-100 text-amber-700 border-amber-300";
    if (s === "cancelled") return "bg-red-100 text-red-700 border-red-300";
    return "bg-purple-100 text-purple-700 border-purple-300";
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
        My Orders 📦
      </h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center max-w-lg mx-auto shadow-sm">
          <div className="text-5xl mb-3">📦</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Orders Found</h2>
          <p className="text-gray-500 text-sm">
            You haven't placed any orders yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const currentStatus = order.orderStatus || "Processing";
            // FIXED: Added "pending" check so users can cancel pending orders as well
            const isCancelable =
              currentStatus.toLowerCase() === "processing" ||
              currentStatus.toLowerCase() === "pending";

            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4"
              >
                {/* Order Header */}
                <div className="flex flex-wrap justify-between items-center border-b pb-4 gap-2">
                  <div>
                    <span className="text-xs text-gray-400 font-semibold uppercase">
                      Order ID
                    </span>
                    <p className="font-mono font-bold text-gray-800 text-sm">
                      #{order._id}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs text-gray-400 font-semibold uppercase">
                      Placed On
                    </span>
                    <p className="text-sm font-medium text-gray-700">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs text-gray-400 font-semibold uppercase">
                      Status
                    </span>
                    <div>
                      <span
                        className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${getStatusBadge(
                          currentStatus
                        )}`}
                      >
                        {currentStatus}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-gray-400 font-semibold uppercase">
                      Total Paid
                    </span>
                    <p className="text-lg font-extrabold text-indigo-600">
                      ₹{order.totalPrice}
                    </p>
                  </div>
                </div>

                {/* Order Items List */}
                <div className="space-y-2">
                  {order.orderItems?.map((item) => (
                    <div
                      key={item._id}
                      className="flex justify-between items-center text-sm py-1"
                    >
                      <span className="font-medium text-gray-700">
                        {item.name} <span className="text-gray-400">× {item.quantity}</span>
                      </span>
                      <span className="font-bold text-gray-900">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Address Summary & Cancel Action */}
                <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-500 flex flex-wrap items-center justify-between gap-3">
                  <span>
                    📍 <strong>Ship to:</strong> {order.shippingAddress?.address},{" "}
                    {order.shippingAddress?.city} ({order.shippingAddress?.postalCode})
                  </span>

                  <div className="flex items-center space-x-4">
                    <span className="font-bold text-gray-700">
                      Method: {order.paymentMethod}
                    </span>

                    {/* VISIBLE IF STATUS IS PROCESSING OR PENDING */}
                    {isCancelable && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="px-4 py-1.5 bg-red-600 text-white font-bold rounded-lg shadow hover:bg-red-700 transition"
                      >
                        Cancel Order ❌
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;