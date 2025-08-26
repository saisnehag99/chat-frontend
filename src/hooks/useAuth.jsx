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
      const username = payload.email
        ? payload.email.split('@')[0]
        : payload.name.replace(/\s+/g, '').toLowerCase();

      const userData = {
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        username,
        displayName: `@${username}`,
      };

      setUser(userData);
      localStorage.setItem('userProfile', JSON.stringify(userData));
    } catch (error) {
      console.error('Error decoding JWT:', error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userProfile'); // Remove from localStorage
    if (window.google) google.accounts.id.disableAutoSelect();
  };

  return { user, login, logout, loading };
}

export default useProvideAuth;