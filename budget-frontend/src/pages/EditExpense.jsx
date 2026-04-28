import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import "./FormPage.css";

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
      <div className="form-page">
        <Navbar />
        <div className="form-blob form-blob-1" />
        <div className="form-blob form-blob-2" />
        <main className="form-main">
          <div className="form-card">
            <div className="form-loading">
              <div className="form-spinner" />
              <p>Loading expense...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="form-page">
        <Navbar />
        <div className="form-blob form-blob-1" />
        <div className="form-blob form-blob-2" />
        <main className="form-main">
          <div className="form-card">
            <div className="form-loading">
              <p style={{ color: "#f87171" }}>{pageError}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="form-page" id="edit-expense-page">
      <Navbar />
      <div className="form-blob form-blob-1" />
      <div className="form-blob form-blob-2" />

      <main className="form-main">
        <motion.div
          className="form-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Header */}
          <div className="form-header">
            <h1 className="form-title">Edit Expense</h1>
            <Link to={`/spaces/${spaceId}`} className="form-cancel">Cancel</Link>
          </div>

          <form onSubmit={handleUpdate} className="form-body">
            {/* Title */}
            <div className="form-field">
              <label className="form-label">Title</label>
              <input
                type="text"
                required
                disabled={loading}
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-row">
              {/* Amount */}
              <div className="form-field">
                <label className="form-label">Amount (₹)</label>
                <input
                  type="number"
                  required
                  disabled={loading}
                  min="0.01"
                  step="0.01"
                  className="form-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="form-field">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  required
                  disabled={loading}
                  className="form-input"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              className="form-submit"
              whileTap={{ scale: 0.97 }}
            >
              {loading ? "Saving..." : "Update Expense"}
            </motion.button>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default EditExpense;
