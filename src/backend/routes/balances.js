import express from 'express';
import { fetchWalletBalances, fetchTokenPrice } from '../services/walletBalance.js';

const router = express.Router();

/**
 * GET /api/balances/:walletAddress
 * Fetch real wallet balances from the blockchain
 */
router.get('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    // Validate wallet address format
    if (!walletAddress || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    const balances = await fetchWalletBalances(walletAddress);
    
    res.json({
      success: true,
      walletAddress,
      balances,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /api/balances/:walletAddress:', error);
    res.status(500).json({ 
      error: 'Failed to fetch wallet balances',
      message: error.message 
    });
  }
});

/**
 * GET /api/balances/:walletAddress/prices
 * Fetch current token prices
 */
router.get('/:walletAddress/prices', async (req, res) => {
  try {
    const prices = {
      ETH: await fetchTokenPrice('ETH'),
      BTC: await fetchTokenPrice('BTC'),
      ARB: await fetchTokenPrice('ARB')
    };

    res.json({
      success: true,
      prices,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    res.status(500).json({ 
      error: 'Failed to fetch token prices',
      message: error.message 
    });
  }
});

export default router;
