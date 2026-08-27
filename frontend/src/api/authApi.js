import API from "../api/axiosInstance.js";

export const registerUser = (userData) => API.post("/auth/register", userData);
export const loginUser = (userData) => API.post("/auth/login", userData);
export const getProfile = () => API.get("/auth/profile");
export const logoutUser = () => API.post("/auth/logout");
export const updateUserProfile = (userData) => API.put("/auth/updateprofile", userData);
export const forgotPassword = (emailData) => API.post("/auth/forgetpassword", emailData);
export const resetPassword = (data) => API.post("/auth/resetpassword", data);