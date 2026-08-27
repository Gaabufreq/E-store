import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // Cookies pass karne ke liye zaroori hai
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;