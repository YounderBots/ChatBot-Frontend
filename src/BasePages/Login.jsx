import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Card } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";

import APICall from '../APICalls/APICall';
import { useAuth } from '../Context/AuthContext';
import "./Login.css";
import chatviq from "./assets/chatviq.png";

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
    setError("");
    if (!email || !password) {
      setError("Email and Password are required");
      return;
    }

    const data = await APICall.postWT("/login/login_user", {
      email,
      password,
    });

    console.log(data)

    login(data);

    const redirectPath = data.menus?.[0]?.path || "/";
    navigate(redirectPath);
  }

  return (
    <div className='login-wrapper bgLogoLightColor'>
      <div className='login-layout'>
        <div className="login-right d-flex justify-content-center">
          <h1>Welcome to ChatVIQ</h1>
          <p>
            Your intelligent AI chatbot platform to assist, automate,
            and enhance conversations.
          </p>
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
                  name='email'
                  placeholder='Enter Your Email'
                  className='form-login-form'
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
                  name='password'
                  placeholder='Enter Password'
                  className="form-login-form"
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