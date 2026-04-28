import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./Landing.css";

/* ── Floating budget-preview cards (right hero) ── */
const cards = [
  {
    title: "Travel Fund",
    budget: "₹25,000",
    spent: "₹12,400",
    remaining: "₹12,600",
    percent: 50,
    accent: "#6366f1",       // indigo
    items: ["Flights — ₹6,200", "Hotels — ₹4,100", "Food — ₹2,100"],
  },
  {
    title: "Groceries",
    budget: "₹8,000",
    spent: "₹5,320",
    remaining: "₹2,680",
    percent: 67,
    accent: "#f59e0b",       // amber
    items: ["Vegetables — ₹1,800", "Dairy — ₹1,520", "Snacks — ₹2,000"],
  },
  {
    title: "Subscriptions",
    budget: "₹3,500",
    spent: "₹2,100",
    remaining: "₹1,400",
    percent: 60,
    accent: "#10b981",       // emerald
    items: ["Netflix — ₹649", "Spotify — ₹119", "Cloud — ₹1,332"],
  },
];

/* ── Each line of hero text ── */
const headingLines = [
  "Your Money.",
  "Your Rules.",
  "Your Spaces.",
];

const subLines = [
  "Create custom budget spaces, track every rupee,",
  "and get real-time alerts before you overspend.",
];

const lineVariant = {
  hidden: { opacity: 0, x: -120 },
  visible: (i) => ({
    opacity: 1,
    x: 20,
    transition: { delay: i * 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i, duration: 0.6, ease: "easeOut" },
  }),
};

const cardTransforms = [
  { rotate: -12, x: -50, y: 30, z: 0 },  
  { rotate: 0, x: 0, y: -10, z: 1 },     
  { rotate: 12, x: 50, y: 30, z: 2 },    
];

const Landing = () => {
  const totalHeadDelay = headingLines.length * 0.25 + 0.5;      
  const totalSubDelay = totalHeadDelay + subLines.length * 0.22;   
  const btnDelay = totalSubDelay + 0.3;

  return (
    <div className="landing-root" id="landing-page">
      {/* ─── Ambient blobs ─── */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="landing-content">
        {/* ====== LEFT — Text + CTA ====== */}
        <div className="landing-left">
          {/* Heading lines */}
          <h1 className="landing-heading" id="landing-heading">
            {headingLines.map((line, i) => (
              <motion.span
                key={i}
                className="heading-line"
                custom={i}
                variants={lineVariant}
                initial="hidden"
                animate="visible"
              >
                {line}
              </motion.span>
            ))}
          </h1>

          {/* Sub-text lines */}
          <div className="landing-sub" id="landing-subtext">
            {subLines.map((line, i) => (
              <motion.p
                key={i}
                custom={totalHeadDelay + i * 0.22}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
              >
                {line}
              </motion.p>
            ))}
          </div>

          {/* CTA Buttons */}
          <motion.div
            className="landing-cta"
            id="landing-cta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: btnDelay, duration: 0.55, ease: "easeOut" }}
          >
            <Link to="/login" className="btn-primary" id="landing-login-btn">
              Log In
            </Link>
            <Link to="/signup" className="btn-outline" id="landing-signup-btn">
              Get Started
            </Link>
          </motion.div>
        </div>

        {/* ====== RIGHT — Floating card stack ====== */}
        <div className="landing-right" id="landing-hero-cards">
          <div className="card-stack">
            {cards.map((card, idx) => {
              const t = cardTransforms[idx];
              const floatDelay = idx * 1.3;        // stagger the float
              const cardDelay = btnDelay + 0.15 + idx * 0.18;

              return (
                <motion.div
                  key={idx}
                  className="hero-card"
                  style={{
                    "--accent": card.accent,
                    zIndex: 3 - Math.abs(1 - idx),
                  }}
                  initial={{ opacity: 0, scale: 0.85, x: 0, y: 80, rotate: 0 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: t.x,
                    y: [t.y, t.y - 12, t.y],      // float loop
                    rotate: t.rotate,
                  }}
                  transition={{
                    opacity: { delay: cardDelay, duration: 0.6 },
                    scale: { delay: cardDelay, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                    x: { delay: cardDelay, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                    rotate: { delay: cardDelay, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                    y: {
                      delay: cardDelay,
                      duration: 3.5,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatType: "loop",
                      repeatDelay: 0,
                    },
                  }}
                  whileHover={{
                    y: t.y - 24,
                    scale: 1.07,
                    rotate: 0,
                    zIndex: 10,
                    transition: { duration: 0.35, ease: "easeOut" },
                  }}
                  id={`hero-card-${idx}`}
                >
                  {/* Card header */}
                  <div className="hero-card-header">
                    <span className="card-dot" />
                    <span className="card-title">{card.title}</span>
                    <span className="card-budget">{card.budget}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="card-progress-track">
                    <motion.div
                      className="card-progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${card.percent}%` }}
                      transition={{ delay: btnDelay + 0.6 + idx * 0.2, duration: 1, ease: "easeOut" }}
                    />
                  </div>

                  {/* Spent / Remaining */}
                  <div className="card-stats">
                    <div>
                      <span className="stat-label">Spent</span>
                      <span className="stat-value">{card.spent}</span>
                    </div>
                    <div>
                      <span className="stat-label">Left</span>
                      <span className="stat-value remaining">{card.remaining}</span>
                    </div>
                  </div>

                  {/* Expense items */}
                  <ul className="card-items">
                    {card.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Bottom tagline ─── */}
      <motion.p
        className="landing-footer-tag"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: btnDelay + 1.2, duration: 1 }}
      >
        Built for people who care where every penny goes.
      </motion.p>
    </div>
  );
};

export default Landing;
