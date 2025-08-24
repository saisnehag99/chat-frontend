import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { fetchAgents } from '../api/client.js';

export default function Chat() {
  const { user, logout } = useAuth();
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [chatMessages, setChatMessages] = useState({}); // Object to store messages per agent
  const [newMessage, setNewMessage] = useState('');
  const clientsUrl = 'https://chat.nanda-registry.com:6900/clients';

  useEffect(() => {
    async function loadAgents() {
      try {
        const data = await fetchAgents(clientsUrl);
        const agentsArray = Object.entries(data);
        
        // Sort agents so that if there's an agent with the same ID as username, it appears first
        if (user?.username) {
          agentsArray.sort(([idA, urlA], [idB, urlB]) => {
            if (idA === user.username) return -1; // User's agent goes first
            if (idB === user.username) return 1;  // User's agent goes first
            return idA.localeCompare(idB); // Alphabetical order for others
          });
        }
        
        setAgents(agentsArray);
        
        // Set the first agent as default selection
        if (agentsArray.length > 0 && !selectedAgent) {
          setSelectedAgent(agentsArray[0]);
        }
      } catch (err) {
        console.error('Failed to load agents:', err);
      }
    }

    loadAgents();
  }, [user?.username]); // Add user.username as dependency to re-sort when user changes
  // TODO: is the above dependency necessary? could be if add change username feature

  const handleLogout = () => {
    logout();
  };

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
    // Don't clear messages - they're now stored per agent
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedAgent) {
      const agentId = selectedAgent[0];
      const message = {
        id: Date.now(),
        text: newMessage,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString()
      };
      
      // Add message to the specific agent's chat
      setChatMessages(prev => ({
        ...prev,
        [agentId]: [...(prev[agentId] || []), message]
      }));
      
      setNewMessage('');
      
      // TODO: Send message to selected agent via API
      // For now, just simulate a response
      setTimeout(() => {
        const response = {
          id: Date.now() + 1,
          text: `This is a simulated response from ${agentId}. Your message: "${newMessage}"`,
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString()
        };
        
        setChatMessages(prev => ({
          ...prev,
          [agentId]: [...(prev[agentId] || []), response]
        }));
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Get messages for the currently selected agent
  const currentAgentMessages = selectedAgent ? (chatMessages[selectedAgent[0]] || []) : [];

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
              {agents.map(([id, url]) => ( // TODO: rn just id: 'alive' not id: url
                <li 
                  key={id} 
                  onClick={() => handleAgentSelect([id, url])}
                  style={{
                    padding: '12px',
                    backgroundColor: selectedAgent && selectedAgent[0] === id ? '#e3f2fd' : 'white',
                    border: selectedAgent && selectedAgent[0] === id ? '2px solid #007bff' : '1px solid #dee2e6',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    ':hover': {
                      backgroundColor: selectedAgent && selectedAgent[0] === id ? '#e3f2fd' : '#e9ecef',
                      borderColor: '#007bff'
                    }
                  }}
                >
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

        {/* Chat Window */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          marginTop: '80px',
          padding: '20px'
        }}>
          {selectedAgent ? (
            <>
              {/* Chat Header */}
              <div style={{
                padding: '16px',
                backgroundColor: '#f8f9fa',
                borderBottom: '1px solid #dee2e6',
                borderRadius: '8px 8px 0 0',
                marginBottom: '0'
              }}>
                <h3 style={{ margin: 0, color: '#333' }}>
                  Chat with {selectedAgent[0]}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
                  {selectedAgent[1]}
                </p>
              </div>

              {/* Chat Messages */}
              <div style={{
                flex: 1,
                backgroundColor: 'white',
                border: '1px solid #dee2e6',
                borderTop: 'none',
                padding: '16px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {currentAgentMessages.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    color: '#666',
                    marginTop: '20px'
                  }}>
                    Start a conversation with {selectedAgent[0]}
                  </div>
                ) : (
                  currentAgentMessages.map(message => (
                    <div
                      key={message.id}
                      style={{
                        alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '70%'
                      }}
                    >
                      <div style={{
                        backgroundColor: message.sender === 'user' ? '#007bff' : '#e9ecef',
                        color: message.sender === 'user' ? 'white' : '#333',
                        padding: '12px 16px',
                        borderRadius: '18px',
                        fontSize: '14px',
                        wordWrap: 'break-word'
                      }}>
                        {message.text}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#666',
                        marginTop: '4px',
                        textAlign: message.sender === 'user' ? 'right' : 'left'
                      }}>
                        {message.timestamp}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div style={{
                padding: '16px',
                backgroundColor: 'white',
                border: '1px solid #dee2e6',
                borderTop: 'none',
                borderRadius: '0 0 8px 8px',
                display: 'flex',
                gap: '12px'
              }}>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Type a message to ${selectedAgent[0]}...`}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    resize: 'none',
                    minHeight: '44px',
                    maxHeight: '120px',
                    fontFamily: 'inherit',
                    fontSize: '14px'
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: newMessage.trim() ? '#007bff' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#666'
            }}>
              <h3>Select an agent to start chatting</h3>
              <p>Choose an agent from the sidebar to begin a conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
