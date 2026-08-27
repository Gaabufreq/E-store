import API from "./axiosInstance";

export const getAllCategories = () => API.get("/category/allcategory");
export const createCategory = (categoryData) => API.post("/category/createcategory", categoryData);