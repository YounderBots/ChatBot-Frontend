import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../BasePages/Login.css";
import ManagementAPI from "./managementAPI";

const chatviq = "/assets/images/chatviq.png";

export default function SuperAdminLogin() {
    const [email,        setEmail]        = useState("");
    const [password,     setPassword]     = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error,        setError]        = useState("");
    const [loading,      setLoading]      = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setError("");
        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }
        setLoading(true);
        try {
            const data = await ManagementAPI.login(email, password);
            sessionStorage.setItem("sa_token", data.access_token);
            sessionStorage.setItem("sa_user", JSON.stringify(data.superadmin));
            navigate("/management/dashboard");
        } catch (err) {
            setError(err.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper" style={{ background: "#060d1a" }}>
            <div className="login-layout">

                {/* ── Hero Panel ── */}
                <div className="login-hero" style={{ background: "linear-gradient(145deg, #050c1a 0%, #071428 60%, #040a14 100%)", borderRight: "1px solid rgba(59,130,246,0.15)" }}>
                    <div className="login-hero-content">
                        <img src={chatviq} alt="ChatVIQ" className="hero-logo" style={{ filter: "drop-shadow(0 0 18px rgba(59,130,246,0.45))" }} />
                        <h1 className="hero-headline">
                            Platform<br />
                            <span style={{ background: "linear-gradient(135deg,#2563eb 0%,#60a5fa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                                Management Console
                            </span>
                        </h1>
                        <p className="hero-tagline">
                            Secure access to platform-wide controls, tenant management,
                            and system configuration.
                        </p>
                        <div className="hero-features">
                            <div className="hero-feature-item">
                                <span className="feature-dot" style={{ background: "linear-gradient(135deg,#2563eb,#60a5fa)", boxShadow: "0 0 8px rgba(59,130,246,0.6)" }} />
                                <span>Multi-tenant Organization Control</span>
                            </div>
                            <div className="hero-feature-item">
                                <span className="feature-dot" style={{ background: "linear-gradient(135deg,#2563eb,#60a5fa)", boxShadow: "0 0 8px rgba(59,130,246,0.6)" }} />
                                <span>Platform-wide Analytics &amp; Billing</span>
                            </div>
                            <div className="hero-feature-item">
                                <span className="feature-dot" style={{ background: "linear-gradient(135deg,#2563eb,#60a5fa)", boxShadow: "0 0 8px rgba(59,130,246,0.6)" }} />
                                <span>Admin Role-Based Access Control</span>
                            </div>
                        </div>
                    </div>
                    <div className="hero-ring hero-ring-1" style={{ borderColor: "rgba(59,130,246,0.1)" }} />
                    <div className="hero-ring hero-ring-2" style={{ borderColor: "rgba(59,130,246,0.16)" }} />
                    <div className="hero-ring hero-ring-3" style={{ borderColor: "rgba(59,130,246,0.12)" }} />
                </div>

                {/* ── Form Panel ── */}
                <div className="login-form-panel">
                    <div className="login-card-glass">
                        <div className="text-center mb-4">
                            <div className="card-badge" style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)", color: "#60a5fa" }}>
                                Platform Admin
                            </div>
                            <h2 className="card-title">Management Sign In</h2>
                            <p className="card-subtitle">Restricted access — authorized personnel only</p>
                        </div>

                        {error && (
                            <div className="login-error" role="alert" aria-live="polite">{error}</div>
                        )}

                        <form onSubmit={handleSubmit} noValidate>
                            <div className="form-group-modern">
                                <label htmlFor="sa-email" className="label-modern">Email Address</label>
                                <input
                                    id="sa-email"
                                    type="email"
                                    placeholder="admin@chatviq.com"
                                    className="input-modern"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    style={{ "--focus-color": "rgba(59,130,246,0.5)", "--focus-bg": "rgba(59,130,246,0.06)", "--focus-shadow": "rgba(59,130,246,0.12)" }}
                                />
                            </div>

                            <div className="form-group-modern position-relative">
                                <label htmlFor="sa-password" className="label-modern">Password</label>
                                <input
                                    id="sa-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    className="input-modern has-toggle"
                                    required
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(s => !s)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="btn-signin-modern"
                                disabled={loading}
                                aria-busy={loading}
                                style={{
                                    background: "linear-gradient(135deg,#1d4ed8 0%,#2563eb 50%,#3b82f6 100%)",
                                    boxShadow: "0 6px 24px -4px rgba(59,130,246,0.45), 0 0 0 1px rgba(59,130,246,0.2) inset",
                                }}
                            >
                                {loading && (
                                    <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                                )}
                                {loading ? "Signing In…" : "Sign In"}
                            </button>
                        </form>

                        <div className="form-divider">
                            <span>Secured by ChatVIQ Platform</span>
                        </div>

                        <div className="form-divider" style={{ marginTop: "1rem" }}>
                            <span>
                                <button
                                    type="button"
                                    onClick={() => navigate("/login")}
                                    style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", fontWeight: 600, padding: 0, fontSize: "inherit" }}
                                >
                                    ← Back to tenant login
                                </button>
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
