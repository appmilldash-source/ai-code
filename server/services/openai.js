const axios = require('axios');

/**
 * OpenAI and OpenAI-compatible services for model discovery
 */

// Known OpenAI models with their capabilities
const OPENAI_MODELS = {
  'gpt-4-turbo': {
    displayName: 'GPT-4 Turbo',
    contextWindow: 128000,
    maxTokens: 4096,
    inputPrice: 0.01,
    outputPrice: 0.03,
    vision: true,
    toolCalling: true,
    streaming: true,
    embedding: false,
  },
  'gpt-4': {
    displayName: 'GPT-4',
    contextWindow: 8192,
    maxTokens: 2048,
    inputPrice: 0.03,
    outputPrice: 0.06,
    vision: false,
    toolCalling: true,
    streaming: true,
    embedding: false,
  },
  'gpt-3.5-turbo': {
    displayName: 'GPT-3.5 Turbo',
    contextWindow: 4096,
    maxTokens: 2048,
    inputPrice: 0.0005,
    outputPrice: 0.0015,
    vision: false,
    toolCalling: true,
    streaming: true,
    embedding: false,
  },
  'text-embedding-3-small': {
    displayName: 'Text Embedding 3 Small',
    contextWindow: 8191,
    maxTokens: null,
    inputPrice: 0.00002,
    outputPrice: 0,
    vision: false,
    toolCalling: false,
    streaming: false,
    embedding: true,
  },
};

const getModels = async (apiKey) => {
  try {
    const response = await axios.get('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 10000,
    });

    if (!response.data.data || !Array.isArray(response.data.data)) {
      throw new Error('Invalid response format from OpenAI');
    }

    return response.data.data
      .filter(model => !model.id.includes('old'))
      .map(model => {
        const details = OPENAI_MODELS[model.id] || {};
        return {
          id: model.id,
          name: details.displayName || model.id,
          description: model.id,
          contextWindow: details.contextWindow || 4096,
          maxTokens: details.maxTokens || 2048,
          inputPrice: details.inputPrice,
          outputPrice: details.outputPrice,
          capabilities: {
            vision: details.vision || false,
            toolCalling: details.toolCalling || false,
            streaming: details.streaming || true,
            embedding: details.embedding || false,
          },
        };
      });
  } catch (error) {
    throw new Error(`Failed to fetch OpenAI models: ${error.message}`);
  }
};

const getCompatibleModels = async (url, apiKey) => {
  const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;

  try {
    const config = apiKey ? { headers: { Authorization: `Bearer ${apiKey}` } } : {};
    const response = await axios.get(`${baseUrl}/v1/models`, { ...config, timeout: 5000 });

    if (!response.data.data || !Array.isArray(response.data.data)) {
      throw new Error('Invalid response format');
    }

    return response.data.data.map(model => ({
      id: model.id,
      name: model.id,
      description: model.id,
      contextWindow: model.context_window || 4096,
      maxTokens: 2048,
      capabilities: {
        vision: false,
        toolCalling: false,
        streaming: true,
        embedding: false,
      },
    }));
  } catch (error) {
    throw new Error(`Failed to fetch OpenAI-compatible models: ${error.message}`);
  }
};

const getModelDetails = (modelId) => {
  const details = OPENAI_MODELS[modelId];
  if (!details) {
    throw new Error(`Unknown OpenAI model: ${modelId}`);
  }

  return {
    modelId,
    displayName: details.displayName,
    contextWindow: details.contextWindow,
    maxTokens: details.maxTokens,
    vision: details.vision,
    toolCalling: details.toolCalling,
    streaming: details.streaming,
    embedding: details.embedding,
    inputPrice: details.inputPrice,
    outputPrice: details.outputPrice,
    temperature: 0.7,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  };
};

const getCompatibleModelDetails = async (url, modelId, apiKey) => {
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
  getCompatibleModels,
  getModelDetails,
  getCompatibleModelDetails,
};
