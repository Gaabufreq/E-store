import React, { createContext, useContext, useState, useEffect } from "react";
import { getProfile, loginUser, logoutUser, registerUser } from "../api/authApi.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // App load hote hi profile check karke user set karein
  const checkAuthStatus = async () => {
    try {
      const res = await getProfile();
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (userData) => {
    const res = await loginUser(userData);
    if (res.data.success) {
      setUser(res.data.user)
    }
    return res.data;
  };

  const register = async (userData) => {
    const res = await registerUser(userData);
    if (res.data.success) {
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 