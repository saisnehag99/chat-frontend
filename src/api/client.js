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
