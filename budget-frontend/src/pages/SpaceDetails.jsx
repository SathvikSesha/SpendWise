import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import { formatCurrency } from "../utils/formatters";

const SpaceDetails = () => {
  const { spaceId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSpaceData = async (isInitialLoad = false) => {
    if (isInitialLoad) setLoading(true);
    try {
      const response = await api.get(`/spaces/${spaceId}/dashboard`);
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load space details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaceData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spaceId]);

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await api.delete(`/expenses/${expenseId}`);
        toast.success("Expense deleted successfully!");
        fetchSpaceData(); // Silent background refresh, no UI flicker!
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed to delete expense.");
      }
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (
      window.confirm(
        "Delete this category AND all its expenses? This cannot be undone.",
      )
    ) {
      try {
        await api.delete(`/categories/${categoryId}`);
        toast.success("Category deleted successfully!");
        fetchSpaceData();
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed to delete category.");
      }
    }
  };

  const handleEditCategory = async (categoryId, oldName) => {
    const newName = window.prompt("Enter new category name:", oldName);
    if (newName && newName.trim() !== "" && newName !== oldName) {
      try {
        await api.put(`/categories/${categoryId}`, { name: newName.trim() });
        toast.success("Category renamed successfully!");
        fetchSpaceData();
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed to rename category.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20 text-gray-500">
          Loading space details...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20 text-red-500">{error}</div>
      </div>
    );
  }

  const { summary, spaceDetails, categoryBreakdown, recentExpenses } = data;
  const progressColor = summary.isOverBudget
    ? "bg-red-600"
    : summary.isThresholdReached
      ? "bg-orange-500"
      : "bg-blue-600";

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-4">
        {/* Navigation & Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/dashboard"
              className="text-sm text-blue-600 hover:underline mb-2 inline-block"
            >
              &larr; Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {spaceDetails.name}
            </h1>
            {spaceDetails.description && (
              <p className="text-gray-600 mt-1">{spaceDetails.description}</p>
            )}
          </div>
          <div className="flex gap-3">
            <Link
              to={`/spaces/${spaceId}/edit`}
              state={{
                space: {
                  name: spaceDetails.name,
                  description: spaceDetails.description,
                  budgetLimit: summary.budgetLimit,
                  thresholdPercent: summary.thresholdPercent,
                },
              }}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition inline-block"
            >
              Edit Space
            </Link>
            <Link
              to={`/spaces/${spaceId}/add-expense`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium inline-block"
            >
              + Add Expense
            </Link>
          </div>
        </div>

        {/* Threshold Warning Banner */}
        {summary.isThresholdReached && !summary.isOverBudget && (
          <div className="mb-6 bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-orange-500 font-bold">⚠️ Warning:</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-orange-700">
                  You have used{" "}
                  <strong>{summary.percentUsed.toFixed(1)}%</strong> of your
                  budget. You are approaching your limit.
                </p>
              </div>
            </div>
          </div>
        )}

        {summary.isOverBudget && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-600 font-bold">🚨 Over Budget:</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  You have exceeded your budget by{" "}
                  <strong>
                    {formatCurrency(Math.abs(summary.remainingBudget))}
                  </strong>
                  !
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Budget Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 font-medium">Total Spent</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {formatCurrency(summary.totalSpent)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 font-medium">
              Remaining Budget
            </p>
            <p
              className={`text-3xl font-bold mt-1 ${
                summary.isOverBudget ? "text-red-600" : "text-green-600"
              }`}
            >
              {formatCurrency(summary.remainingBudget)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 font-medium">Budget Limit</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {formatCurrency(summary.budgetLimit)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="flex justify-between text-sm font-medium mb-2">
            <span className="text-gray-600">
              Usage: {Math.min(summary.percentUsed, 100).toFixed(0)}%
            </span>
            <span className="text-gray-400">
              Threshold: {summary.thresholdPercent}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden relative">
            {/* Threshold Marker */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-gray-400 z-10"
              style={{ left: `${summary.thresholdPercent}%` }}
            ></div>
            <div
              className={`h-3 rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${Math.min(summary.percentUsed, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Categories Column (Left) */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Spending by Category
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {categoryBreakdown.length === 0 ? (
                <p className="p-6 text-gray-500 text-center text-sm">
                  No expenses categorized yet.
                </p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {categoryBreakdown.map((cat) => (
                    <li
                      key={cat._id}
                      className="p-4 flex justify-between items-center hover:bg-gray-50 group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-700 capitalize">
                          {cat.name}
                        </span>
                        {/* Hidden action buttons that appear on hover */}
                        <div className="hidden group-hover:flex gap-2">
                          <button
                            onClick={() =>
                              handleEditCategory(cat._id, cat.name)
                            }
                            className="text-xs text-blue-500 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat._id)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <span className="text-gray-900 font-semibold">
                        {formatCurrency(cat.totalSpent)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Recent Expenses Column (Right) */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Recent Expenses
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {recentExpenses.length === 0 ? (
                <p className="p-6 text-gray-500 text-center">
                  No expenses logged yet. Add your first one!
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                        <th className="p-4 font-medium">Title</th>
                        <th className="p-4 font-medium">Category</th>
                        <th className="p-4 font-medium">Date</th>
                        <th className="p-4 font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {recentExpenses.map((expense) => (
                        <tr
                          key={expense._id}
                          className="hover:bg-gray-50 group"
                        >
                          <td className="p-4 font-medium text-gray-900 flex flex-col">
                            {expense.title}
                            {/* Actions that appear on hover */}
                            <div className="hidden group-hover:flex gap-3 mt-1">
                              <Link
                                to={`/spaces/${spaceId}/edit-expense/${expense._id}`}
                                state={{ expense }}
                                className="text-xs text-blue-500 hover:underline"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => handleDeleteExpense(expense._id)}
                                className="text-xs text-red-500 hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                          <td className="p-4 text-gray-600 capitalize">
                            {expense.category?.name || "Uncategorized"}
                          </td>
                          <td className="p-4 text-gray-500">
                            {new Date(expense.date).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </td>
                          <td className="p-4 text-right font-semibold text-gray-900">
                            {formatCurrency(expense.amount)}
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
      </main>
    </div>
  );
};

export default SpaceDetails;
