import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import SpaceCard from "../components/SpaceCard";
import "./Dashboard.css";

const Dashboard = () => {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  const fetchSpaces = async () => {
    try {
      setError("");
      const { data } = await api.get("/spaces");
      setSpaces(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load spaces. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  // Totals
  const totalGlobalBudget = spaces.reduce(
    (acc, space) => acc + space.budgetLimit,
    0,
  );
  const totalGlobalSpent = spaces.reduce(
    (acc, space) => acc + space.totalSpent,
    0,
  );
  const totalRemaining = totalGlobalBudget - totalGlobalSpent;

  const query = searchQuery.toLowerCase();

  const filteredSpaces = spaces.filter(
    (space) =>
      space.name.toLowerCase().includes(query) ||
      (space.description && space.description.toLowerCase().includes(query)),
  );

  /* Stat cards data */
  const stats = [
    {
      label: "Total Spaces",
      value: spaces.length,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      ),
      accent: "#818cf8",
    },
    {
      label: "Total Budget",
      value: `₹${totalGlobalBudget.toLocaleString()}`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
          <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
        </svg>
      ),
      accent: "#f59e0b",
    },
    {
      label: "Total Spent",
      value: `₹${totalGlobalSpent.toLocaleString()}`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      accent: "#6366f1",
    },
    {
      label: "Remaining",
      value: `₹${Math.abs(totalRemaining).toLocaleString()}`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      ),
      accent: totalRemaining >= 0 ? "#34d399" : "#f87171",
    },
  ];

  return (
    <div className="dash-root" id="dashboard-page">
      <Navbar />

      {/* Ambient blobs */}
      <div className="dash-blob dash-blob-1" />
      <div className="dash-blob dash-blob-2" />

      <main className="dash-main">
        {/* ── Stats Overview ── */}
        <section className="dash-stats" id="dashboard-stats">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="stat-icon" style={{ background: `${s.accent}18`, color: s.accent }}>
                {s.icon}
              </div>
              <div className="stat-info">
                <span className="stat-label">{s.label}</span>
                <span className="stat-value" style={{ color: s.accent }}>{s.value}</span>
              </div>
            </motion.div>
          ))}
        </section>

        {/* ── Controls bar ── */}
        <motion.div
          className="dash-controls"
          id="dashboard-controls"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          <h2 className="dash-section-title">Your Spaces</h2>

          <div className="dash-actions">
            <div className="dash-search-wrap">
              <svg className="dash-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search spaces..."
                className="dash-search"
                id="dashboard-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Link to="/spaces/new" className="dash-new-btn" id="dashboard-new-space-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Space
            </Link>
          </div>
        </motion.div>

        {/* ── Content ── */}
        {loading ? (
          <div className="dash-empty" id="dashboard-loading">
            <div className="dash-spinner" />
            <p>Loading your spaces...</p>
          </div>
        ) : error ? (
          <div className="dash-empty dash-error" id="dashboard-error">
            <p>{error}</p>
          </div>
        ) : filteredSpaces.length === 0 ? (
          <motion.div
            className="dash-empty"
            id="dashboard-empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3f3f46" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
              <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
            </svg>
            <p className="dash-empty-text">No spaces found.</p>
            {searchQuery === "" && (
              <Link to="/spaces/new" className="dash-empty-link">
                Create your first budget space →
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="dash-grid" id="dashboard-grid">
            {filteredSpaces.map((space, idx) => (
              <SpaceCard key={space._id} space={space} index={idx} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
