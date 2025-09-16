import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth.jsx';
import { checkUser, signupUser, setupUser } from '../api/client.js';

export default function Login() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for URL parameters
  const urlParams = new URLSearchParams(location.search);
  console.log(`urlParams: ${urlParams}`);
  const hasUrlParams = urlParams.toString().length > 0;

  useEffect(() => {
    async function checkUserExists() {
      // User exists and authenticated
      if (user && !loading) {
        const data = await checkUser(
          "https://chat.nanda-registry.com:6900/api/check-user",
          user.email
        );

        if (data.exists) {
          // Returning user → straight to chat
          navigate("/chat");
        } else {
          // New user (regardless of URL params) → must pick username
          setShowUsernameInput(true);
        }
      }
    }

    checkUserExists();
  }, [user, loading, navigate]);

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    setIsSubmitting(true);

    // For a user with registered agents, setup 
    async function setup() {
      console.log('Setting up user...');
      const data = await setupUser(
        "https://chat.nanda-registry.com:6900/api/setup",
        user.email,
        username.trim(),
        urlParams.get('agentId') || null
      );
      console.log('Set up user with registered agents. Data:', data);
    }

    // For a user without regisered agents, sign them up
    async function signup() {
      console.log('Signing up new user...');
      const data = await signupUser(
        "https://chat.nanda-registry.com:6900/api/signup",
        user.email,
        username.trim()
      );
      console.log('Signed up new user. Data:', data);
    }

    // Test if actually signed up
    async function checkUserExists() {
      const data = await checkUser(
        "https://chat.nanda-registry.com:6900/api/check-user",
        user.email
      );
      console.log('Checked user existence after setup/signup. Data:', data);
    }

    if (user) {
      if (hasUrlParams) await setup();
      else await signup();
      await checkUserExists();
    }
    
    navigate(`/chat`);
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="login-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show username input if user is authenticated and has URL params
  if (user && showUsernameInput) {
    return (
      <div className="login-container">
        {/* Background Elements */}
        <div className="login-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>

        {/* Username Input Card */}
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="login-title">Enter Your Username</h1>
            <p className="login-subtitle">Choose a username to continue to the chat</p>
          </div>

          <div className="login-content">
            <form onSubmit={handleUsernameSubmit} className="username-form">
              <div className="input-group">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="username-input"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <button
                type="submit"
                className="continue-button"
                disabled={!username.trim() || isSubmitting}
              >
                {isSubmitting ? 'Continuing...' : 'Continue to Chat'}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <p>© 2025 NANDA Agentic Chat. All rights reserved.</p>
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
