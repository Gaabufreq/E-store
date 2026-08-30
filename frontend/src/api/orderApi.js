import API from "./axiosInstance";

export const createOrder = (orderData) => API.post("/order/createorder", orderData);
export const getMyOrders = () => API.get("/order/myorders");
export const getOrderById = (id) => API.get(`/order/${id}`);
export const updateOrderStatus = (id, orderStatus) => API.put(`/order/status/${id}`, { orderStatus });
export const cancelMyOrder = (id) => API.put(`/order/cancel/${id}`); // 👈 Add this API function

// 🔹 Razorpay API Endpoints
export const createRazorpayOrder = () => API.post("/order/razorpay-order");
export const verifyPayment = (paymentData) => API.post("/order/verify-payment", paymentData);