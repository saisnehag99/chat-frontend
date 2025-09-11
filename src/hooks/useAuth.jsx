import { useState, useEffect, createContext, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

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
  const [loading, setLoading] = useState(false);

  const login = (credentialResponse) => {
    try {
      const payload = jwtDecode(credentialResponse.credential);
      console.log('payload', payload)

      // Store the user profile data from the backend
      const username = payload.email
        ? payload.email.split('@')[0]
        : payload.name.replace(/\s+/g, '').toLowerCase();

      const userData = {
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        username: username,
        displayName: `@${username}`,
      };
      setUser(userData);
      localStorage.setItem('userProfile', JSON.stringify(userData));

      // Ensure we have a client ID for allocation
      if (!localStorage.getItem('client_id')) {
        localStorage.setItem('client_id', 'client-' + Date.now());
      }

      // Store the user data from the backend
      localStorage.setItem('user', JSON.stringify(payload))

      // IMPORTANT: Store the api_url to prevent the app from calling /api/allocate again
      if (data.api_url) {
        localStorage.setItem('server_url', payload.api_url);
        console.log("✅ Stored existing user's api_url:", payload.api_url);
    } else {
        console.warn("⚠️ No api_url returned for existing user, app will need to call /api/allocate");
    }

    } catch (error) {
      console.error('Error decoding JWT:', error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userProfile'); // Remove from localStorage
    if (window.google) google.accounts.id.disableAutoSelect();
    // Redirect to login page
    window.location.href = '/';
  };

  return { user, login, logout, loading };
}

export default useProvideAuth;