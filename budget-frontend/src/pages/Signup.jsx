import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import "./Auth.css";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validateForm = () => {
    if (!name.trim()) return "Name is required";

    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Enter a valid email";

    if (!password) return "Password is required";
    if (password.length < 6)
      return "Password must be at least 6 characters";

    return null;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      return setError(validationError);
    }

    setLoading(true);

    try {
      await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Registration failed");
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="auth-root"
      id="signup-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Ambient blobs */}
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />

      <motion.div
        className="auth-card"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Link to="/" className="auth-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>

        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">
          Start tracking your budget in seconds
        </p>

        {error && (
          <motion.p
            className="auth-error"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.p>
        )}

        <form onSubmit={handleSignup} className="auth-form">
          {/* Name */}
          <div className="auth-field">
            <label className="auth-label">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              className="auth-input"
              value={name}
              disabled={loading}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="auth-input"
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="auth-input"
              value={password}
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            className="auth-submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? "Creating..." : "Sign Up"}
          </motion.button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Signup;