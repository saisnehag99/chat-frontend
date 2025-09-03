import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Chat from './pages/Chat.jsx';
import { useAuth } from './hooks/useAuth.jsx';

function App() {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="" element={<Login />} />
        <Route 
          path="/chat" 
          element={user ? <Chat /> : <Navigate to="" />} 
        />
        <Route path="*" element={<Navigate to={user ? "/chat" : ""} />} />
      </Routes>
    </Router>
  );
}

export default App;
