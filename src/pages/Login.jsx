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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
      <h1>Login</h1>
      <p>Please sign in with Google to continue</p>
      <GoogleLogin
        onSuccess={login}
        onError={() => console.error('Google login failed')}
        useOneTap
      />
    </div>
  );
}
