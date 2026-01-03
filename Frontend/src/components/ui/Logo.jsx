import React from "react";

const Logo = ({ size = "md", clickable = true }) => {
  const sizes = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10",
    xl: "h-14",
  };

  return (
    <div
      className={`flex items-center gap-2 ${
        clickable ? "cursor-pointer" : ""
      }`}
    >
      {/* ICON */}
      <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-lg">R</span>
      </div>

      {/* TEXT */}
      <span
        className={`font-bold text-xl ${
          sizes[size]
        } bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}
      >
        RideShare
      </span>
    </div>
  );
};

export default Logo;
