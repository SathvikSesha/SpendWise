import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

const CreateSpace = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [budgetLimit, setBudgetLimit] = useState("");
  const [thresholdPercent, setThresholdPercent] = useState(80);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      return setError("Space name is required");
    }

    if (!budgetLimit || Number(budgetLimit) <= 0) {
      return setError("Budget must be greater than 0");
    }

    setLoading(true);

    try {
      await api.post("/spaces", {
        name: name.trim(),
        description: description.trim(),
        budgetLimit: Number(budgetLimit),
        thresholdPercent: Number(thresholdPercent),
      });

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          "Failed to create space. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Create New Space
            </h1>
            <Link
              to="/dashboard"
              className="text-gray-500 hover:text-gray-700 font-medium text-sm transition"
            >
              Cancel
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Space Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Space Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={loading}
                placeholder="e.g., Europe Trip, Monthly Groceries"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description{" "}
                <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows="3"
                disabled={loading}
                placeholder="What is this budget for?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Budget Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Limit (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  disabled={loading}
                  min="1"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                />
              </div>

              {/* Threshold */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alert Threshold (%) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="50"
                    max="100"
                    disabled={loading}
                    className="w-full accent-blue-600"
                    value={thresholdPercent}
                    onChange={(e) =>
                      setThresholdPercent(Number(e.target.value))
                    }
                  />
                  <span className="text-gray-700 font-semibold w-12 text-right">
                    {thresholdPercent}%
                  </span>
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  We'll notify you when you spend ₹
                  {budgetLimit
                    ? ((budgetLimit * thresholdPercent) / 100).toFixed(2)
                    : "0.00"}
                  .
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                }`}
              >
                {loading ? "Creating Space..." : "Create Space"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateSpace;
