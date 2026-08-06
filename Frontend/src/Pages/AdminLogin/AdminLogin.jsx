import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';

import API_BASE_URL from '../../api';
import './AdminLogin.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const isSubmittingRef = useRef(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    // Clear any stale authentication data prior to an attempt
    localStorage.removeItem('vehiclecare_admin_token');
    localStorage.removeItem('vehiclecare_admin');
    sessionStorage.removeItem('vehiclecare_admin_token');
    sessionStorage.removeItem('vehiclecare_admin');

    setLoginError('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'Login failed'
        );
      }

      const storage = rememberMe
        ? localStorage
        : sessionStorage;

      storage.setItem(
        'vehiclecare_admin_token',
        data.token
      );

      storage.setItem(
        'vehiclecare_admin',
        JSON.stringify(data.admin)
      );

      navigate('/admin/dashboard');
    } catch (error) {
      setLoginError(
        error.message ||
          'Unable to login. Please try again.'
      );
    } finally {
      isSubmittingRef.current = false;
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-layout">
      {/* Back Button */}
      <button
        className="back-home-btn"
        onClick={() => navigate('/')}
      >
        <svg
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>

        Back to Home
      </button>

      {/* Left Column */}
      <div className="login-left-panel">
        <div className="left-panel-overlay"></div>

        <div className="left-panel-content">
          <div className="enterprise-badge">
            <svg
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2L3 7v9.423c0 3.737 2.373 7.159 6.014 8.21l2.986.862 2.986-.862C18.627 23.582 21 20.16 21 16.423V7L12 2zm-1.127 15.353l-4.226-4.225 1.414-1.414 2.812 2.811 5.922-5.922 1.414 1.414-7.336 7.336z" />
            </svg>

            ENTERPRISE PORTAL
          </div>

          <h1 className="left-title">
            Manage Vehicle <br />
            Services with <span>Confidence</span>
          </h1>

          <p className="left-desc">
            Securely access bookings, service categories,
            appointment statuses, and real-time dashboard
            reports in our unified management suite.
          </p>

          <div className="left-features">
            <div className="feature-item">
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                />
              </svg>

              Real-time Analytics
            </div>

            <div className="feature-item">
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>

              Dynamic Scheduling
            </div>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="admin-login-right">
        <div className="admin-login-main">
          <div className="login-content-wrapper">
            <div className="login-card">
              <h2>Admin Login</h2>

              <p className="login-subtitle">
                Enter your credentials to access the console
              </p>

              <form
                onSubmit={handleLogin}
                className="admin-form"
              >
                <div className="form-group">
                  <label>Email address</label>

                  <div className="admin-login-input-wrapper">
                    <FaUser className="admin-login-left-icon" />

                    <input
                      type="email"
                      placeholder="admin@vehiclecare.com"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Password</label>

                  <div className="admin-login-input-wrapper">
                    <FaLock className="admin-login-left-icon" />

                    <input
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      required
                      className="admin-login-password-input"
                    />

                    <button
                      type="button"
                      className="admin-login-eye-button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                    >
                      {showPassword
                        ? <FaEyeSlash />
                        : <FaEye />}
                    </button>
                  </div>

                  <div className="forgot-password-footer">
                    <Link
                      to="/admin-forgot-password"
                      className="forgot-link"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(
                        e.target.checked
                      )
                    }
                  />

                  <label htmlFor="remember">
                    Remember me
                  </label>
                </div>

                {loginError && (
                  <p
                    style={{
                      color: '#E11D48',
                      fontSize: '13px',
                      margin: '0 0 12px 0'
                    }}
                  >
                    {loginError}
                  </p>
                )}

                <button
                  type="submit"
                  className="login-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading
                    ? 'Logging in...'
                    : 'Login to Dashboard'}

                  {!isLoading && <span>→</span>}
                </button>
              </form>

              <div className="login-divider"></div>

              <div className="help-text">
                Need help?{' '}
                <a href="#">
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}