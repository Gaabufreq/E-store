import React from "react";

const Loader = () => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-4 h-4 bg-indigo-600 rounded-full animate-bounce"></div>
      <div className="w-4 h-4 bg-indigo-600 rounded-full animate-bounce [animation-delay:-.3s]"></div>
      <div className="w-4 h-4 bg-indigo-600 rounded-full animate-bounce [animation-delay:-.5s]"></div>
    </div>
  );
};

export default Loader;