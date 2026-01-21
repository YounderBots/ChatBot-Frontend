import React from 'react'
import { useState } from 'react'
import { Card, Spinner, Button, Form } from 'react-bootstrap'
import { Eye, EyeOff } from 'lucide-react'
import "./Login.css"
import chatviq from "./chatviq.png";
const Login = () => {
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

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


          <div className='d-flex justify-content-between align-items-center mb-3'>
            {/* <div className='form-check'>
              <input
                type='checkbox'
                className='form-check-input'
                id='rememberMe'
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label className='form-check-label' htmlFor='rememberMe'>Keep me Signed In</label>

            </div> */}
            {/* <span className='forgot-link cursorPointer' onClick={() => setShowReset(true)}>Forgot Password?</span> */}

          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading && (
              <span className="spinner-border spinner-border-sm me-2"></span>
            )}
            {loading ? "Signing In..." : "Sign In"}
          </button>

        </form>

      </Card>
      {/* {showReset && (
        <div className='modal fade show d-block' tabIndex="-1">
          <div className='modal-dialog modal-dialog-centered'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>Reset Password</h5>
                <button
                  type='button'
                  className='btn-close'
                  onClick={() => {
                    setShowReset(false);
                    setResetSent(false);
                  }}
                />
              </div>
              <div className='modal-body'>
                {!resetSent ?
                  (<>
                    <label className='form-label'> Email Address</label>
                    <input
                      type='email'
                      className='form-control'
                      placeholder='Enter your Registered Email'
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)} />


                  </>
                  ) : (
                    <div className='alert alert-success'>Password reset link has been sent to your Email</div>
                  )}

              </div>
              <div className='modal-footer'>
                {!resetSent ? (
                  <button
                    className='btn btn-primary w-100'
                    onClick={() => setResetSent(true)}
                    disabled={!resetEmail}
                  >Send Reset Link
                  </button>
                ) : (
                  <button
                    className='btn btn-secondary w-100'
                    onClick={() => setShowReset(false)}>
                    Close
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      )} */}
    </div>
  )
}

export default Login