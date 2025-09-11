import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Login() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, redirect to chat
    if (user && !loading) {
      navigate('/chat');
    }
  }, [user, loading, navigate]);

  // Don't render login form if user is already authenticated
  if (user || loading) {
    return (
      <div className="login-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      {/* Background Elements */}
      <div className="login-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Main Login Card */}
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Main agent body */}
              <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
              {/* Agent eyes */}
              <circle cx="9" cy="10" r="1.5" fill="currentColor"/>
              <circle cx="15" cy="10" r="1.5" fill="currentColor"/>
              {/* Agent mouth */}
              <path d="M9 14C9 14 10.5 16 12 16C13.5 16 15 14 15 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              {/* Antenna/communication lines */}
              <path d="M12 4L12 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M8 6L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M16 6L18 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              {/* Connection dots */}
              <circle cx="6" cy="4" r="1" fill="currentColor"/>
              <circle cx="18" cy="4" r="1" fill="currentColor"/>
              <circle cx="12" cy="2" r="1" fill="currentColor"/>
            </svg>
          </div>
          <h1 className="login-title">Welcome to NANDA</h1>
          <p className="login-subtitle">Connect with AI agents and start intelligent conversations</p>
        </div>

        <div className="login-content">
          <div className="google-login-wrapper">
            <GoogleLogin
              onSuccess={login}
              onError={() => console.error('Google login failed')}
              useOneTap
              theme="filled_blue"
              size="large"
              width="280"
            />
          </div>
          
          <div className="login-features">
            <div className="feature-item">
              <div className="feature-icon">🤖</div>
              <span>AI-Powered Agents</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">💬</div>
              <span>Smart Conversations</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔒</div>
              <span>Secure & Private</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="login-footer">
        <p>© 2025 NANDA Agentic Chat. All rights reserved.</p>
      </div>
    </div>
  );
}
