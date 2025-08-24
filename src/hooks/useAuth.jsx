import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

function useProvideAuth() {
  const [user, setUser] = useState(() => {
    // Load user from localStorage if available
    const storedUser = localStorage.getItem('userProfile');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If user is already loaded from localStorage, set loading to false
    if (user) {
      setLoading(false);
    }

    const handleResponse = (response) => {
      const payload = JSON.parse(
        atob(response.credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
      );
      const userData = {
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
      };
      setUser(userData);
      setLoading(false);
      localStorage.setItem('userProfile', JSON.stringify(userData)); // Save to localStorage
    };

    // Load Google script dynamically
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('Google script loaded successfully');
      console.log('Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
      
      try {
        google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleResponse,
        });
        console.log('Google accounts initialized successfully');
        setLoading(false);
      } catch (error) {
        console.error('Error initializing Google accounts:', error);
        setLoading(false);
      }
    };
    script.onerror = (error) => {
      console.error('Error loading Google script:', error);
      setLoading(false);
    };
    document.body.appendChild(script);

    // Set a timeout to ensure loading state is handled even if Google script fails
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => {
      document.body.removeChild(script);
      clearTimeout(timeout);
    };
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userProfile'); // Remove from localStorage
    if (window.google) google.accounts.id.disableAutoSelect();
  };

  return { user, logout, loading };
}

export default useProvideAuth;