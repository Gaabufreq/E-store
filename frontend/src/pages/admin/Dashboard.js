import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import API from "../../api/axiosInstance";
import { getAllProducts, createProduct, updateProduct, deleteProduct } from "../../api/productApi";
import { getAllCategories, createCategory } from "../../api/categoryApi";
import { updateOrderStatus } from "../../api/orderApi";
import Loader from "../../components/common/Loader";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("products"); // 'products', 'categories', 'users', 'orders'
  const [loading, setLoading] = useState(true);

  // Data States
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);

  // Form & Edit States
  const [catName, setCatName] = useState("");
  const [isEditing, setIsEditing] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    imageUrl: "",
  });

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [uRes, pRes, cRes, oRes] = await Promise.all([
        API.get("/auth/allusers").catch(() => ({ data: { users: [] } })),
        getAllProducts().catch(() => ({ data: { products: [] } })),
        getAllCategories().catch(() => ({ data: { category: [] } })),
        API.get("/order/allorders").catch(() => ({ data: { orders: [] } })),
      ]);

      setUsers(uRes.data.users || []);
      setProducts(pRes.data.products || []);
      setCategories(cRes.data.category || []);
      setOrders(oRes.data.orders || []);
    } catch (error) {
      toast.error("Error loading dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Category Submit
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createCategory({ name: catName });
      if (res.data.success) {
        toast.success("Category Created! ✅");
        setCatName("");
        loadAllData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create category");
    }
  };

  // Product Add / Update
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        category: productForm.category,
        brand: "Generic",
        image: [{ url: productForm.imageUrl, public_id: "default_id" }],
      };

      if (isEditing) {
        const res = await updateProduct(isEditing, payload);
        if (res.data.success) toast.success("Product Updated! ✏️");
      } else {
        const res = await createProduct(payload);
        if (res.data.success) toast.success("Product Added! 📦");
      }

      setProductForm({ name: "", description: "", price: "", stock: "", category: "", imageUrl: "" });
      setIsEditing(null);
      loadAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  // Product Edit Fill
  const handleEditClick = (p) => {
    setIsEditing(p._id);
    setProductForm({
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      category: p.category?._id || p.category,
      imageUrl: typeof p.image === "string" ? p.image : p.image?.[0]?.url || "",
    });
  };

  // Product Delete
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await deleteProduct(id);
      if (res.data.success) {
        toast.success("Product Deleted ✅");
        loadAllData();
      }
    } catch (err) {
      toast.error("Failed to delete product");
    }
  };

  // Order Status Update
  const handleOrderStatus = async (id, status) => {
    try {
      const res = await updateOrderStatus(id, status);
      if (res.data.success) {
        toast.success("Order status updated!");
        loadAllData();
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Admin Central Dashboard 👑</h1>

      {/* --- DASHBOARD NAVIGATION TABS --- */}
      <div className="flex space-x-2 border-b mb-8 overflow-x-auto pb-2">
        {[
          { id: "products", label: `Products (${products.length})` },
          { id: "categories", label: `Categories (${categories.length})` },
          { id: "orders", label: `Orders (${orders.length})` },
          { id: "users", label: `Users (${users.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-100 border"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- TAB 1: PRODUCTS MANAGEMENT --- */}
      {activeTab === "products" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add / Edit Form */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {isEditing ? "Edit Product ✏️" : "Add New Product 📦"}
            </h2>
            <form onSubmit={handleProductSubmit} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Product Name"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-sm"
              />
              <textarea
                required
                placeholder="Description"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  required
                  placeholder="Price (₹)"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
                <input
                  type="number"
                  required
                  placeholder="Stock"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>
              <select
                required
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-sm bg-white"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                required
                placeholder="Image URL"
                value={productForm.imageUrl}
                onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-sm"
              />
              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700"
                >
                  {isEditing ? "Update Product" : "Create Product"}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(null);
                      setProductForm({ name: "", description: "", price: "", stock: "", category: "", imageUrl: "" });
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl text-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Product List Table */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">All Products List</h2>
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-xs text-gray-500 uppercase">
                    <th className="p-3">Name</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((p) => (
                    <tr key={p._id}>
                      <td className="p-3 font-semibold text-gray-800">{p.name}</td>
                      <td className="p-3 font-bold text-indigo-600">₹{p.price}</td>
                      <td className="p-3">{p.stock}</td>
                      <td className="p-3 space-x-3">
                        <button
                          onClick={() => handleEditClick(p)}
                          className="text-indigo-600 font-bold hover:underline text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p._id)}
                          className="text-red-500 font-bold hover:underline text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: CATEGORIES MANAGEMENT --- */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Add Category</h2>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <input
                type="text"
                required
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="Category Name (e.g. Shoes, Laptops)"
                className="w-full px-4 py-2 border rounded-xl text-sm"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700"
              >
                Create Category
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Existing Categories</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {categories.map((c) => (
                <div key={c._id} className="p-3 bg-gray-50 rounded-xl flex justify-between items-center text-sm font-medium border">
                  <span>{c.name}</span>
                  <span className="text-xs text-gray-400 font-mono">{c.slug || c._id}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: ORDERS MANAGEMENT --- */}
      {activeTab === "orders" && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            All Customer Orders ({orders.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-xs text-gray-500 uppercase">
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Current Status</th>
                  <th className="p-3">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-gray-400">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => {
                    const isCancelled = o.orderStatus?.toLowerCase() === "cancelled";

                    return (
                      <tr key={o._id} className={isCancelled ? "bg-red-50/50" : "hover:bg-gray-50/50"}>
                        <td className="p-3 font-mono font-bold text-xs">#{o._id}</td>
                        <td className="p-3">
                          <p className="font-semibold text-gray-800">{o.user?.name || "N/A"}</p>
                          <p className="text-xs text-gray-400">{o.user?.email}</p>
                        </td>
                        <td className="p-3 text-xs text-gray-600">
                          {o.orderItems?.map((item, idx) => (
                            <div key={idx} className="line-clamp-1">
                              • {item.name} <span className="font-bold text-indigo-600">×{item.quantity}</span>
                            </div>
                          ))}
                        </td>
                        <td className="p-3 font-extrabold text-indigo-600">₹{o.totalPrice}</td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                              isCancelled
                                ? "bg-red-100 text-red-700 border-red-300"
                                : o.orderStatus === "Delivered"
                                ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                                : o.orderStatus === "Shipped"
                                ? "bg-blue-100 text-blue-700 border-blue-300"
                                : "bg-amber-100 text-amber-700 border-amber-300"
                            }`}
                          >
                            {o.orderStatus} {isCancelled && "❌"}
                          </span>
                        </td>
                        <td className="p-3">
                          <select
                            value={o.orderStatus}
                            onChange={(e) => handleOrderStatus(o._id, e.target.value)}
                            className="px-2 py-1 border rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 4: USERS LIST --- */}
      {activeTab === "users" && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Registered Users List</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Age</th>
                  <th className="p-3">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/50">
                    <td className="p-3 font-semibold text-gray-800">{u.name}</td>
                    <td className="p-3 text-gray-600">{u.email}</td>
                    <td className="p-3 text-gray-600">{u.age}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;