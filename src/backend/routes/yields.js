import { Router } from 'express';
import { fetchArbitrumYields } from '../services/defiResearch.js';

const router = Router();

// Simple in-memory cache — DeFi Llama updates every ~5 min, no need to hammer it
let cache = { data: null, fetchedAt: 0 };
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * GET /api/yields
 * Returns live yield opportunities on Arbitrum.
 * Cached for 5 minutes so the demo stays snappy.
 *
 * Optional query params:
 *   ?risk=low|medium|high   — filter by risk level
 *   ?token=USDC             — filter by token symbol
 */
router.get('/', async (req, res) => {
  try {
    const now = Date.now();

    if (!cache.data || now - cache.fetchedAt > CACHE_TTL_MS) {
      cache.data = await fetchArbitrumYields();
      cache.fetchedAt = now;
    }

    let results = cache.data;

    // Optional filters
    if (req.query.risk) {
      results = results.filter((y) => y.riskLevel.level === req.query.risk);
    }
    if (req.query.token) {
      results = results.filter((y) =>
        y.token.toLowerCase().includes(req.query.token.toLowerCase())
      );
    }

    res.json({
      yields: results,
      cachedAt: new Date(cache.fetchedAt).toISOString(),
      count: results.length,
    });
  } catch (err) {
    console.error('Yields route error:', err.message);
    res.status(500).json({ error: 'Could not fetch yield data' });
  }
});

/**
 * GET /api/yields/summary
 * Returns a short summary string — useful for the dashboard header.
 */
router.get('/summary', async (req, res) => {
  try {
    const now = Date.now();
    if (!cache.data || now - cache.fetchedAt > CACHE_TTL_MS) {
      cache.data = await fetchArbitrumYields();
      cache.fetchedAt = now;
    }

    const best = cache.data[0];
    const lowRisk = cache.data.filter((y) => y.riskLevel.level === 'low');
    const bestLow = lowRisk[0];

    res.json({
      bestOverall: best
        ? { protocol: best.protocol, token: best.token, apy: best.apy }
        : null,
      bestLowRisk: bestLow
        ? { protocol: bestLow.protocol, token: bestLow.token, apy: bestLow.apy }
        : null,
      totalOpportunities: cache.data.length,
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch summary' });
  }
});

export default router;
