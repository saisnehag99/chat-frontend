/**
 * ui-manager.js
 * Handles ui styling of messages
 */

/**
 * Update the message text depending on the type of message
 * @param {string} message - The message text
 * @param {boolean} isUser - Whether the message is from the user (true) or agent (false)
 * @param {string} senderName - Sender name for agent to user messages
 * @returns {string} - The updated message text
 */
 export async function updateMessage(message, isUser = false, senderName = null) {

    // Filter out system notification messages
    if (!isUser && message) {
        // Skip system notification messages
        if (message.includes('[AGENT') && message.includes('Message sent to')) {
            console.log("UI filtered out system message:", message);
            return;
        }
    }
    
    // Check if this is an agent-enhanced message (contains @mention and agent info)
    // Check the message content regardless of isUser value since app.js may pass isUser=true for enhanced messages
    const isAgentEnhanced = message.includes('[AGENT');
    
    // Extract original message and agent enhancement if it's an agent-enhanced message
    let agentEnhancement = '';
    let targetUser = '';
    let isActuallyUserMessage = isUser; // Track the corrected user status
    
    if (isAgentEnhanced) {
        console.log(`🔍 Detected potential agent-enhanced message: "${message}"`);
        
        // Parse the actual message format we're seeing:
        // "@mihirsheth9999: [AGENT agentm33 Sending]: Dear Mihir, I hope you're well. Best regards"
        // Fixed regex to handle additional text after agent ID (like "Sending") and multiline content
        let agentMatch = message.match(/^@(\w+):\s*\[AGENT\s+([^\]]+)\]:\s*([\s\S]+)$/);
        let agentId = null;
        
        if (agentMatch) {
            // Format: @user: [AGENT agentId ...]: message
            targetUser = agentMatch[1];
            agentId = agentMatch[2].split(/\s+/)[0]; // Get just the agent ID, ignore additional text
            agentEnhancement = agentMatch[3];
            console.log(`📝 Enhanced message detected - Target: ${targetUser}, Agent: ${agentId}, Message: "${agentEnhancement}"`);
        } else {
            // Fallback: try simpler pattern [AGENT id]: message (with multiline support)
            agentMatch = message.match(/^\[AGENT\s+([^\]]+)\]:\s*([\s\S]+)$/);
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
            message = message.replace(agentMatch[1], '').replace('[AGENT ]:','')
            message = 'AI Enhanced: '+message
        } else {
            console.log(`❌ Agent match failed - treating as regular message`);
            message = '@'+senderName + ': '+message
        }
    }
    
    // Clean up agent prefix patterns for regular messages
    if (!isActuallyUserMessage && !isAgentEnhanced && message) {
        const agentPrefixPattern = /^agent\d+:\s+FROM\s+agent\d+:/;
        if (agentPrefixPattern.test(message)) {
            message = message.replace(agentPrefixPattern, '');
        }
        
        if (message.includes('FROM ') || message.toLowerCase().includes('from agent')) {
            message = message.replace(/FROM\s+agent\d+\s*:\s*/i, '');
            message = message.replace(/FROM\s+\w+\s*:\s*/i, '');
        }
    }

    return message;

}