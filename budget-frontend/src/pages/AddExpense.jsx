import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import "./FormPage.css";

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
    <div className="form-page" id="add-expense-page">
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
            <h1 className="form-title">Log New Expense</h1>
            <Link to={`/spaces/${spaceId}`} className="form-cancel">Cancel</Link>
          </div>

          <form onSubmit={handleSubmit} className="form-body">
            {/* Title */}
            <div className="form-field">
              <label className="form-label">
                What did you buy? <span className="req">*</span>
              </label>
              <input
                type="text"
                required
                disabled={loading}
                placeholder="e.g., Uber to Airport, Morning Coffee"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-row">
              {/* Amount */}
              <div className="form-field">
                <label className="form-label">
                  Amount (₹) <span className="req">*</span>
                </label>
                <input
                  type="number"
                  required
                  disabled={loading}
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  className="form-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="form-field">
                <label className="form-label">
                  Category <span className="req">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={loading}
                  placeholder="e.g., Food, Transport, Bills"
                  className="form-input"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
                <p className="form-hint">Type a new or existing category.</p>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              className="form-submit"
              whileTap={{ scale: 0.97 }}
            >
              {loading ? "Saving..." : "Add Expense"}
            </motion.button>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default AddExpense;
