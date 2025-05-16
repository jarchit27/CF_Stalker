// src/pages/Compare/Compare.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Compare = () => {
  const [user1, setUser1] = useState("");
  const [user2, setUser2] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user1.trim() && user2.trim()) {
      navigate(`/compare-result?u1=${user1.trim()}&u2=${user2.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative flex flex-col">
      {/* Back to Home – pinned top-right */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Back to Home
        </button>
      </div>

      {/* Centered container */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-3xl">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
            Compare Profiles
          </h1>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row items-center gap-4"
          >
            <input
              type="text"
              placeholder="Enter first Codeforces handle"
              value={user1}
              onChange={(e) => setUser1(e.target.value)}
              className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Enter second handle"
              value={user2}
              onChange={(e) => setUser2(e.target.value)}
              className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Compare
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Compare;
