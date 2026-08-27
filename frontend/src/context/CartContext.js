import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getCart, addToCart, updateCartQuantity, removeFromCart } from "../api/cartApi";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], totalCartPrice: 0 });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // useCallback mein wrap kiya taaki missing-dependency warning na aaye
  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [], totalCartPrice: 0 });
      return;
    }
    try {
      setLoading(true);
      const res = await getCart();
      if (res.data.success) {
        setCart(res.data.cart || { items: [], totalCartPrice: 0 });
      }
    } catch (error) {
      console.error("Cart fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]); // FIXED

  const addItemToCart = async (productId, quantity = 1) => {
    try {
      const res = await addToCart(productId, quantity);
      if (res.data.success) {
        await fetchCart();
      }
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || "Error adding item to cart";
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await updateCartQuantity(productId, quantity);
      if (res.data.success) {
        await fetchCart();
      }
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || "Error updating quantity";
    }
  };

  const removeItem = async (productId) => {
    try {
      const res = await removeFromCart(productId);
      if (res.data.success) {
        await fetchCart();
      }
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || "Error removing item";
    }
  };

  return (
    <CartContext.Provider value={{ cart, loading, fetchCart, addItemToCart, updateQuantity, removeItem }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);