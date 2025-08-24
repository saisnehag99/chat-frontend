import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Chat() {
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState([
    { id: 1, text: 'Welcome to the chat!', sender: 'System', timestamp: new Date().toLocaleTimeString() }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        text: newMessage.trim(),
        sender: user?.name || 'User',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: '1px solid #e0e0e0',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user?.picture && (
            <img 
              src={user.picture} 
              alt={user.name} 
              style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%' 
              }} 
            />
          )}
          <div>
            <h2 style={{ margin: 0 }}>Chat</h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              Welcome, {user?.name || 'User'}!
            </p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      {/* Messages */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        {messages.map((message) => (
          <div 
            key={message.id}
            style={{
              marginBottom: '15px',
              padding: '10px',
              backgroundColor: message.sender === 'System' ? '#e3f2fd' : 'white',
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '5px'
            }}>
              <strong style={{ color: message.sender === 'System' ? '#1976d2' : '#333' }}>
                {message.sender}
              </strong>
              <span style={{ fontSize: '12px', color: '#666' }}>
                {message.timestamp}
              </span>
            </div>
            <p style={{ margin: 0, wordBreak: 'break-word' }}>
              {message.text}
            </p>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        />
        <button 
          type="submit"
          disabled={!newMessage.trim()}
          style={{
            padding: '12px 24px',
            backgroundColor: newMessage.trim() ? '#007bff' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
            fontSize: '16px'
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
