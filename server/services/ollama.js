const axios = require('axios');

/**
 * Ollama service for model discovery
 */

const getModels = async (url) => {
  const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;

  try {
    // Try /api/tags first (newer Ollama versions)
    try {
      const response = await axios.get(`${baseUrl}/api/tags`, { timeout: 5000 });
      if (response.data.models && Array.isArray(response.data.models)) {
        return response.data.models.map(model => ({
          id: model.name,
          name: model.name,
          description: model.name,
          contextWindow: 4096,
          maxTokens: 2048,
          capabilities: {
            vision: false,
            toolCalling: false,
            streaming: true,
            embedding: false,
          },
        }));
      }
    } catch (e) {
      // Try fallback endpoint
    }

    // Try /v1/models (OpenAI-compatible fallback)
    const response = await axios.get(`${baseUrl}/v1/models`, { timeout: 5000 });
    if (response.data.data && Array.isArray(response.data.data)) {
      return response.data.data.map(model => ({
        id: model.id,
        name: model.id,
        description: model.id,
        contextWindow: 4096,
        maxTokens: 2048,
        capabilities: {
          vision: false,
          toolCalling: false,
          streaming: true,
          embedding: false,
        },
      }));
    }

    throw new Error('No models found');
  } catch (error) {
    throw new Error(`Failed to fetch Ollama models: ${error.message}`);
  }
};

const getModelDetails = async (url, modelId) => {
  // For Ollama, we return basic model info
  return {
    modelId,
    displayName: modelId,
    contextWindow: 4096,
    maxTokens: 2048,
    vision: false,
    toolCalling: false,
    streaming: true,
    embedding: false,
    temperature: 0.7,
    topP: 0.9,
    frequencyPenalty: 0,
    presencePenalty: 0,
  };
};

module.exports = {
  getModels,
  getModelDetails,
};
