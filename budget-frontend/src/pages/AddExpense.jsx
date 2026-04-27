import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";

const AddExpense = () => {
  const { spaceId } = useParams();
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryName, setCategoryName] = useState("");

  // UI State
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Strict Client-Side Validation
    const cleanTitle = title.trim();
    const cleanCategory = categoryName.trim();
    const numAmount = Number(amount);

    if (!cleanTitle || !cleanCategory) {
      return toast.error("Title and Category cannot be empty.");
    }
    if (numAmount <= 0) {
      return toast.error("Amount must be greater than zero.");
    }

    setLoading(true);

    // 2. Standardized API Call
    try {
      await api.post("/expenses", {
        title: cleanTitle,
        amount: numAmount,
        spaceId,
        categoryName: cleanCategory,
      });

      toast.success("Expense added successfully!");
      navigate(`/spaces/${spaceId}`);
    } catch (err) {
      console.error("Expense creation error:", err);
      toast.error(
        err.response?.data?.error || "Failed to add expense. Please try again.",
      );
    } finally {
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
              Log New Expense
            </h1>
            <Link
              to={`/spaces/${spaceId}`}
              className="text-gray-500 hover:text-gray-700 font-medium text-sm transition"
            >
              Cancel
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What did you buy? <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Uber to Airport, Morning Coffee"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Food, Transport, Bills"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Type a new or existing category.
                </p>
              </div>
            </div>

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
                {loading ? "Saving..." : "Add Expense"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddExpense;
