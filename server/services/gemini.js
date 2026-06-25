const axios = require('axios');

/**
 * Gemini service for model discovery
 */

const GEMINI_MODELS = {
  'gemini-pro': {
    displayName: 'Gemini Pro',
    contextWindow: 32000,
    maxTokens: 8192,
    vision: false,
    toolCalling: false,
    streaming: true,
    embedding: false,
  },
  'gemini-pro-vision': {
    displayName: 'Gemini Pro Vision',
    contextWindow: 32000,
    maxTokens: 8192,
    vision: true,
    toolCalling: false,
    streaming: true,
    embedding: false,
  },
  'gemini-1.5-pro': {
    displayName: 'Gemini 1.5 Pro',
    contextWindow: 1000000,
    maxTokens: 8192,
    vision: true,
    toolCalling: true,
    streaming: true,
    embedding: false,
  },
  'gemini-1.5-flash': {
    displayName: 'Gemini 1.5 Flash',
    contextWindow: 1000000,
    maxTokens: 8192,
    vision: true,
    toolCalling: true,
    streaming: true,
    embedding: false,
  },
  'embedding-001': {
    displayName: 'Embedding 001',
    contextWindow: 2048,
    maxTokens: null,
    vision: false,
    toolCalling: false,
    streaming: false,
    embedding: true,
  },
};

const getModels = async () => {
  // Return known Gemini models
  // In a real implementation, you would fetch these from Google's API
  return Object.entries(GEMINI_MODELS).map(([id, details]) => ({
    id,
    name: details.displayName,
    description: id,
    contextWindow: details.contextWindow,
    maxTokens: details.maxTokens,
    capabilities: {
      vision: details.vision,
      toolCalling: details.toolCalling,
      streaming: details.streaming,
      embedding: details.embedding,
    },
  }));
};

const getModelDetails = (modelId) => {
  const details = GEMINI_MODELS[modelId];
  if (!details) {
    throw new Error(`Unknown Gemini model: ${modelId}`);
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
    temperature: 0.7,
    topP: 0.95,
    frequencyPenalty: 0,
    presencePenalty: 0,
  };
};

module.exports = {
  getModels,
  getModelDetails,
};
