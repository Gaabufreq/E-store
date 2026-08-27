import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { createProduct, getAllProducts, deleteProduct } from "../../api/productApi";
import { getAllCategories } from "../../api/categoryApi";
import Loader from "../../components/common/Loader";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "", description: "", price: "", stock: "", category: "", brand: "Generic", imageUrl: "", publicId: ""
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [pRes, cRes] = await Promise.all([getAllProducts(), getAllCategories()]);
      if (pRes.data.success) setProducts(pRes.data.products || []);
      if (cRes.data.success) setCategories(cRes.data.category || []);
    } catch (error) {
      toast.error("Error loading products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        category: form.category,
        brand: form.brand,
        image: [{ url: form.imageUrl, public_id: form.publicId || "default_id" }]
      };
      const res = await createProduct(payload);
      if (res.data.success) {
        toast.success("Product Created! 📦");
        setForm({ name: "", description: "", price: "", stock: "", category: "", brand: "Generic", imageUrl: "", publicId: "" });
        loadData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await deleteProduct(id);
      if (res.data.success) {
        toast.success("Product Deleted ✅");
        loadData();
      }
    } catch (error) {
      toast.error("Failed to delete product ❌");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Manage Products 🛍️</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Product Form */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Add Product</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <input type="text" name="name" required placeholder="Product Name" value={form.name} onChange={handleChange} className="w-full px-3 py-2 border rounded-xl text-sm" />
            <textarea name="description" required placeholder="Description" value={form.description} onChange={handleChange} className="w-full px-3 py-2 border rounded-xl text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" name="price" required placeholder="Price (₹)" value={form.price} onChange={handleChange} className="w-full px-3 py-2 border rounded-xl text-sm" />
              <input type="number" name="stock" required placeholder="Stock" value={form.stock} onChange={handleChange} className="w-full px-3 py-2 border rounded-xl text-sm" />
            </div>
            <select name="category" required value={form.category} onChange={handleChange} className="w-full px-3 py-2 border rounded-xl text-sm bg-white">
              <option value="">Select Category</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <input type="text" name="imageUrl" required placeholder="Image URL (e.g., https://...)" value={form.imageUrl} onChange={handleChange} className="w-full px-3 py-2 border rounded-xl text-sm" />
            <motion.button whileTap={{ scale: 0.96 }} disabled={submitting} type="submit" className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 disabled:opacity-50">
              {submitting ? "Saving..." : "Add Product"}
            </motion.button>
          </form>
        </div>

        {/* Product Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">All Products ({products.length})</h2>
          {loading ? <Loader /> : (
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-xs text-gray-500 uppercase">
                    <th className="p-2">Name</th><th className="p-2">Price</th><th className="p-2">Stock</th><th className="p-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((p) => (
                    <tr key={p._id}>
                      <td className="p-2 font-medium">{p.name}</td>
                      <td className="p-2 font-bold text-indigo-600">₹{p.price}</td>
                      <td className="p-2">{p.stock}</td>
                      <td className="p-2">
                        <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:underline text-xs font-semibold">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;