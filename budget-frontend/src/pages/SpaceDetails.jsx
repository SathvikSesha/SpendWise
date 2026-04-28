import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import { formatCurrency } from "../utils/formatters";
import "./SpaceDetails.css";

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

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="sd-root">
        <Navbar />
        <div className="sd-blob sd-blob-1" />
        <div className="sd-blob sd-blob-2" />
        <main className="sd-main">
          <div className="sd-loading">
            <div className="sd-spinner" />
            <p>Loading space details...</p>
          </div>
        </main>
      </div>
    );
  }

  /* ── Error state ── */
  if (error || !data) {
    return (
      <div className="sd-root">
        <Navbar />
        <div className="sd-blob sd-blob-1" />
        <div className="sd-blob sd-blob-2" />
        <main className="sd-main">
          <p className="sd-error-text">{error}</p>
        </main>
      </div>
    );
  }

  const { summary, spaceDetails, categoryBreakdown, recentExpenses } = data;

  const progressColor = summary.isOverBudget
    ? "#ef4444"
    : summary.isThresholdReached
      ? "#f59e0b"
      : "#6366f1";

  return (
    <div className="sd-root" id="space-details-page">
      <Navbar />
      <div className="sd-blob sd-blob-1" />
      <div className="sd-blob sd-blob-2" />

      <main className="sd-main">
        {/* ── Header ── */}
        <motion.div
          className="sd-header"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <Link to="/dashboard" className="sd-back">
              ← Back to Dashboard
            </Link>
            <h1 className="sd-name">{spaceDetails.name}</h1>
            {spaceDetails.description && (
              <p className="sd-desc">{spaceDetails.description}</p>
            )}
          </div>
          <div className="sd-actions">
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
              className="sd-btn-outline"
            >
              Edit Space
            </Link>
            <Link
              to={`/spaces/${spaceId}/add-expense`}
              className="sd-btn-primary"
            >
              + Add Expense
            </Link>
          </div>
        </motion.div>

        {/* ── Warning / Over-budget banners ── */}
        {summary.isThresholdReached && !summary.isOverBudget && (
          <motion.div
            className="sd-banner sd-banner-warn"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
          >
            ⚠️ <span>You've used <strong>{summary.percentUsed.toFixed(1)}%</strong> of your budget. Approaching your limit.</span>
          </motion.div>
        )}

        {summary.isOverBudget && (
          <motion.div
            className="sd-banner sd-banner-danger"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
          >
            🚨 <span>Over budget by <strong>{formatCurrency(Math.abs(summary.remainingBudget))}</strong>!</span>
          </motion.div>
        )}

        {/* ── Stat cards ── */}
        <div className="sd-stats">
          {[
            { label: "Total Spent", value: formatCurrency(summary.totalSpent), color: "#e4e4e7" },
            { label: "Remaining", value: formatCurrency(summary.remainingBudget), color: summary.isOverBudget ? "#f87171" : "#34d399" },
            { label: "Budget Limit", value: formatCurrency(summary.budgetLimit), color: "#a5b4fc" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              className="sd-stat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="sd-stat-label">{s.label}</p>
              <p className="sd-stat-value" style={{ color: s.color }}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Progress bar ── */}
        <motion.div
          className="sd-progress-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="sd-progress-labels">
            <span>Usage: {Math.min(summary.percentUsed, 100).toFixed(0)}%</span>
            <span>Threshold: {summary.thresholdPercent}%</span>
          </div>
          <div className="sd-progress-track">
            <div
              className="sd-threshold-marker"
              style={{ left: `${summary.thresholdPercent}%` }}
            />
            <motion.div
              className="sd-progress-fill"
              style={{ background: progressColor, boxShadow: `0 0 10px ${progressColor}44` }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(summary.percentUsed, 100)}%` }}
              transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* ── Bottom grid: Categories + Expenses ── */}
        <div className="sd-bottom">
          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            <h2 className="sd-section-title">Spending by Category</h2>
            <div className="sd-panel">
              {categoryBreakdown.length === 0 ? (
                <p className="sd-cat-empty">No expenses categorized yet.</p>
              ) : (
                <ul className="sd-cat-list">
                  {categoryBreakdown.map((cat) => (
                    <li key={cat._id} className="sd-cat-item">
                      <div className="sd-cat-left">
                        <span className="sd-cat-name">{cat.name}</span>
                        <div className="sd-cat-actions">
                          <button
                            onClick={() => handleEditCategory(cat._id, cat.name)}
                            className="sd-cat-action sd-cat-action-edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat._id)}
                            className="sd-cat-action sd-cat-action-del"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <span className="sd-cat-amount">
                        {formatCurrency(cat.totalSpent)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>

          {/* Recent Expenses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <h2 className="sd-section-title">Recent Expenses</h2>
            <div className="sd-panel">
              {recentExpenses.length === 0 ? (
                <p className="sd-exp-empty">
                  No expenses logged yet. Add your first one!
                </p>
              ) : (
                <div className="sd-table-wrap">
                  <table className="sd-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th style={{ textAlign: "right" }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentExpenses.map((expense) => (
                        <tr key={expense._id}>
                          <td>
                            <div className="sd-exp-title">{expense.title}</div>
                            <div className="sd-exp-actions">
                              <Link
                                to={`/spaces/${spaceId}/edit-expense/${expense._id}`}
                                state={{ expense }}
                                className="sd-exp-action sd-exp-action-edit"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => handleDeleteExpense(expense._id)}
                                className="sd-exp-action-del"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                          <td className="sd-exp-category">
                            {expense.category?.name || "Uncategorized"}
                          </td>
                          <td>
                            {new Date(expense.date).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </td>
                          <td className="sd-exp-amount">
                            {formatCurrency(expense.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default SpaceDetails;
