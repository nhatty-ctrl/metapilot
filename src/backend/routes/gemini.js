import { Router } from 'express';
import { chat } from '../services/gemini.js';
import { fetchArbitrumYields } from '../services/defiResearch.js';
import { cleanText, normalizeWalletAddress } from '../utils/validation.js';

const router = Router();

router.post('/chat', async (req, res) => {
  const message = cleanText(req.body?.message);
  const history = Array.isArray(req.body?.history) ? req.body.history : [];
  const walletAddress = normalizeWalletAddress(req.body?.walletAddress);

  if (!message) {
    return res.status(400).json({ error: 'message required' });
  }

  const messages = [
    ...history
      .filter((m) => ['user', 'assistant'].includes(m?.role) && typeof m?.content === 'string')
      .map((m) => ({ role: m.role, content: cleanText(m.content) }))
      .filter((m) => m.content),
    { role: 'user', content: message },
  ];

  try {
    const reply = await chat(messages);
    const enrichment = await buildUiHints(message);

    return res.json({
      reply,
      thought: `Received ${messages.length} chat message(s). Wallet ${walletAddress || 'not connected'} is using live Arbitrum yield context.`,
      toolCalls: [
        {
          name: 'metapilot_chat',
          params: JSON.stringify({ network: req.body?.activeNetwork || 'Arbitrum One' }),
          result: 'OK',
        },
      ],
      ...enrichment,
    });
  } catch (err) {
    console.error('Gemini compatibility chat error:', err.message);
    return res.status(500).json({ error: 'Could not process chat message' });
  }
});

async function buildUiHints(message) {
  const lower = message.toLowerCase();

  if (lower.includes('chart') || lower.includes('price') || lower.includes('graph')) {
    return {
      showCharts: true,
      targetToken: lower.includes('btc') ? 'WBTC' : lower.includes('arb') ? 'ARB' : 'ETH',
    };
  }

  if (!/(yield|apy|invest|deposit|earn|strategy|rate|usdc|usdt|arb|eth|btc)/i.test(message)) {
    return {};
  }

  const yields = await fetchArbitrumYields();
  const requested = lower.includes('usdt')
    ? 'USDT'
    : lower.includes('eth')
      ? 'ETH'
      : lower.includes('btc')
        ? 'WBTC'
        : lower.includes('arb')
          ? 'ARB'
          : 'USDC';
  const best = yields.find((y) => y.token.toUpperCase().includes(requested)) || yields[0];

  if (!best) {
    return { showYieldChart: true };
  }

  const amountMatch = message.match(/[\d,.]+/);
  const amount = amountMatch ? amountMatch[0] : '1,000';
  const risk = toTitleRisk(best.riskLevel.level);

  return {
    showYieldChart: true,
    recommendation: {
      protocol: best.protocol,
      token: best.token,
      amount: `${amount} ${best.token}`,
      apy: `${best.apy}%`,
      risk,
    },
    executionPlan: {
      action: 'deposit',
      protocol: best.protocol,
      token: best.token,
      amount: `${amount} ${best.token}`,
      apy: `${best.apy}%`,
      risk,
      steps: [
        `Review ${best.protocol} pool details and current TVL (${best.tvlFormatted})`,
        `Approve ${best.token} spending from the connected wallet`,
        `Submit the deposit transaction on Arbitrum`,
        `Track confirmation and update the transaction log`,
      ],
      payload: { amount, token: best.token, protocol: best.protocol, apy: best.apy },
    },
  };
}

function toTitleRisk(level) {
  if (level === 'high') return 'High';
  if (level === 'medium') return 'Medium';
  return 'Low';
}

export default router;
