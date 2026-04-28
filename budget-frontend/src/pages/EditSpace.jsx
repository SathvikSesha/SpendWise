import { useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import "./FormPage.css";

const EditSpace = () => {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Grab the passed space data
  const existingSpace = location.state?.space || {};

  // Form State pre-filled with existing data
  const [name, setName] = useState(existingSpace.name || "");
  const [description, setDescription] = useState(
    existingSpace.description || "",
  );
  const [budgetLimit, setBudgetLimit] = useState(
    existingSpace.budgetLimit || "",
  );
  const [thresholdPercent, setThresholdPercent] = useState(
    existingSpace.thresholdPercent || 80,
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.put(`/spaces/${spaceId}`, {
        name,
        description,
        budgetLimit: Number(budgetLimit),
        thresholdPercent: Number(thresholdPercent),
      });
      navigate(`/spaces/${spaceId}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update space.");
      setLoading(false);
    }
  };

  const handleDeleteSpace = async () => {
    if (
      window.confirm(
        "Are you ABSOLUTELY sure? This will delete the space, all categories, and all expenses forever.",
      )
    ) {
      try {
        await api.delete(`/spaces/${spaceId}`);
        navigate("/dashboard"); // Kick them back to home after deletion
      } catch (err) {
        setError(err.response?.data?.error || "Failed to delete space.");
      }
    }
  };

  return (
    <div className="form-page" id="edit-space-page">
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
            <h1 className="form-title">Edit Space Settings</h1>
            <Link to={`/spaces/${spaceId}`} className="form-cancel">Cancel</Link>
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

          <form onSubmit={handleUpdate} className="form-body">
            {/* Space Name */}
            <div className="form-field">
              <label className="form-label">Space Name</label>
              <input
                type="text"
                required
                disabled={loading}
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="form-field">
              <label className="form-label">Description</label>
              <textarea
                rows="3"
                disabled={loading}
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="form-row">
              {/* Budget Limit */}
              <div className="form-field">
                <label className="form-label">Budget Limit (₹)</label>
                <input
                  type="number"
                  required
                  disabled={loading}
                  min="1"
                  step="0.01"
                  className="form-input"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                />
              </div>

              {/* Threshold */}
              <div className="form-field">
                <label className="form-label">Alert Threshold (%)</label>
                <div className="form-range-wrap">
                  <input
                    type="range"
                    min="50"
                    max="100"
                    disabled={loading}
                    className="form-range"
                    value={thresholdPercent}
                    onChange={(e) => setThresholdPercent(Number(e.target.value))}
                  />
                  <span className="form-range-value">
                    {thresholdPercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              className="form-submit"
              whileTap={{ scale: 0.97 }}
            >
              {loading ? "Saving..." : "Update Space"}
            </motion.button>
          </form>

          {/* Danger Zone */}
          <div className="form-danger">
            <h3 className="form-danger-title">Danger Zone</h3>
            <p className="form-danger-text">
              Once you delete a space, there is no going back. Please be certain.
            </p>
            <button
              onClick={handleDeleteSpace}
              className="form-danger-btn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Delete this Space
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default EditSpace;
