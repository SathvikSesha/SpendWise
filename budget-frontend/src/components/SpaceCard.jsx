import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./SpaceCard.css";

const SpaceCard = ({ space, index = 0 }) => {
  const rawPercent =
    space.budgetLimit > 0 ? (space.totalSpent / space.budgetLimit) * 100 : 0;

  const percentUsed = Math.min(rawPercent, 100);

  const isOverThreshold = rawPercent >= (space.thresholdPercent || 80);

  const isOverBudget = rawPercent > 100;

  const barColor = isOverBudget
    ? "#ef4444"
    : isOverThreshold
      ? "#f59e0b"
      : "#6366f1";

  const remaining = space.budgetLimit - space.totalSpent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.08,
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link to={`/spaces/${space._id}`} className="space-card-link" id={`space-card-${space._id}`}>
        <div className="space-card">
          {/* Header */}
          <div className="sc-header">
            <div className="sc-dot" style={{ background: barColor, boxShadow: `0 0 8px ${barColor}55` }} />
            <h3 className="sc-title">{space.name}</h3>
            <span
              className="sc-badge"
              style={{
                color: isOverBudget ? "#fca5a5" : isOverThreshold ? "#fcd34d" : "#a5b4fc",
                background: isOverBudget
                  ? "rgba(239,68,68,0.12)"
                  : isOverThreshold
                    ? "rgba(245,158,11,0.12)"
                    : "rgba(99,102,241,0.12)",
                borderColor: isOverBudget
                  ? "rgba(239,68,68,0.20)"
                  : isOverThreshold
                    ? "rgba(245,158,11,0.20)"
                    : "rgba(99,102,241,0.20)",
              }}
            >
              {rawPercent.toFixed(0)}%
            </span>
          </div>

          {/* Description */}
          <p className="sc-desc">
            {space.description || "No description provided."}
          </p>

          {/* Stats row */}
          <div className="sc-stats">
            <div className="sc-stat">
              <span className="sc-stat-label">Spent</span>
              <span className="sc-stat-value">₹{space.totalSpent.toLocaleString()}</span>
            </div>
            <div className="sc-stat">
              <span className="sc-stat-label">Budget</span>
              <span className="sc-stat-value">₹{space.budgetLimit.toLocaleString()}</span>
            </div>
            <div className="sc-stat">
              <span className="sc-stat-label">Left</span>
              <span className="sc-stat-value" style={{ color: remaining >= 0 ? "#34d399" : "#f87171" }}>
                ₹{Math.abs(remaining).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Over-budget badge */}
          {isOverBudget && (
            <div className="sc-over-badge">Over Budget</div>
          )}

          {/* Progress */}
          <div className="sc-progress-track">
            <motion.div
              className="sc-progress-fill"
              style={{ background: barColor, boxShadow: `0 0 10px ${barColor}44` }}
              initial={{ width: 0 }}
              animate={{ width: `${percentUsed}%` }}
              transition={{ delay: 0.3 + index * 0.08, duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default SpaceCard;
