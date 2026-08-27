import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { updateUserProfile } from "../../api/authApi";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({ name: "", age: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        age: user.age || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateUserProfile(formData);
      if (res.data.success) {
        setUser(res.data.user);
        toast.success(res.data.message || "Profile updated successfully! ✅");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10"
      >
        {/* Header Badge */}
        <div className="flex items-center space-x-4 border-b pb-6 mb-6">
          <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-extrabold text-2xl uppercase">
            {user?.name?.[0] || "U"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 capitalize">
              Role: {user?.role}
            </span>
          </div>
        </div>

        {/* Profile Update Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <h2 className="text-lg font-bold text-gray-800">Edit Profile Details</h2>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email (Cannot be changed)
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ""}
              className="w-full px-4 py-2.5 border rounded-xl bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Age
            </label>
            <input
              type="number"
              name="age"
              required
              min="10"
              max="100"
              value={formData.age}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            disabled={loading}
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition duration-200 disabled:opacity-50 mt-4"
          >
            {loading ? "Updating Profile..." : "Save Changes"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;