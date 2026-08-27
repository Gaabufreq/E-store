import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { getAllProducts } from "../../api/productApi";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // 🔹 Mobile Menu State
  const navigate = useNavigate();

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Cart count calculation
  const totalCartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  useEffect(() => {
    const fetchProductsForSearch = async () => {
      try {
        const res = await getAllProducts();
        if (res.data.success) {
          setAllProducts(res.data.products || []);
        }
      } catch (error) {
        console.error("Search products load error:", error);
      }
    };
    fetchProductsForSearch();
  }, []);

  // Live Filtering Logic
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim().length > 0) {
      const query = value.toLowerCase();

      const filtered = allProducts.filter((p) => {
        const productNameMatch = p.name?.toLowerCase().includes(query);
        const categoryName = typeof p.category === "object" ? p.category?.name : p.category;
        const categoryMatch = categoryName?.toLowerCase().includes(query);

        return productNameMatch || categoryMatch;
      });

      setSearchResults(filtered);
      setShowSearchDropdown(true);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  };

  const handleProductSelect = (productId) => {
    setShowSearchDropdown(false);
    setSearchQuery("");
    setMobileMenuOpen(false);
    navigate(`/product/${productId}`);
  };

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate("/login");
  };

  return (
    <motion.nav 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white shadow-md sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-2 sm:gap-4">
          
          {/* Logo */}
          <Link to="/" className="text-xl sm:text-2xl font-bold text-indigo-600 tracking-wide flex-shrink-0">
            E-Shop<span className="text-gray-800">.</span>
          </Link>

          {/* 🔹 DESKTOP LIVE SEARCH BAR */}
          <div className="relative flex-1 max-w-md mx-2 hidden md:block">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
              placeholder="Search by product or category..."
              className="w-full px-4 py-1.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-indigo-600 bg-gray-50 focus:bg-white transition"
            />

            {/* Live Search Autocomplete Dropdown */}
            <AnimatePresence>
              {showSearchDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-72 overflow-y-auto z-50 divide-y"
                >
                  {searchResults.length > 0 ? (
                    searchResults.map((product) => {
                      const img = typeof product.image === "string" 
                        ? product.image 
                        : product.image?.[0]?.url || "https://via.placeholder.com/40";
                      
                      const catName = typeof product.category === "object" ? product.category?.name : product.category;

                      return (
                        <div
                          key={product._id}
                          onClick={() => handleProductSelect(product._id)}
                          className="flex items-center space-x-3 p-3 hover:bg-indigo-50 cursor-pointer transition"
                        >
                          <img
                            src={img}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-md bg-gray-100 flex-shrink-0"
                          />
                          <div className="flex-grow">
                            <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                              {product.name}
                            </p>
                            <div className="flex items-center justify-between mt-0.5">
                              <p className="text-xs font-bold text-indigo-600">
                                ₹{product.price}
                              </p>
                              {catName && (
                                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                                  {catName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-xs text-gray-400">
                      No matching products or categories found 🔍
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Nav Links & Actions */}
          <div className="hidden md:flex items-center space-x-6 flex-shrink-0">
            <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium transition">
              Home
            </Link>

            {user && (
              <Link to="/my-orders" className="text-gray-600 hover:text-indigo-600 font-medium transition">
                My Orders
              </Link>
            )}

            {/* Cart Icon */}
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-indigo-600 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {totalCartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key={totalCartCount}
                  className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
                >
                  {totalCartCount}
                </motion.span>
              )}
            </Link>

            {/* Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 text-gray-700 font-medium focus:outline-none"
                >
                  <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold uppercase">
                    {user.name[0]}
                  </span>
                  <span>{user.name}</span>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-50 border border-gray-100"
                    >
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                      >
                        Profile
                      </Link>
                      <Link
                        to="/my-orders"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                      >
                        My Orders
                      </Link>

                      {user.role === "admin" && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-indigo-600 font-semibold hover:bg-indigo-50"
                        >
                          Admin Dashboard
                        </Link>
                      )}

                      <hr className="my-1 border-gray-200" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* 🔹 MOBILE ACTIONS (Cart + Hamburger Toggle) */}
          <div className="flex items-center space-x-2 md:hidden">
            <Link to="/cart" className="relative p-2 text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {totalCartCount > 0 && (
                <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {totalCartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* 🔹 MOBILE EXPANDABLE MENU & SEARCH */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 px-4 pt-3 pb-6 space-y-4"
          >
            {/* Mobile Search Bar */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search products..."
                className="w-full px-4 py-2 border rounded-full text-sm bg-gray-50 focus:outline-none focus:border-indigo-600"
              />
              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border max-h-56 overflow-y-auto z-50 divide-y">
                  {searchResults.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => handleProductSelect(product._id)}
                      className="p-3 text-sm hover:bg-indigo-50 cursor-pointer"
                    >
                      <p className="font-semibold text-gray-800">{product.name}</p>
                      <p className="text-xs text-indigo-600 font-bold">₹{product.price}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Navigation Links */}
            <div className="flex flex-col space-y-3 pt-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 font-medium py-1"
              >
                Home
              </Link>

              {user ? (
                <>
                  <Link
                    to="/my-orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-700 font-medium py-1"
                  >
                    My Orders
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-700 font-medium py-1"
                  >
                    Profile
                  </Link>

                  {user.role === "admin" && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-indigo-600 font-semibold py-1"
                    >
                      Admin Dashboard
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="text-left text-red-600 font-medium py-1"
                  >
                    Logout ({user.name})
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-indigo-600 border border-indigo-600 rounded-lg font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 bg-indigo-600 text-white rounded-lg font-medium"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;