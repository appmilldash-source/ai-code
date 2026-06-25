const axios = require('axios');
const ollamaService = require('./ollama');
const openaiService = require('./openai');

/**
 * Detect the provider type based on URL and API responses
 */
const detectProvider = async (url, apiKey) => {
  // Normalize URL
  const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;

  try {
    // Try Ollama endpoints
    try {
      const response = await axios.get(`${baseUrl}/api/tags`, { timeout: 5000 });
      return {
        provider: 'ollama',
        version: response.data.version || 'unknown',
        status: 'connected',
      };
    } catch (e) {
      // Ollama not detected, continue
    }

    // Try OpenAI-compatible endpoints
    try {
      const config = apiKey ? { headers: { Authorization: `Bearer ${apiKey}` } } : {};
      const response = await axios.get(`${baseUrl}/v1/models`, { ...config, timeout: 5000 });
      
      if (response.data.object === 'list' && response.data.data) {
        // Check if it's actual OpenAI
        if (baseUrl.includes('api.openai.com')) {
          return {
            provider: 'openai',
            version: 'v1',
            status: 'connected',
          };
        }
        // Otherwise it's OpenAI-compatible
        return {
          provider: 'openai-compatible',
          version: 'v1',
          status: 'connected',
        };
      }
    } catch (e) {
      // Not OpenAI-compatible, continue
    }

    throw new Error(
      'Could not detect provider. Supported: Ollama (/api/tags), OpenAI (/v1/models), OpenAI-compatible (/v1/models), or Gemini (with Google API Key)'
    );
  } catch (error) {
    throw new Error(`Connection failed: ${error.message}`);
  }
};

/**
 * Test connection to a provider
 */
const testConnection = async (url, apiKey) => {
  const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;

  try {
    const detection = await detectProvider(baseUrl, apiKey);
    return detection;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  detectProvider,
  testConnection,
};
