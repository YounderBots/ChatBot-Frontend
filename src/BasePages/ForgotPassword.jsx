import { useState } from "react";
import { useNavigate } from "react-router-dom";
import APICall from "../APICalls/APICall";
import "./Login.css";

const chatviq = "/assets/images/chatviq.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setSuccess("");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const data = await APICall.postWT("/login/forgot_password", { email });
      setSuccess(data.message || "If that email exists, a reset link has been sent.");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-layout">
        <div className="login-hero">
          <div className="login-hero-content">
            <img src={chatviq} alt="ChatViq" className="hero-logo" />
            <h1 className="hero-headline">
              Reset Your <span>Password</span>
            </h1>
            <p className="hero-tagline">
              Enter the email associated with your account and we'll send you
              a link to reset your password.
            </p>
          </div>
          <div className="hero-ring hero-ring-1"></div>
          <div className="hero-ring hero-ring-2"></div>
          <div className="hero-ring hero-ring-3"></div>
        </div>

        <div className="login-form-panel">
          <div className="login-card-glass">
            <div className="text-center mb-4">
              <div className="card-badge">Password Recovery</div>
              <h2 className="card-title">Forgot Password</h2>
              <p className="card-subtitle">We'll send a reset link to your email</p>
            </div>

            {error && <div className="login-error" role="alert">{error}</div>}
            {success && (
              <div style={{
                background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
                color: "#16a34a", borderRadius: 8, padding: "0.75rem 1rem",
                marginBottom: "1rem", fontSize: "0.9rem",
              }} role="status">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group-modern">
                <label htmlFor="fp-email" className="label-modern">Email Address</label>
                <input
                  id="fp-email"
                  type="email"
                  placeholder="you@company.com"
                  className="input-modern"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn-signin-modern"
                disabled={loading}
              >
                {loading && <span className="spinner-border spinner-border-sm me-2" />}
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <div className="form-divider" style={{ marginTop: "1rem" }}>
              <span>
                Remember your password?{" "}
                <span
                  style={{ color: "#fb923c", cursor: "pointer", fontWeight: 600 }}
                  onClick={() => navigate("/login")}
                >
                  Back to Sign In
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
