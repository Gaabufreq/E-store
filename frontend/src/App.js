import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminRoute from "./components/common/AdminRoute";

// Public Pages
import Home from "./pages/public/Home"; 
import ProductDetails from "./pages/public/ProductDetails";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";


// User Protected Pages
import Cart from "./pages/user/Cart";
import Checkout from "./pages/user/Checkout";
import MyOrders from "./pages/user/MyOrders";
import Profile from "./pages/user/Profile";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import ManageCategories from "./pages/admin/ManageCategories";
import ManageProducts from "./pages/admin/ManageProducts";
import ManageOrders from "./pages/admin/ManageOrders";

const Placeholder = ({ title }) => (
  <div className="min-h-[70vh] flex items-center justify-center text-2xl font-bold text-gray-700">
    {title} Page
  </div>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Toaster position="top-right" reverseOrder={false} />
        <Navbar />

        <main className="flex-grow">
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* USER PROTECTED ROUTES */}
            <Route element={<ProtectedRoute />}>
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* ADMIN PROTECTED ROUTES */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/products" element={<ManageProducts />} />
              <Route path="/admin/categories" element={<ManageCategories />} />
              <Route path="/admin/orders" element={<ManageOrders />} />
            </Route>

            {/* 404 PAGE */}
            <Route path="*" element={<Placeholder title="404 Page Not Found" />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;