import express from 'express';
import { chat } from '../services/gemini.js';
import { fetchArbitrumYields } from '../services/defiResearch.js';

const router = express.Router();

/**
 * GET /api/test/gemini
 * Test Gemini API connectivity and configuration
 */
router.get('/gemini', async (req, res) => {
  try {
    const hasApiKey = !!process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    
    if (!hasApiKey) {
      return res.status(500).json({
        success: false,
        status: 'GEMINI_API_KEY not configured',
        configured: false
      });
    }

    // Test with a simple message
    const testMessages = [
      { role: 'user', content: 'What are the top 3 yield opportunities on Arbitrum?' }
    ];

    const reply = await chat(testMessages);

    res.json({
      success: true,
      status: 'Gemini API working',
      configured: true,
      modelName,
      testResponse: reply.substring(0, 200) + (reply.length > 200 ? '...' : ''),
      fullResponse: reply
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'Gemini API error',
      error: error.message
    });
  }
});

/**
 * GET /api/test/yields
 * Test DeFi Research service
 */
router.get('/yields', async (req, res) => {
  try {
    const yields = await fetchArbitrumYields();

    res.json({
      success: true,
      status: 'DeFi Research working',
      yieldCount: yields.length,
      samples: yields.slice(0, 3)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'DeFi Research error',
      error: error.message
    });
  }
});

/**
 * GET /api/test/system
 * Full system health check
 */
router.get('/system', async (req, res) => {
  const checks = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {}
  };

  // Check Gemini
  try {
    const hasApiKey = !!process.env.GEMINI_API_KEY;
    const testMessages = [{ role: 'user', content: 'ping' }];
    const reply = await chat(testMessages);
    checks.services.gemini = {
      status: 'OK',
      configured: hasApiKey,
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash'
    };
  } catch (error) {
    checks.services.gemini = {
      status: 'ERROR',
      message: error.message
    };
  }

  // Check DeFi Research
  try {
    const yields = await fetchArbitrumYields();
    checks.services.defiResearch = {
      status: 'OK',
      yieldCount: yields.length
    };
  } catch (error) {
    checks.services.defiResearch = {
      status: 'ERROR',
      message: error.message
    };
  }

  // Check environment variables
  checks.environment_vars = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '***configured***' : 'MISSING',
    GEMINI_MODEL: process.env.GEMINI_MODEL || 'default (gemini-2.5-flash)',
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 3000
  };

  const allOk = Object.values(checks.services).every(s => s.status === 'OK');

  res.json({
    success: allOk,
    systemReady: allOk,
    ...checks
  });
});

/**
 * POST /api/test/agent-execution
 * Test complete agent execution flow
 */
router.post('/agent-execution', async (req, res) => {
  try {
    const { message = 'Where should I invest 1000 USDT for yield?', history = [] } = req.body;

    // Simulate full agent execution
    const messages = [
      ...history.filter(m => m.role && m.content),
      { role: 'user', content: message }
    ];

    // Get Gemini response
    const geminiReply = await chat(messages);

    // Get yield data
    const yields = await fetchArbitrumYields();
    const bestYield = yields[0];

    // Build execution plan
    const executionPlan = {
      action: 'deposit',
      protocol: bestYield.protocol,
      token: bestYield.token,
      amount: '1000 USDT',
      apy: `${bestYield.apy}%`,
      risk: bestYield.riskLevel.label,
      steps: [
        `Review ${bestYield.protocol} pool details (TVL: ${bestYield.tvlFormatted})`,
        'Approve token spending from wallet',
        'Submit deposit transaction on Arbitrum',
        'Confirm transaction and log to history'
      ]
    };

    res.json({
      success: true,
      agentResponse: geminiReply,
      executionPlan,
      recommendation: {
        protocol: bestYield.protocol,
        token: bestYield.token,
        apy: bestYield.apy,
        tvl: bestYield.tvlFormatted
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
