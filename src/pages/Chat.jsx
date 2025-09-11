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
              
        // Add personal sandbox agent (only for the logged-in user)
        const currentUserName = user ? user.name.toLowerCase().replace(/\s+/g, '') : '';
        agentsArrayOld.push([`${currentUserName} - Sandbox`, 'alive'])
        const sandboxName = `${currentUserName} - Sandbox`;
        console.log(`Creating personal sandbox agent: ${sandboxName}`);
        
        // Remove the array entry that has a username associated with the sandbox agent
        const agentsArray = agentsArrayOld.filter(item => item[0] !== currentUserName);
        console.log(`Filtering out agent "${currentUserName}" for current user "${currentUserName}" - they see their sandbox instead`);
      
        // Sort agents so that the sandbox agent appears first
        agentsArray.sort(([idA, urlA], [idB, urlB]) => {
            if (idA === sandboxName) return -1; // User's agent goes first
            if (idB === sandboxName) return 1;  // User's agent goes first
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

  const pollForMessages = async () => {
    // Use the new /api/render endpoint
    const pollUrl = `${assignedServerUrl}/api/render`;
    console.log("Polling for messages at:", pollUrl);

    try {
        const response = await fetch(pollUrl);
        if (!response.ok) {
            // Don't spam errors for expected empty polls or temporary issues
            if (response.status !== 404 && response.status !== 204) { 
                 console.error(`Polling failed: ${response.status} ${response.statusText}`);
            }
            return; 
        }

        // Assuming /api/render returns a single message object or null/empty if none
        const message = await response.json();

        // Accept both `message` (old) and `message_content` (new) keys
        const textField = message ? (message.message || message.message_content) : null;

        if (textField) {
            console.log(`Received message via polling:`, message);
            
            // Update sender chat history with new message
            setChatMessages(prev => ({
                ...prev,
                [selectedAgent[0]]: [...(prev[selectedAgent[0]] || []), message]
              }));

        } else {
        }
    } catch (error) {
        console.error("Error during polling fetch:", error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
    // Don't clear messages - they're now stored per agent
  };

  


  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedAgent) return;

    const agentId = selectedAgent[0] === `${user.name} - Sandbox`
      ? user.username
      : selectedAgent[0];
    const message = {
      id: Date.now(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    // Set assigned server url
    const currentUserName = user ? user.name.toLowerCase().replace(/\s+/g, '') : '';
    const apiBaseUrl = "https://chat.nanda-registry.com:6900";
    const lookupUrl = `${apiBaseUrl}/lookup/${currentUserName}`;
    const response = await fetch(lookupUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (response.ok) {
        const data = await response.json();
        if (data.api_url) {
            assignedServerUrl = data.api_url;
            console.log("Found the user's assigned server_url:", assignedServerUrl);
        } else {
            console.warn("Lookup response missing api_url, falling back to allocation");
        }
      }
    
    // Add message to the specific agent's chat
    setChatMessages(prev => ({
      ...prev,
      [selectedAgent[0]]: [...(prev[selectedAgent[0]] || []), message]
    }));
    
    setNewMessage('');

    // Check if this is a message to another agent (starts with @), if it is then target that agent id
    const isMentionMessage = newMessage.startsWith('@');
    let targetAgentId = '';
    let targetAgentIdNew = '';


    if (isMentionMessage) {
      // Extract the mentioned agent name from the message
      const mentionMatch = newMessage.match(/^@(\w+)/);
      if (mentionMatch && mentionMatch[1]) {
          targetAgentId = mentionMatch[1];
      }
    } else {
      targetAgentId = agentId;
    }  

    targetAgentIdNew = targetAgentId.replace(" - Sandbox", "");

    try {
      // First try to lookup the user's assigned agent using the /lookup endpoint and get the api_url
      const apiBaseUrl = "https://chat.nanda-registry.com:6900";
      const lookupUrl = `${apiBaseUrl}/lookup/${targetAgentIdNew}`;
      console.log("Looking up user's assigned agent from:", lookupUrl);

      const response = await fetch(lookupUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
          const data = await response.json();
          if (data.api_url) {
              serverUrl = data.api_url;
              console.log("Found the target's assigned server_url:", serverUrl);
          } else {
              console.warn("Lookup response missing api_url, falling back to allocation");
          }
      } else {
          console.warn(`Lookup failed with status ${response.status}, falling back to allocation`);
      }
    } catch (error) {
        console.error("Error fetching/assigning server URL:", error);
        serverUrl = null;
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
        
        try {
          // const assignedServerUrl = "https://nandaisrad.com:6001"
          const targetUrl = `${assignedServerUrl}/api/send`;
          const response = await sendMessage(targetUrl, newMessage, targetAgentId);
          console.log('Sent message')
          
          // Check the response
          if (response && response.response) {
            // Normalize API response into our message shape
            let agentText = typeof response.response === 'string' ? response.response : JSON.stringify(response.response);

            // Update the text based on message type
            let isUser=false;
            let senderName = currentUserName;
            // Filter out system notification messages
            if (!isUser && agentText) {
                // Skip system notification messages
                if (agentText.includes('[AGENT') && agentText.includes('Message sent to')) {
                    console.log("UI filtered out system message:", agentText);
                    return;
                }
            }
    
            // Check if this is an agent-enhanced message (contains @mention and agent info)
            // Check the message content regardless of isUser value since app.js may pass isUser=true for enhanced messages
            const isAgentEnhanced = agentText.includes('[AGENT');
            
            // Extract original message and agent enhancement if it's an agent-enhanced message
            let agentEnhancement = '';
            let targetUser = '';
            let isActuallyUserMessage = isUser; // Track the corrected user status
            
            if (isAgentEnhanced) {
                console.log(`🔍 Detected potential agent-enhanced message: "${agentText}"`);
                
                // Parse the actual message format we're seeing:
                // "@mihirsheth9999: [AGENT agentm33 Sending]: Dear Mihir, I hope you're well. Best regards"
                // Fixed regex to handle additional text after agent ID (like "Sending") and multiline content
                let agentMatch = agentText.match(/^@(\w+):\s*\[AGENT\s+([^\]]+)\]:\s*([\s\S]+)$/);
                let agentId = null;
                
                if (agentMatch) {
                    // Format: @user: [AGENT agentId ...]: message
                    targetUser = agentMatch[1];
                    agentId = agentMatch[2].split(/\s+/)[0]; // Get just the agent ID, ignore additional text
                    agentEnhancement = agentMatch[3];
                    console.log(`📝 Enhanced message detected - Target: ${targetUser}, Agent: ${agentId}, Message: "${agentEnhancement}"`);
                } else {
                    // Fallback: try simpler pattern [AGENT id]: message (with multiline support)
                    agentMatch = agentText.match(/^\[AGENT\s+([^\]]+)\]:\s*([\s\S]+)$/);
                    if (agentMatch) {
                        agentId = agentMatch[1].split(/\s+/)[0]; // Get just the agent ID, ignore additional text
                        agentEnhancement = agentMatch[2];
                        console.log(`📝 Simple enhanced message detected - Agent: ${agentId}, Message: "${agentEnhancement}"`);
                    }
                }
        
                console.log(`🔬 Debug values: agentMatch=${!!agentMatch}, agentId="${agentId}", agentEnhancement="${agentEnhancement}"`);
            
                if (agentMatch && agentId) {
                    // For agent-enhanced messages, we should ALWAYS treat them as user messages
                    // because they represent the user's original message that was enhanced by their agent
                    isActuallyUserMessage = true;
                    console.log(`✅ Agent-enhanced message will be treated as USER message (right side)`);
                    console.log(`🎯 Enhanced content: "${agentEnhancement}"`);
                    console.log(`📤 Target user: "${targetUser}"`);
                    agentText= agentText.replace(agentMatch[1], '').replace('[AGENT ]:','')
                    agentText = 'AI Enhanced: '+agentText
                } else {
                    console.log(`❌ Agent match failed - treating as regular message`);
                    agentText = '@'+senderName + ': '+agentText
                }
            }
    
            // Clean up agent prefix patterns for regular messages
            if (!isActuallyUserMessage && !isAgentEnhanced && agentText) {
                const agentPrefixPattern = /^agent\d+:\s+FROM\s+agent\d+:/;
                if (agentPrefixPattern.test(agentText)) {
                  agentText = agentText.replace(agentPrefixPattern, '');
                }
                
                if (agentText.includes('FROM ') || agentText.toLowerCase().includes('from agent')) {
                    agentText = agentText.replace(/FROM\s+agent\d+\s*:\s*/i, '');
                    agentText = agentText.replace(/FROM\s+\w+\s*:\s*/i, '');
                }
              }

            // Normalize the message
            const normalizedAgentMessage = {
                id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                text: agentText,
                sender: 'agent',
                timestamp: new Date().toLocaleTimeString()
            };

            if (response.response.includes('Message sent to')) {
             } else {
            // Save the updated chat to the current agent's history
            setChatMessages(prev => ({
                ...prev,
                [selectedAgent[0]]: [...(prev[selectedAgent[0]] || []), normalizedAgentMessage]
            }));
            }
            
            // Poll for messages
            pollForMessages();

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
                  {/* <div className="agent-url">
                    {url}
                  </div> */}
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

        {/* Reset Button */}
        {/* <button 
          onClick={() => {
            setChatMessages({});
          }}
          className="reset-button"
        >
          Reset
        </button> */}

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