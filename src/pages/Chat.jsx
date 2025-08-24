import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { fetchAgents } from '../api/client.js';

export default function Chat() {
  const { user, logout } = useAuth();
  const [agents, setAgents] = useState([]);
  const clientsUrl = 'https://chat.nanda-registry.com:6900/clients';

  useEffect(() => {
    async function loadAgents() {
      try {
        const data = await fetchAgents(clientsUrl);
        setAgents(Object.entries(data));
      } catch (err) {
        console.error('Failed to load agents:', err);
      }
    }

    loadAgents();
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <div style={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'row'
    }}>
      {/* Left Sidebar */}
      <div style={{
        width: '250px',
        backgroundColor: '#f8f9fa',
        borderRight: '1px solid #dee2e6',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h2 style={{
          margin: '0 0 20px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#333',
          borderBottom: '2px solid #007bff',
          paddingBottom: '10px'
        }}>
          NANDA Agents
        </h2>
        
        {/* Agents List */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {agents.length > 0 ? (
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              {agents.map(([id, url]) => (
                <li key={id} style={{
                  padding: '12px',
                  backgroundColor: 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  ':hover': {
                    backgroundColor: '#e9ecef',
                    borderColor: '#007bff'
                  }
                }}>
                  <div style={{
                    fontWeight: '500',
                    color: '#333',
                    marginBottom: '4px'
                  }}>
                    {id}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#666',
                    wordBreak: 'break-all'
                  }}>
                    {url}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#666', fontSize: '14px' }}>
              Loading agents...
            </p>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* User Profile Section - Top Left */}
        {user && (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 10
          }}>
            <img 
              src={user.picture} 
              alt={user.name}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            <span style={{
              fontSize: '16px',
              fontWeight: '500',
              color: '#333'
            }}>
              {user.name}
            </span>
          </div>
        )}

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          Logout
        </button>

        {/* Main Chat Content */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          marginTop: '80px' // Add margin to account for the profile and logout buttons
        }}>
          <h1>Chat Page</h1>
          <p>Welcome to chat page!</p>
        </div>
      </div>
    </div>
  );
}
