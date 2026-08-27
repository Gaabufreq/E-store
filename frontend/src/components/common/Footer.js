import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm">
          © {new Date().getFullYear()} <span className="text-indigo-400 font-semibold">E-Shop</span>. All Rights Reserve.
        </p>
      </div>
    </footer>
  );
};

export default Footer;