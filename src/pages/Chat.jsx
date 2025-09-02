import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { fetchAgents, sendMessage, checkHealth } from '../api/client.js';

export default function Chat() {
  const { user, logout } = useAuth();
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [chatMessages, setChatMessages] = useState(() => {
    const saved = localStorage.getItem("chatMessages");
    return saved ? JSON.parse(saved) : {};
  }); // Object to store messages per agent
  const [newMessage, setNewMessage] = useState('');
  const clientsUrl = 'https://chat.nanda-registry.com:6900/clients';
  let assignedServerUrl = null;
  let serverUrl = null;

  // Save chat messages to localStorage
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Load agents from API
  useEffect(() => {
    async function loadAgents() {
      try {

      // Populate with fetched agents from the registry (excluding user's own agent)
      const data = await fetchAgents(clientsUrl);
      const agentsArrayOld = Object.entries(data);
      
      // Get current user name
      const currentUserName = user ? user.name.toLowerCase().replace(/\s+/g, '') : '';
      console.log('current username is:', currentUserName)
      console.log(`Creating personal sandbox agent: ${currentUserName} - Sandbox`);
      
      // Add personal sandbox agent (only for the logged-in user)
      agentsArrayOld.push([`${currentUserName} - Sandbox`, 'alive']);
      
      // Remove the array entry that has a username associated with the sandbox agent
      const agentsArray = agentsArrayOld.filter(item => item[0] !== currentUserName);
      console.log(`Filtering out agent "${currentUserName}" for current user "${currentUserName}" - they see their sandbox instead`);
      
      // Sort agents so that the sandbox agent appears first
      agentsArray.sort(([idA, urlA], [idB, urlB]) => {
          if (idA === `${currentUserName} - Sandbox`) return -1; // User's agent goes first
          if (idB === `${currentUserName} - Sandbox`) return 1;  // User's agent goes first
          return idA.localeCompare(idB); // Alphabetical order for others
          });

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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedAgent) return;

<<<<<<< HEAD
      // Check if this is a message to another agent (starts with @), if it is then target that agent id
      const isMentionMessage = newMessage.startsWith('@');
      const isSandboxAgent = agentId.toLowerCase().includes('sandbox');
      let targetAgentId = '';

      if (isMentionMessage) {
	      console.log('checking for mention message')
        // Extract the mentioned agent name from the message
        const mentionMatch = newMessage.match(/^@(\w+)/);
        if (mentionMatch && mentionMatch[1]) {
	          targetAgentId = mentionMatch[1];
        }
      } else if (isSandboxAgent) {
        targetAgentId = agentId.slice(0, - '- Sandbox'.length);
      } else {
        targetAgentId = agentId;
      }  
=======
    const agentId = selectedAgent[0] === `${user.name} - Sandbox`
      ? user.username
      : selectedAgent[0]; 
    const message = {
      id: Date.now(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };
    
    // Add message to the specific agent's chat
    setChatMessages(prev => ({
      ...prev,
      [selectedAgent[0]]: [...(prev[selectedAgent[0]] || []), message]
    }));
    
    setNewMessage('');

    // Check if this is a message to another agent (starts with @), if it is then target that agent id
    const isMentionMessage = newMessage.startsWith('@');
    let mentionedAgent = '';
    let targetAgentId = '';
>>>>>>> 1cba5d530db6e02c8c6620713d12c955de6520f0

    if (isMentionMessage) {
      // Extract the mentioned agent name from the message
      const mentionMatch = newMessage.match(/^@(\w+)/);
      if (mentionMatch && mentionMatch[1]) {
          mentionedAgent = mentionMatch[1];
          targetAgentId = mentionMatch[1];
      }
    } else {
      targetAgentId = agentId;
    }  

    try {
      // First try to lookup the user's assigned agent using the /lookup endpoint and get the api_url
      const apiBaseUrl = "https://chat.nanda-registry.com:6900";
      const lookupUrl = `${apiBaseUrl}/lookup/${targetAgentId}`;
      console.log("Looking up user's assigned agent from:", lookupUrl);

<<<<<<< HEAD
          if (health.status === 'ok') {
            console.log('Health check passed.')
            localStorage.setItem('server_url', serverUrl);
            console.log("Found and stored user's assigned server_url:", serverUrl);
            
            try {
              // const assignedServerUrl = "https://nandaisrad.com:6001"
              const targetUrl = `${assignedServerUrl}/api/send`;
              const senderAgentId = (isMentionMessage) ? null : agentId;
	            const response = await sendMessage(targetUrl, newMessage, senderAgentId);
              // const response = await sendMessage(targetUrl, newMessage, agentId);
              console.log('sending message')
              
              // Check the response
              if (response && response.response) {
                // Normalize API response into our message shape
                const agentText = typeof response.response === 'string' ? response.response : JSON.stringify(response.response);
                const normalizedAgentMessage = {
                    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                    text: agentText,
                    sender: 'user',
                    timestamp: new Date().toLocaleTimeString()
                };
  
                // Save the updated chat to the current agent's history
                setChatMessages(prev => ({
                    ...prev,
                    [agentId]: [...(prev[agentId] || []), normalizedAgentMessage]
                  }));
                } else {
                    throw new Error('Invalid response format');
                }
                console.log('Response:', response);
                } catch (error) {
                console.error('Error sending message:', error);
                }
=======
      const response = await fetch(lookupUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
>>>>>>> 1cba5d530db6e02c8c6620713d12c955de6520f0

      if (response.ok) {
          const data = await response.json();
          if (data.api_url) {
              serverUrl = data.api_url;
              assignedServerUrl = serverUrl;
              console.log("Found the user's assigned server_url:", serverUrl);
          } else {
              console.warn("Lookup response missing api_url, falling back to allocation");
          }
      } else {
          console.warn(`Lookup failed with status ${response.status}, falling back to allocation`);
      }
    } catch (error) {
        console.error("Error fetching/assigning server URL:", error);
        assignedServerUrl = null;
        return null;
    }

    // // ✅ optional delay
    // await new Promise(r => setTimeout(r, 1000));

    try {
      // check the health of the agent
      const healthCheckUrl = `${assignedServerUrl}/api/health`;
      const health = await checkHealth(healthCheckUrl);

      if (health.status === 'ok') {
        console.log('Health check passed.')
        localStorage.setItem('server_url', serverUrl);
        console.log("Found and stored user's assigned server_url:", serverUrl);
        
        try {
          // const assignedServerUrl = "https://nandaisrad.com:6001"
          const targetUrl = `${assignedServerUrl}/api/send`;
          const response = await sendMessage(targetUrl, newMessage, agentId);
          console.log('Sent message')
          
          // Check the response
          if (response && response.response) {
            // Normalize API response into our message shape
            const agentText = typeof response.response === 'string' ? response.response : JSON.stringify(response.response);
            const normalizedAgentMessage = {
                id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                text: agentText,
                sender: 'agent',
                timestamp: new Date().toLocaleTimeString()
            };

            // Save the updated chat to the current agent's history
            setChatMessages(prev => ({
                ...prev,
                [selectedAgent[0]]: [...(prev[selectedAgent[0]] || []), normalizedAgentMessage]
              }));
          } else {
              throw new Error('Invalid response format');
          }
            console.log('Response:', response);
        } catch (error) {
        console.error('Error sending message:', error);
        }

      } else {
        console.log('Health check failed.');
      }
    } catch (error) {
    console.error("Error fetching health:", error);
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Get messages for the currently selected agent
  const currentAgentMessages = selectedAgent ? (chatMessages[selectedAgent[0]] || []) : [];

  return (
    <div className="chat-container">
      {/* Left Sidebar */}
      <div className="chat-sidebar">
        <h2 className="sidebar-title">
          NANDA Agents
        </h2>
        
        {/* Agents List - Scrollable */}
        <div className="agents-list">
          {agents.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {agents.map(([id, url]) => ( // TODO: rn just id: 'alive' not id: url
                <li 
                  key={id} 
                  onClick={() => handleAgentSelect([id, url])}
                  className={`agent-item ${selectedAgent && selectedAgent[0] === id ? 'selected' : ''}`}
                >
                  <div className="agent-name">
                    {id}
                  </div>
                  <div className="agent-url">
                    {url}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="loading-text">
              Loading agents...
            </p>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="chat-main">
        {/* User Profile Section - Top Left */}
        {user && (
          <div className="user-profile">
            <img 
              src={user.picture} 
              alt={user.name}
              className="user-avatar"
            />
            <span className="user-name">
              {user.name}
            </span>
          </div>
        )}

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="logout-button"
        >
          Logout
        </button>

        {/* Chat Window */}
        <div className="chat-window">
          {/* Background Pattern */}
          <div className="background-pattern" />
          
          {selectedAgent ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-header-content">
                  <div className="status-indicator" />
                  <h3 className="chat-title">
                    Chat with {selectedAgent[0]}
                  </h3>
                </div>
                <p className="chat-subtitle">
                  {selectedAgent[1]}
                </p>
              </div>

              {/* Chat Messages */}
              <div className="chat-messages">
                {currentAgentMessages.length === 0 ? (
                  <div className="empty-chat">
                    <div className="empty-chat-icon">
                      💬
                    </div>
                    <h4 className="empty-chat-title">
                      Start a conversation with {selectedAgent[0]}
                    </h4>
                    <p className="empty-chat-text">
                      Send your first message to begin chatting
                    </p>
                  </div>
                ) : (
                  currentAgentMessages.map((message, index) => {
                    const isAgent = (message && (message.sender === 'agent' || message.agent_id));
                    const textContent = message?.text || message?.response || message?.message || '';
                    const keyValue = message?.id ?? `${index}-${isAgent ? 'agent' : 'user'}-${message?.timestamp ?? 't'}`;
                    return (
                      <div
                        key={keyValue}
                        className={`message-container ${isAgent ? 'agent' : ''}`}
                      >
                        <div className={`message-bubble ${isAgent ? 'agent' : 'user'}`}>
                          {textContent}
                          {!isAgent && (
                            <div className="message-indicator" />
                          )}
                        </div>
                        <div className={`message-timestamp ${isAgent ? 'agent' : ''}`}>
                          {message.timestamp || ''}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input */}
              <div className="chat-input">
                <div className="input-container">
                  <div className="input-wrapper">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={`Type a message to ${selectedAgent[0]}...`}
                      className="message-textarea"
                    />
                    <div className="input-hint">
                      Press Enter to send
                    </div>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="send-button"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="welcome-screen">
              <div className="welcome-card">
                <div className="welcome-icon">
                  🤖
                </div>
                <h3 className="welcome-title">
                  Select an agent to start chatting
                </h3>
                <p className="welcome-text">
                  Choose an agent from the sidebar to begin a conversation and explore the possibilities
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
