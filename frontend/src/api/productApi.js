import API from "./axiosInstance";

export const getAllProducts = () => API.get("/product/allproducts");
export const getProductById = (id) => API.get(`/product/${id}`);
export const createProduct = (productData) => API.post("/product/createproduct", productData);
export const updateProduct = (id, productData) => API.put(`/product/${id}`, productData);
export const deleteProduct = (id) => API.delete(`/product/${id}`);