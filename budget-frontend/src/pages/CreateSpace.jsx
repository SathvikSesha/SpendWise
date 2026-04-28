import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import "./FormPage.css";

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
    <div className="form-page" id="create-space-page">
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
            <h1 className="form-title">Create New Space</h1>
            <Link to="/dashboard" className="form-cancel">Cancel</Link>
          </div>

          {error && (
            <motion.div
              className="form-error"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="form-body">
            {/* Space Name */}
            <div className="form-field">
              <label className="form-label">
                Space Name <span className="req">*</span>
              </label>
              <input
                type="text"
                required
                disabled={loading}
                placeholder="e.g., Europe Trip, Monthly Groceries"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="form-field">
              <label className="form-label">
                Description <span className="opt">(Optional)</span>
              </label>
              <textarea
                rows="3"
                disabled={loading}
                placeholder="What is this budget for?"
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="form-row">
              {/* Budget Limit */}
              <div className="form-field">
                <label className="form-label">
                  Budget Limit (₹) <span className="req">*</span>
                </label>
                <input
                  type="number"
                  required
                  disabled={loading}
                  min="1"
                  step="0.01"
                  placeholder="0.00"
                  className="form-input"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                />
              </div>

              {/* Threshold */}
              <div className="form-field">
                <label className="form-label">
                  Alert Threshold (%) <span className="req">*</span>
                </label>
                <div className="form-range-wrap">
                  <input
                    type="range"
                    min="50"
                    max="100"
                    disabled={loading}
                    className="form-range"
                    value={thresholdPercent}
                    onChange={(e) =>
                      setThresholdPercent(Number(e.target.value))
                    }
                  />
                  <span className="form-range-value">
                    {thresholdPercent}%
                  </span>
                </div>
                <p className="form-hint">
                  Alert at ₹
                  {budgetLimit
                    ? ((budgetLimit * thresholdPercent) / 100).toFixed(2)
                    : "0.00"}
                </p>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              className="form-submit"
              whileTap={{ scale: 0.97 }}
            >
              {loading ? "Creating Space..." : "Create Space"}
            </motion.button>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default CreateSpace;
