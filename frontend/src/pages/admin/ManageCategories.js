import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { createCategory, getAllCategories } from "../../api/categoryApi";
import Loader from "../../components/common/Loader";

const ManageCategories = () => {
  const [name, setName] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchCats = async () => {
    try {
      const res = await getAllCategories();
      if (res.data.success) {
        setCategories(res.data.category || []);
      }
    } catch (error) {
      toast.error("Failed to load categories ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await createCategory({ name });
      if (res.data.success) {
        toast.success("Category Created! ✅");
        setName("");
        fetchCats();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create category ❌");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Manage Categories 🏷️</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Add New Category</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Electronics, Clothing..."
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              disabled={creating}
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Category"}
            </motion.button>
          </form>
        </div>

        {/* List */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Existing Categories</h2>
          {loading ? (
            <Loader />
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {categories.map((c) => (
                <div key={c._id} className="p-3 bg-gray-50 rounded-xl flex justify-between items-center text-sm font-medium border">
                  <span>{c.name}</span>
                  <span className="text-xs text-gray-400 font-mono">{c.slug}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageCategories;