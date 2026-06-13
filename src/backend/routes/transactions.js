import { Router } from 'express';
import pool from '../db/pool.js';
import {
  cleanOptionalText,
  normalizeAmount,
  normalizeTxHash,
  normalizeWalletAddress,
} from '../utils/validation.js';

const router = Router();

/**
 * POST /api/transactions
 * Log a transaction AFTER the user confirms and it's submitted on-chain.
 * The frontend calls this once it has a tx_hash from MetaMask.
 *
 * Body: {
 *   walletAddress, type, protocol,
 *   tokenIn?, tokenOut?, amount?,
 *   txHash, plainSummary
 * }
 */
router.post('/', async (req, res) => {
  const {
    walletAddress,
    type,
    protocol,
    tokenIn,
    tokenOut,
    amount,
    txHash,
    plainSummary,
  } = req.body;
  const wallet = normalizeWalletAddress(walletAddress);
  const normalizedTxHash = normalizeTxHash(txHash);
  const normalizedAmount = normalizeAmount(amount);
  const cleanProtocol = cleanOptionalText(protocol, 120);

  if (!wallet || !type || !cleanProtocol || !normalizedTxHash) {
    return res.status(400).json({ error: 'Valid walletAddress, type, protocol, and txHash required' });
  }

  if (amount !== undefined && amount !== null && amount !== '' && !normalizedAmount) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }

  const validTypes = ['swap', 'deposit', 'withdraw', 'approve'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: `type must be one of: ${validTypes.join(', ')}` });
  }

  try {
    const userResult = await pool.query(
      'SELECT id FROM users WHERE wallet_address = $1',
      [wallet]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userResult.rows[0].id;

    const result = await pool.query(
      `INSERT INTO transactions
         (user_id, type, protocol, token_in, token_out, amount, tx_hash, status, plain_summary)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)
       ON CONFLICT (tx_hash) DO NOTHING
       RETURNING *`,
      [
        userId,
        type,
        cleanProtocol,
        cleanOptionalText(tokenIn, 40),
        cleanOptionalText(tokenOut, 40),
        normalizedAmount,
        normalizedTxHash,
        cleanOptionalText(plainSummary, 500),
      ]
    );

    if (result.rows.length === 0) {
      return res.status(409).json({ error: 'Transaction already recorded' });
    }

    res.status(201).json({ transaction: result.rows[0] });
  } catch (err) {
    console.error('Log transaction error:', err.message);
    res.status(500).json({ error: 'Could not log transaction' });
  }
});

/**
 * PATCH /api/transactions/:txHash/status
 * Update a transaction status once confirmed on-chain.
 * The frontend polls Arbitrum RPC and calls this when the tx receipt arrives.
 *
 * Body: { status: "confirmed" | "failed" }
 */
router.patch('/:txHash/status', async (req, res) => {
  const txHash = normalizeTxHash(req.params.txHash);
  const { status } = req.body;

  if (!txHash) {
    return res.status(400).json({ error: 'Valid txHash required' });
  }

  if (!['confirmed', 'failed'].includes(status)) {
    return res.status(400).json({ error: 'status must be confirmed or failed' });
  }

  try {
    const result = await pool.query(
      `UPDATE transactions SET status = $1 WHERE tx_hash = $2 RETURNING *`,
      [status, txHash]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ transaction: result.rows[0] });
  } catch (err) {
    console.error('Update transaction status error:', err.message);
    res.status(500).json({ error: 'Could not update transaction' });
  }
});

/**
 * GET /api/transactions/:walletAddress
 * Get all transactions for a wallet — used in the portfolio history view.
 */
router.get('/:walletAddress', async (req, res) => {
  const wallet = normalizeWalletAddress(req.params.walletAddress);

  if (!wallet) {
    return res.status(400).json({ error: 'Valid wallet address required' });
  }

  try {
    const result = await pool.query(
      `SELECT t.id, t.type, t.protocol, t.token_in, t.token_out,
              t.amount, t.tx_hash, t.status, t.plain_summary, t.created_at
       FROM transactions t
       JOIN users u ON u.id = t.user_id
       WHERE u.wallet_address = $1
       ORDER BY t.created_at DESC
       LIMIT 50`,
      [wallet]
    );

    res.json({ transactions: result.rows });
  } catch (err) {
    console.error('Get transactions error:', err.message);
    res.status(500).json({ error: 'Could not fetch transactions' });
  }
});

export default router;
