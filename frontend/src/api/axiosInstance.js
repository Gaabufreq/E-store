import axios from "axios";

const API = axios.create({
  baseURL: "https://e-store-yp7z.onrender.com/api",
  withCredentials: true, // Cookies pass karne ke liye zaroori hai
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;
