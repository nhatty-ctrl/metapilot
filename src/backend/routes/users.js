import { Router } from 'express';
import pool from '../db/pool.js';
import { cleanOptionalText, normalizeWalletAddress } from '../utils/validation.js';

const router = Router();

/**
 * POST /api/users/connect
 * Called when a user connects their wallet for the first time.
 * Uses upsert — safe to call on every page load.
 *
 * Body: { walletAddress: "0x...", username?: "Alice" }
 * Returns: user record
 */
router.post('/connect', async (req, res) => {
  const { walletAddress, username } = req.body;
  const wallet = normalizeWalletAddress(walletAddress);

  if (!wallet) {
    return res.status(400).json({ error: 'Valid wallet address required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO users (wallet_address, username)
       VALUES ($1, $2)
       ON CONFLICT (wallet_address)
       DO UPDATE SET username = COALESCE($2, users.username)
       RETURNING id, wallet_address, username, created_at`,
      [wallet, cleanOptionalText(username, 80)]
    );

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('User connect error:', err.message);
    res.status(500).json({ error: 'Could not connect user' });
  }
});

/**
 * GET /api/users/:walletAddress
 * Get user profile + stats.
 */
router.get('/:walletAddress', async (req, res) => {
  const wallet = normalizeWalletAddress(req.params.walletAddress);

  if (!wallet) {
    return res.status(400).json({ error: 'Valid wallet address required' });
  }

  try {
    const userResult = await pool.query(
      'SELECT id, wallet_address, username, created_at FROM users WHERE wallet_address = $1',
      [wallet]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Also grab their transaction count and conversation count for the dashboard
    const statsResult = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM transactions WHERE user_id = $1) AS total_transactions,
         (SELECT COUNT(*) FROM conversations WHERE user_id = $1) AS total_conversations`,
      [user.id]
    );

    res.json({ user, stats: statsResult.rows[0] });
  } catch (err) {
    console.error('Get user error:', err.message);
    res.status(500).json({ error: 'Could not fetch user' });
  }
});

export default router;
