import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import APICall from "../APICalls/APICall";
import "./Login.css";

const chatviq = "/assets/images/chatviq.png";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setSuccess("");

    if (!token) {
      setError("Missing reset token. Please use the link from your email.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const data = await APICall.postWT("/login/reset_password", {
        token,
        new_password: password,
      });
      setSuccess(data.message || "Password reset successfully.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "Failed to reset password.");
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
              Set a New <span>Password</span>
            </h1>
            <p className="hero-tagline">
              Choose a strong password to secure your account.
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
              <h2 className="card-title">Reset Password</h2>
              <p className="card-subtitle">Enter your new password below</p>
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
              <div className="form-group-modern position-relative">
                <label htmlFor="rp-pass" className="label-modern">New Password</label>
                <input
                  id="rp-pass"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  className="input-modern has-toggle"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye /> : <EyeOff />}
                </button>
              </div>

              <div className="form-group-modern">
                <label htmlFor="rp-confirm" className="label-modern">Confirm Password</label>
                <input
                  id="rp-confirm"
                  type="password"
                  placeholder="Re-enter your password"
                  className="input-modern"
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn-signin-modern"
                disabled={loading}
              >
                {loading && <span className="spinner-border spinner-border-sm me-2" />}
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <div className="form-divider" style={{ marginTop: "1rem" }}>
              <span>
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
