import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";

const EditExpense = () => {
  const { spaceId, expenseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const existingExpense = location.state?.expense || null;

  const [title, setTitle] = useState(existingExpense?.title || "");
  const [amount, setAmount] = useState(existingExpense?.amount || "");
  const [categoryName, setCategoryName] = useState(
    existingExpense?.category?.name || "",
  );

  const [loading, setLoading] = useState(!existingExpense);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    // Fallback fetch if the user refreshed the page and lost router state
    if (!existingExpense) {
      const fetchExpense = async () => {
        try {
          const { data } = await api.get(`/spaces/${spaceId}/dashboard`);
          const expense = data.recentExpenses.find((e) => e._id === expenseId);

          if (expense) {
            setTitle(expense.title);
            setAmount(expense.amount);
            setCategoryName(expense.category?.name || "");
          } else {
            setPageError("Expense not found.");
          }
        } catch (err) {
          console.error(err);
          setPageError("Failed to load expense details.");
        } finally {
          setLoading(false);
        }
      };

      fetchExpense();
    }
  }, [expenseId, existingExpense, spaceId]);

  const handleUpdate = async (e) => {
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
      await api.put(`/expenses/${expenseId}`, {
        title: cleanTitle,
        amount: numAmount,
        categoryName: cleanCategory,
      });

      toast.success("Expense updated successfully!");
      navigate(`/spaces/${spaceId}`);
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.response?.data?.error || "Failed to update expense.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20 text-gray-500">
          Loading expense...
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20 text-red-500">{pageError}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Edit Expense</h1>
            <Link
              to={`/spaces/${spaceId}`}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium transition"
            >
              Cancel
            </Link>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Title
              </label>
              <input
                type="text"
                required
                disabled={loading}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  disabled={loading}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Category
                </label>
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg text-white font-semibold transition ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                }`}
              >
                {loading ? "Saving..." : "Update Expense"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditExpense;
