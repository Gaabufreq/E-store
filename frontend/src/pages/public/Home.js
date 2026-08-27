import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getAllProducts } from "../../api/productApi";
import { getAllCategories } from "../../api/categoryApi";
import ProductCard from "../../components/products/ProductCard";
import Loader from "../../components/common/Loader";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          getAllProducts(),
          getAllCategories(),
        ]);

        if (prodRes.data.success) {
          setProducts(prodRes.data.products || []);
        }
        if (catRes.data.success) {
          setCategories(catRes.data.category || []);
        }
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Category ke basis par products filter karein
  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category?._id === selectedCategory);

  return (
    <div className="min-h-screen pb-12">
      {/* --- HERO BANNER --- */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 px-4 mb-8 shadow-inner">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto text-center"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Discover Exceptional Products
          </h1>
          <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto font-light">
            Shop the best deals on fashion, tech, electronics, and lifestyle items.
          </p>
        </motion.div>
      </section>

      {/* --- MAIN CONTENT CONTAINER --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap ${
              selectedCategory === "all"
                ? "bg-indigo-600 text-white shadow"
                : "bg-white text-gray-700 hover:bg-gray-100 border"
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap ${
                selectedCategory === cat._id
                  ? "bg-indigo-600 text-white shadow"
                  : "bg-white text-gray-700 hover:bg-gray-100 border"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Grid Section */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border">
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Products Found</h3>
            <p className="text-gray-500 text-sm">
              Try selecting a different category or check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;