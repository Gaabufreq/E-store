import API from "./axiosInstance";

export const getCart = () => API.get("/cart/getcarts");
export const addToCart = (productId, quantity) => API.post("/cart/addtocart", { productId, quantity });
export const updateCartQuantity = (productId, quantity) => API.put("/cart/updatecart", { productId, quantity });
export const removeFromCart = (productId) => {return API.delete(`/cart/deletecart/${productId}`);}