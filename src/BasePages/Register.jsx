import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import APICall from '../APICalls/APICall';
import { useAuth } from '../Context/AuthContext';
import './Register.css';

const chatviq = '/assets/images/chatviq.png';

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'E-Commerce',
  'Retail', 'Manufacturing', 'Hospitality', 'Media', 'Real Estate', 'Other',
];

export default function Register() {
  const navigate  = useNavigate();
  const { login } = useAuth();

  const [step,        setStep]        = useState(1);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    org_name: '', website: '', industry: '',
    owner_name: '', email: '', password: '', confirm: '',
  });

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const DEMO_ORGS = [
    { org_name: 'Acme Technologies', website: 'https://acme.example.com', industry: 'Technology' },
    { org_name: 'HealthFirst Clinic', website: 'https://healthfirst.example.com', industry: 'Healthcare' },
    { org_name: 'ShopSmart Retail', website: 'https://shopsmart.example.com', industry: 'E-Commerce' },
  ];

  const DEMO_USERS = [
    { owner_name: 'Jane Smith',  email: 'jane.smith@acme.example.com',   password: 'Demo@12345', confirm: 'Demo@12345' },
    { owner_name: 'Alex Kumar',  email: 'alex.kumar@health.example.com', password: 'Demo@12345', confirm: 'Demo@12345' },
    { owner_name: 'Maria Lopez', email: 'maria.lopez@shop.example.com',  password: 'Demo@12345', confirm: 'Demo@12345' },
  ];

  const fillDemoStep1 = () => {
    const demo = DEMO_ORGS[Math.floor(Math.random() * DEMO_ORGS.length)];
    setForm((p) => ({ ...p, ...demo }));
    setError('');
  };

  const fillDemoStep2 = () => {
    const demo = DEMO_USERS[Math.floor(Math.random() * DEMO_USERS.length)];
    setForm((p) => ({ ...p, ...demo }));
    setError('');
  };

  const validateStep1 = () => {
    if (!form.org_name.trim()) return 'Organization name is required';
    return null;
  };

  const validateStep2 = () => {
    if (!form.owner_name.trim()) return 'Your name is required';
    if (!form.email.trim())      return 'Work email is required';
    if (form.password.length < 8) return 'Password must be at least 8 characters';
    if (form.password !== form.confirm) return 'Passwords do not match';
    return null;
  };

  const nextStep = (e) => {
    e.preventDefault();
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateStep2();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      const data = await APICall.postWT('/org/register', {
        org_name:   form.org_name,
        owner_name: form.owner_name,
        email:      form.email,
        password:   form.password,
        website:    form.website || undefined,
        industry:   form.industry || undefined,
      });
      login({
        token: data.token,
        user:  data.user,
        menus: [
          { menu_id: 1,  order_no: 1,  name: 'Dashboard',    path: '/Dashboard',    icon: 'dashboard',    permissions: { view: true } },
          { menu_id: 2,  order_no: 20, name: 'Organization', path: '/Organization', icon: 'organization', permissions: { view: true } },
          { menu_id: 3,  order_no: 21, name: 'Billing',      path: '/Billing',      icon: 'billing',      permissions: { view: true } },
          { menu_id: 4,  order_no: 22, name: 'Channels',     path: '/Channels',     icon: 'channels',     permissions: { view: true } },
        ],
      });
      navigate('/Dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-layout">

        {/* ── Hero ── */}
        <div className="register-hero">
          <div className="login-hero-content">
            <img src={chatviq} alt="ChatViq" className="hero-logo" />
            <h1 className="hero-headline">
              Start Building<br /><span>Smarter Conversations</span>
            </h1>
            <p className="hero-tagline">
              Set up your ChatViq workspace in under 2 minutes. Connect channels,
              train your bot, and go live today.
            </p>
            <div className="hero-features">
              {[
                'Free plan — no credit card required',
                'WhatsApp, Slack & SMS integrations',
                'AI intent recognition out of the box',
                'Live agent escalation built in',
              ].map((f) => (
                <div key={f} className="hero-feature-item">
                  <span className="feature-dot" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-ring hero-ring-1" />
          <div className="hero-ring hero-ring-2" />
          <div className="hero-ring hero-ring-3" />
        </div>

        {/* ── Form ── */}
        <div className="register-form-panel">
          <div className="register-card-glass">
            <div className="text-center mb-3">
              <div className="register-badge">
                {step === 1 ? 'Step 1 of 2 — Workspace' : 'Step 2 of 2 — Your Account'}
              </div>
              <h2 className="card-title">
                {step === 1 ? 'Create Your Workspace' : 'Set Up Your Account'}
              </h2>
              <p className="card-subtitle">
                {step === 1
                  ? 'Tell us about your organization'
                  : "You'll use these credentials to sign in"}
              </p>
            </div>

            {/* Step indicator — semantic progress bar */}
            <div className="step-progress" role="progressbar"
              aria-valuenow={step} aria-valuemin={1} aria-valuemax={2}
              aria-label={`Step ${step} of 2`}>
              {[1, 2].map((s) => (
                <div key={s} className={`step-bar ${s <= step ? 'step-bar--active' : ''}`} />
              ))}
            </div>

            {error && (
              <div className="login-error" role="alert" aria-live="polite">{error}</div>
            )}

            {step === 1 ? (
              <form onSubmit={nextStep} noValidate>
                <div style={{ textAlign: 'right', marginBottom: 8 }}>
                  <button type="button" style={{ background: 'none', border: 'none', color: '#fb923c', cursor: 'pointer', fontWeight: 600, fontSize: 13 }} onClick={fillDemoStep1}>
                    Fill demo data
                  </button>
                </div>
                <div className="form-group-modern">
                  <label htmlFor="reg-org-name" className="label-modern">Organization Name *</label>
                  <input
                    id="reg-org-name"
                    className="input-modern"
                    placeholder="Acme Corp"
                    value={form.org_name}
                    onChange={set('org_name')}
                    required
                    autoComplete="organization"
                  />
                </div>
                <div className="two-col-grid">
                  <div className="form-group-modern">
                    <label htmlFor="reg-industry" className="label-modern">Industry</label>
                    <select
                      id="reg-industry"
                      className="input-modern"
                      value={form.industry}
                      onChange={set('industry')}
                    >
                      <option value="">Select…</option>
                      {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                  <div className="form-group-modern">
                    <label htmlFor="reg-website" className="label-modern">Website</label>
                    <input
                      id="reg-website"
                      className="input-modern"
                      placeholder="https://…"
                      type="url"
                      value={form.website}
                      onChange={set('website')}
                      autoComplete="url"
                    />
                  </div>
                </div>
                <button type="submit" className="btn-register-modern">
                  Continue →
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div style={{ textAlign: 'right', marginBottom: 8 }}>
                  <button type="button" style={{ background: 'none', border: 'none', color: '#fb923c', cursor: 'pointer', fontWeight: 600, fontSize: 13 }} onClick={fillDemoStep2}>
                    Fill demo data
                  </button>
                </div>
                <div className="form-group-modern">
                  <label htmlFor="reg-name" className="label-modern">Full Name *</label>
                  <input
                    id="reg-name"
                    className="input-modern"
                    placeholder="Jane Smith"
                    value={form.owner_name}
                    onChange={set('owner_name')}
                    required
                    autoComplete="name"
                  />
                </div>
                <div className="form-group-modern">
                  <label htmlFor="reg-email" className="label-modern">Work Email *</label>
                  <input
                    id="reg-email"
                    className="input-modern"
                    type="email"
                    placeholder="jane@company.com"
                    value={form.email}
                    onChange={set('email')}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="form-group-modern position-relative">
                  <label htmlFor="reg-password" className="label-modern">Password * <small className="opacity-50">(min 8 chars)</small></label>
                  <input
                    id="reg-password"
                    className="input-modern has-toggle"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min 8 characters"
                    value={form.password}
                    onChange={set('password')}
                    required
                    autoComplete="new-password"
                    minLength={8}
                  />
                  <button type="button" className="password-toggle"
                    onClick={() => setShowPass((p) => !p)}
                    aria-label={showPass ? 'Hide password' : 'Show password'}>
                    {showPass ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
                  </button>
                </div>
                <div className="form-group-modern position-relative">
                  <label htmlFor="reg-confirm" className="label-modern">Confirm Password *</label>
                  <input
                    id="reg-confirm"
                    className="input-modern has-toggle"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={form.confirm}
                    onChange={set('confirm')}
                    required
                    autoComplete="new-password"
                  />
                  <button type="button" className="password-toggle"
                    onClick={() => setShowConfirm((p) => !p)}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                    {showConfirm ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
                  </button>
                </div>

                <div className="reg-actions">
                  <button type="button" className="btn-back-modern"
                    onClick={() => { setStep(1); setError(''); }}>
                    ← Back
                  </button>
                  <button type="submit" className="btn-register-modern reg-submit"
                    disabled={loading} aria-busy={loading}>
                    {loading && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
                    {loading ? 'Creating workspace…' : 'Create Workspace'}
                  </button>
                </div>
              </form>
            )}

            <div className="form-divider" style={{ marginTop: '1.5rem' }}>
              <span>
                Already have an account?{' '}
                <button type="button" className="register-link"
                  onClick={() => navigate('/login')}>
                  Sign in
                </button>
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
