import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SuperAdminLogin.css";
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
        if (!email || !password) { setError("Email and password are required."); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email address."); return; }
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
        <div className="sa-login">
            <div className="sa-card">
                {/* Hero */}
                <div className="sa-hero">
                    <img className="sa-hero-logo" src={chatviq} alt="ChatViq" />
                    <h1>Platform<br /><span className="grad">Management Console</span></h1>
                    <p className="sa-tagline">
                        Secure access to platform-wide controls, tenant management, and system configuration.
                    </p>
                    <div className="sa-features">
                        <div className="sa-feat"><span className="sa-dot" /> Multi-tenant Organization Control</div>
                        <div className="sa-feat"><span className="sa-dot" /> Platform-wide Analytics &amp; Billing</div>
                        <div className="sa-feat"><span className="sa-dot" /> Admin Role-Based Access Control</div>
                    </div>
                    <div className="sa-ring r1" />
                    <div className="sa-ring r2" />
                </div>

                {/* Form */}
                <div className="sa-form-panel">
                    <span className="sa-badge">Platform Admin</span>
                    <h2 className="sa-title">Management Sign In</h2>
                    <p className="sa-subtitle">Restricted access — authorized personnel only</p>

                    {error && <div className="sa-error" role="alert" aria-live="polite">{error}</div>}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="sa-group">
                            <label htmlFor="sa-email" className="sa-label">Email Address</label>
                            <input
                                id="sa-email" type="email" placeholder="admin@chatviq.com"
                                className="sa-input" required autoComplete="email"
                                value={email} onChange={e => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="sa-group">
                            <label htmlFor="sa-password" className="sa-label">Password</label>
                            <input
                                id="sa-password" type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                className="sa-input has-toggle" required autoComplete="current-password"
                                value={password} onChange={e => setPassword(e.target.value)}
                            />
                            <button type="button" className="sa-toggle"
                                onClick={() => setShowPassword(s => !s)}
                                aria-label={showPassword ? "Hide password" : "Show password"}>
                                {showPassword ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
                            </button>
                        </div>

                        <button type="submit" className="sa-btn" disabled={loading} aria-busy={loading}>
                            {loading && <span className="sa-spinner" aria-hidden="true" />}
                            {loading ? "Signing In…" : "Sign In"}
                        </button>
                    </form>

                    <div className="sa-divider">Secured by ChatViq Platform</div>
                    <button type="button" className="sa-back" onClick={() => navigate("/login")}>← Back to tenant login</button>
                </div>
            </div>
        </div>
    );
}
