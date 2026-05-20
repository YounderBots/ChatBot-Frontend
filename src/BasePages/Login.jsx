import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from "react-router-dom";

import APICall from '../APICalls/APICall';
import { useAuth } from '../Context/AuthContext';
import "./Login.css";

const chatviq = "/assets/images/chatviq.png";

const Login = () => {
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;  // guard against double-submit
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
      const data = await APICall.postWT("/login/login_user", { email, password });
      login(data);
      const redirectPath = data.menus?.[0]?.path || "/Dashboard";
      navigate(redirectPath);
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail("admin@chatviq.com");
    setPassword("Admin@12345");
    setError("");
  };

  return (
    <div className='login-wrapper'>
      <div className='login-layout'>

        {/* ── Hero Panel ── */}
        <div className="login-hero">
          <div className="login-hero-content">
            <img src={chatviq} alt='ChatViq' className='hero-logo' />
            <h1 className="hero-headline">
              Intelligent <span>AI Platform</span><br />for Modern Teams
            </h1>
            <p className="hero-tagline">
              Assist, automate, and enhance every conversation with
              enterprise-grade AI at your fingertips.
            </p>
            <div className="hero-features">
              <div className="hero-feature-item">
                <span className="feature-dot"></span>
                <span>AI-Powered Intent Recognition</span>
              </div>
              <div className="hero-feature-item">
                <span className="feature-dot"></span>
                <span>Real-time Conversation Analytics</span>
              </div>
              <div className="hero-feature-item">
                <span className="feature-dot"></span>
                <span>Multi-channel Automation</span>
              </div>
            </div>
          </div>
          <div className="hero-ring hero-ring-1"></div>
          <div className="hero-ring hero-ring-2"></div>
          <div className="hero-ring hero-ring-3"></div>
        </div>

        {/* ── Form Panel ── */}
        <div className='login-form-panel'>
          <div className='login-card-glass'>
            <div className='text-center mb-4'>
              <div className="card-badge">Admin Portal</div>
              <h2 className="card-title">Welcome Back</h2>
              <p className="card-subtitle">Sign in to continue to ChatViq</p>
            </div>

            {error && (
              <div className='login-error' role="alert" aria-live="polite">{error}</div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className='form-group-modern'>
                <label htmlFor="login-email" className='label-modern'>Email Address</label>
                <input
                  id="login-email"
                  type='email'
                  name='email'
                  placeholder='you@company.com'
                  className='input-modern'
                  required
                  autoComplete='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-describedby={error ? "login-error" : undefined}
                />
              </div>

              <div className="form-group-modern position-relative">
                <label htmlFor="login-password" className="label-modern">Password</label>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name='password'
                  placeholder='Enter your password'
                  className="input-modern has-toggle"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
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
              >
                {loading && (
                  <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                )}
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <div className="form-divider">
              <span>Secured by ChatViq Enterprise</span>
            </div>

            <div className="form-divider" style={{ marginTop: '0.5rem' }}>
              <span>
                Testing?{' '}
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#fb923c', cursor: 'pointer', fontWeight: 600, padding: 0, fontSize: 'inherit' }}
                  onClick={fillDemo}
                >
                  Use demo credentials
                </button>
              </span>
            </div>

            <div className="form-divider" style={{ marginTop: '0.5rem' }}>
              <span>
                <span
                  style={{ color: '#fb923c', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot Password?
                </span>
              </span>
            </div>

            <div className="form-divider" style={{ marginTop: '1rem' }}>
              <span>
                New to ChatViq?{' '}
                <span
                  style={{ color: '#fb923c', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => navigate('/register')}
                >
                  Create a workspace
                </span>
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
