import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope } from 'react-icons/fa';
import API_BASE_URL from '../../api';
import './AdminForgotPassword.css';

export default function AdminForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong. Please try again.');
      }

      setStatus('success');
      setMessage(data.message);
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="admin-forgot-layout">
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

      <div className="admin-forgot-main">
        <div className="forgot-card">
          <div className="forgot-card-icon">
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
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>

          <h2>Forgot Password</h2>
          <p className="forgot-subtitle">
            Enter the email address associated with your administrator account.
          </p>

          {status === 'success' ? (
            <div className="forgot-success-box">
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
              <p>{message}</p>
              <Link to="/admin-login" className="forgot-back-link">
                Back to Admin Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="forgot-form">
              <div className="forgot-form-group">
                <label>EMAIL ADDRESS</label>
                <div className="forgot-input-wrapper">
                  <FaEnvelope className="forgot-input-icon" />
                  <input
                    type="email"
                    placeholder="admin@vehiclecare.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={status === 'sending'}
                  />
                </div>
              </div>

              {status === 'error' && (
                <p className="forgot-error">{message}</p>
              )}

              <button
                type="submit"
                className="forgot-submit-btn"
                disabled={status === 'sending'}
              >
                {status === 'sending' ? 'Sending...' : 'Send Reset Link'}
              </button>

              <Link to="/admin-login" className="forgot-back-link">
                Back to Admin Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
