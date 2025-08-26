/**
 * client.js
 * Handles backend API calls for NANDA Agent App
 */

/**
 * Fetch the list of available agents from the registry URL
 * @param {string} registryListUrl - The full URL of the registry list endpoint
 * @returns {Promise<object>} - Object with agent IDs as keys and URLs as values
 */
export async function fetchAgents(registryListUrl) {
    try {
        console.log(`Fetching agents from ${registryListUrl}`);

        const response = await fetch(registryListUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch agents: ${response.status}`);
        }

        const data = await response.json();
        console.log('Raw API response:', data);
        
        return data;
    } catch (error) {
        console.error('Error fetching agents:', error);
        throw error;
    }
}

/**
     * Send a message to the specified agent endpoint URL
     * @param {string} targetUrl - The full URL of the API endpoint (e.g., `${server_url}/api/send`)
     * @param {string} message - The message text to send
     * @param {string} agentId - Optional target agent ID (used for @mention format)
     * @returns {Promise<object>} - The response from the agent
     */
export async function sendMessage(targetUrl, message, agentId) {
    try {
        console.log(`Sending message to ${targetUrl}:`, message);
        console.log(`Raw message: "${message}", agentId: ${agentId}`);
        
        // Get the user's name from localStorage
        let senderName = "Anonymous";
        const userProfileStr = localStorage.getItem('userProfile');
        console.log('Raw userProfile from localStorage:', userProfileStr);
        
        if (userProfileStr) {
            try {
                const userProfile = JSON.parse(userProfileStr);
                console.log('Parsed userProfile:', userProfile);
                if (userProfile && userProfile.name) {
                    senderName = userProfile.name;
                    console.log('✅ Found sender name:', senderName);
                } else {
                    console.warn('⚠️ userProfile exists but no name field found');
                }
            } catch (error) {
                console.error('❌ Error parsing user profile:', error);
            }
        } else {
            console.warn('⚠️ No userProfile found in localStorage');
        }
        
        const requestPayload = {
            message: message,
            conversation_id: null,
            sender_name: senderName  // Include the sender's name in the request
        };
        
        console.log('📤 Sending request payload:', requestPayload);
        
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestPayload)
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        // More detailed logging
        console.log('Response received:', data);
        console.log('Response type:', typeof data);
        console.log('Response contains response field:', data.hasOwnProperty('response'));
        console.log('Response contains message field:', data.hasOwnProperty('message'));
        console.log('Response contains from_agent field:', data.hasOwnProperty('from_agent'));
        console.log('Response from agent:', data.agent_id);
        
        // Check if this is a message sent confirmation and what it contains
        if (data.response && data.response.includes('Message sent to')) {
            console.log('This is a message forwarding confirmation:', data.response);
            
            // Let's check if we get any additional polling data in the next few seconds that might contain the actual response
            console.log('Will poll for actual response from target agent');
        }
        
        return data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}

/**
* Check the health of an agent API endpoint
* @param {string} healthCheckUrl - The full URL of the health check endpoint (e.g., `${server_url}/api/health`)
* @returns {Promise<object>} - Health status information
*/
export async function checkHealth(healthCheckUrl) {
   try {
       console.log(`Checking health at ${healthCheckUrl}`);
       
       const response = await fetch(healthCheckUrl);
       return await response.json();
   } catch (error) {
       console.error('Health check failed:', error);
       return { status: 'error', message: error.message };
   }
}