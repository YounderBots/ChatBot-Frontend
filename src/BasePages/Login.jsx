import React from 'react'
import { useState } from 'react'
import { Card} from 'react-bootstrap'
import { Eye, EyeOff } from 'lucide-react'
import "./Login.css"
import chatviq from "./chatviq.png";
const Login = () => {
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);


  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email and Password are required");
      return;
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false);
    }, 1500)
  }

  return (
    <div className='login-wrapper bgLogoLightColor'>
      <div className='login-layout'>
        <div className="login-right">
          <h1>Welcome to ChatVIQ</h1>
          <p>
            Your intelligent AI chatbot platform to assist, automate,
            and enhance conversations.
          </p>
          <img src={chatviq} alt="Chatbot" className="chatbot-illustration" />
        </div>
        <div className='login-left'>
          <Card className='login-card '>
            <div className='text-center mb-4'>
              <img src={chatviq} alt='logo' className='login-logo'
              />
            </div>
            {error && <div className='alert alert-danger py-2'>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className='mb-3'>
                <label className='form-label'>Email Address</label>
                <input
                  type='email'
                  placeholder='example@gmail.com'
                  className='form-control'
                  required
                  autoComplete='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="mb-3 position-relative">
                <label className="form-label">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder='Enter Password'
                  className="form-control"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Eye /> : <EyeOff />}
                </span>
              </div>


              <div className="d-flex justify-content-center">
                <button
                  type="submit"
                  className="btn btn-signin"
                  disabled={loading}
                >
                  {loading && (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  )}
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </div>
            </form>

          </Card>
        </div>


      </div>
    </div>
  );





}

export default Login