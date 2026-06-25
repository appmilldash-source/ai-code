const express = require('express');
const router = express.Router();
const detector = require('../services/detector');
const ollamaService = require('../services/ollama');
const openaiService = require('../services/openai');
const geminiService = require('../services/gemini');

// Test connection and auto-detect provider
router.post('/test-connection', async (req, res, next) => {
  try {
    const { url, apiKey } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const startTime = Date.now();
    const result = await detector.testConnection(url, apiKey);
    const responseTime = Date.now() - startTime;

    res.json({
      ...result,
      responseTime,
      success: true,
    });
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      details: { originalError: error.message },
    });
  }
});

// Discover models for a provider
router.post('/discover-models', async (req, res, next) => {
  try {
    const { url, apiKey, provider } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    let models = [];
    let detectedProvider = provider;

    // Auto-detect provider if not specified
    if (!detectedProvider) {
      const detection = await detector.detectProvider(url, apiKey);
      detectedProvider = detection.provider;
    }

    // Get models based on provider
    switch (detectedProvider) {
      case 'ollama':
        models = await ollamaService.getModels(url);
        break;
      case 'openai':
        models = await openaiService.getModels(apiKey);
        break;
      case 'openai-compatible':
        models = await openaiService.getCompatibleModels(url, apiKey);
        break;
      case 'gemini':
        models = await geminiService.getModels();
        break;
      default:
        throw new Error(`Unknown provider: ${detectedProvider}`);
    }

    res.json({
      provider: detectedProvider,
      models,
      totalCount: models.length,
      success: true,
    });
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      details: { originalError: error.message },
    });
  }
});

// Get model details
router.get('/model-details/:provider/:modelId', async (req, res, next) => {
  try {
    const { provider, modelId } = req.params;
    const { url, apiKey } = req.query;

    let details = null;

    switch (provider) {
      case 'ollama':
        details = await ollamaService.getModelDetails(url, modelId);
        break;
      case 'openai':
        details = await openaiService.getModelDetails(modelId);
        break;
      case 'openai-compatible':
        details = await openaiService.getCompatibleModelDetails(url, modelId, apiKey);
        break;
      case 'gemini':
        details = await geminiService.getModelDetails(modelId);
        break;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }

    res.json({
      ...details,
      success: true,
    });
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      details: { originalError: error.message },
    });
  }
});

module.exports = router;
