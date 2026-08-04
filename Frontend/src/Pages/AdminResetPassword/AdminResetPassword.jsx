import React, { useState, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import API_BASE_URL from '../../api';
import './AdminResetPassword.css';

export default function AdminResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const email = useMemo(() => searchParams.get('email') || '', [searchParams]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (newPassword.length < 8) {
      setStatus('error');
      setMessage('Password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }

    if (!token || !email) {
      setStatus('error');
      setMessage('Invalid reset link. Please request a new password reset.');
      return;
    }

    setStatus('submitting');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          token,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to reset password.');
      }

      setStatus('success');
      setMessage(data.message);

      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/admin-login');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="admin-reset-layout">
      <Link to="/admin-login" className="back-home-btn">
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
        Back to Admin Login
      </Link>

      <div className="admin-reset-main">
        <div className="reset-card">
          {status === 'success' ? (
            <div className="reset-success-box">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2>Password Reset Successfully</h2>
              <p>{message}</p>
              <p className="reset-redirect-text">
                Redirecting to login page...
              </p>
              <Link to="/admin-login" className="reset-back-link">
                Back to Admin Login
              </Link>
            </div>
          ) : (
            <>
              <div className="reset-card-icon">
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                  />
                </svg>
              </div>

              <h2>Reset Password</h2>
              <p className="reset-subtitle">
                Enter your new password below.
              </p>

              <form onSubmit={handleSubmit} className="reset-form">
                <div className="reset-form-group">
                  <label>NEW PASSWORD</label>
                  <div className="reset-input-wrapper">
                    <FaLock className="reset-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={status === 'submitting'}
                      className="reset-password-input"
                    />
                    <button
                      type="button"
                      className="reset-eye-button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="reset-form-group">
                  <label>CONFIRM NEW PASSWORD</label>
                  <div className="reset-input-wrapper">
                    <FaLock className="reset-input-icon" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={status === 'submitting'}
                      className="reset-password-input"
                    />
                    <button
                      type="button"
                      className="reset-eye-button"
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {status === 'error' && (
                  <div className="reset-error-box">
                    <p>{message}</p>
                    {message.includes('expired') || message.includes('invalid') ? (
                      <Link to="/admin-forgot-password" className="reset-back-link">
                        Request New Reset Link
                      </Link>
                    ) : null}
                  </div>
                )}

                <button
                  type="submit"
                  className="reset-submit-btn"
                  disabled={status === 'submitting'}
                >
                  {status === 'submitting' ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
