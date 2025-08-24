import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, redirect to chat
    if (user && !loading) {
      navigate('/chat');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Render Google sign-in button when component mounts and Google script is ready
    if (!user && !loading) {
      console.log('Login component mounted, checking Google availability...');
      console.log('window.google:', window.google);
      console.log('window.google?.accounts:', window.google?.accounts);
      console.log('VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
      
      if (window.google && window.google.accounts) {
        const renderGoogleButton = () => {
          try {
            console.log('Rendering Google button...');
            window.google.accounts.id.renderButton(
              document.getElementById('google-signin-button'),
              { 
                theme: 'outline', 
                size: 'large'
              }
            );
            console.log('Google button rendered successfully');
          } catch (error) {
            console.error('Error rendering Google button:', error);
          }
        };

        // Small delay to ensure DOM is ready
        const timer = setTimeout(renderGoogleButton, 100);
        return () => clearTimeout(timer);
      } else {
        console.log('Google script not ready yet, waiting...');
        // Poll for Google script to be ready
        const interval = setInterval(() => {
          if (window.google && window.google.accounts) {
            console.log('Google script now ready, rendering button...');
            clearInterval(interval);
            const renderGoogleButton = () => {
              try {
                window.google.accounts.id.renderButton(
                  document.getElementById('google-signin-button'),
                  { 
                    theme: 'outline', 
                    size: 'large'
                  }
                );
                console.log('Google button rendered successfully');
              } catch (error) {
                console.error('Error rendering Google button:', error);
              }
            };
            setTimeout(renderGoogleButton, 100);
          }
        }, 500);

        return () => clearInterval(interval);
      }
    }
  }, [user, loading]);

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
      {/* Google Sign-In button will render here */}
      <div id="google-signin-button"></div>
    </div>
  );
}
