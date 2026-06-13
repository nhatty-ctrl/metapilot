import { Router } from 'express';
import pool from '../db/pool.js';
import { chat, chatStream } from '../services/gemini.js';
import { cleanText, isUuid, normalizeWalletAddress } from '../utils/validation.js';

const router = Router();

/**
 * POST /api/chat/conversations
 * Start a new conversation for a user.
 *
 * Body: { walletAddress: "0x..." }
 */
router.post('/conversations', async (req, res) => {
  const { walletAddress } = req.body;
  const wallet = normalizeWalletAddress(walletAddress);

  if (!wallet) {
    return res.status(400).json({ error: 'Valid walletAddress required' });
  }

  try {
    const userResult = await pool.query(
      'SELECT id FROM users WHERE wallet_address = $1',
      [wallet]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found — connect wallet first' });
    }

    const userId = userResult.rows[0].id;

    const convResult = await pool.query(
      `INSERT INTO conversations (user_id, title)
       VALUES ($1, $2)
       RETURNING id, title, created_at`,
      [userId, 'New conversation']
    );

    res.status(201).json({ conversation: convResult.rows[0] });
  } catch (err) {
    console.error('Create conversation error:', err.message);
    res.status(500).json({ error: 'Could not create conversation' });
  }
});

/**
 * GET /api/chat/conversations/:walletAddress
 * List all past conversations for a wallet.
 */
router.get('/conversations/:walletAddress', async (req, res) => {
  const wallet = normalizeWalletAddress(req.params.walletAddress);

  if (!wallet) {
    return res.status(400).json({ error: 'Valid wallet address required' });
  }

  try {
    const result = await pool.query(
      `SELECT c.id, c.title, c.created_at,
              (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message
       FROM conversations c
       JOIN users u ON u.id = c.user_id
       WHERE u.wallet_address = $1
       ORDER BY c.created_at DESC`,
      [wallet]
    );

    res.json({ conversations: result.rows });
  } catch (err) {
    console.error('List conversations error:', err.message);
    res.status(500).json({ error: 'Could not fetch conversations' });
  }
});

/**
 * GET /api/chat/conversations/:conversationId/messages
 * Get all messages in a conversation (to restore chat history in the UI).
 */
router.get('/conversations/:conversationId/messages', async (req, res) => {
  const { conversationId } = req.params;

  if (!isUuid(conversationId)) {
    return res.status(400).json({ error: 'Valid conversationId required' });
  }

  try {
    const exists = await pool.query('SELECT id FROM conversations WHERE id = $1', [conversationId]);

    if (exists.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const result = await pool.query(
      `SELECT id, role, content, created_at
       FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [conversationId]
    );

    res.json({ messages: result.rows });
  } catch (err) {
    console.error('Get messages error:', err.message);
    res.status(500).json({ error: 'Could not fetch messages' });
  }
});

/**
 * POST /api/chat/message
 * The main endpoint — send a message, get AI response, save both to DB.
 * Supports streaming (add ?stream=true for SSE) or regular JSON.
 *
 * Body: { conversationId: "uuid", walletAddress: "0x...", content: "Where should I put my USDC?" }
 */
router.post('/message', async (req, res) => {
  const { conversationId, walletAddress, content } = req.body;
  const useStream = req.query.stream === 'true';
  const wallet = normalizeWalletAddress(walletAddress);
  const userContent = cleanText(content);

  if (!isUuid(conversationId) || !wallet || !userContent) {
    return res.status(400).json({ error: 'Valid conversationId, walletAddress, and content required' });
  }

  try {
    const ownerResult = await pool.query(
      `SELECT c.id
       FROM conversations c
       JOIN users u ON u.id = c.user_id
       WHERE c.id = $1 AND u.wallet_address = $2`,
      [conversationId, wallet]
    );

    if (ownerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found for this wallet' });
    }

    // 1. Save the user's message
    await pool.query(
      'INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)',
      [conversationId, 'user', userContent]
    );

    // 2. Update conversation title from first message if still default
    await pool.query(
      `UPDATE conversations
       SET title = CASE WHEN title = 'New conversation' THEN $1 ELSE title END
       WHERE id = $2`,
      [userContent.slice(0, 60), conversationId]
    );

    // 3. Fetch full history to give Gemini context
    const historyResult = await pool.query(
      `SELECT role, content FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [conversationId]
    );

    const messages = historyResult.rows;

    // 4. Stream or standard response
    if (useStream) {
      const fullText = await chatStream(messages, res);

      // Save assistant response after stream ends
      // Note: chatStream writes to res and calls res.end() internally
      // We save to DB here using the fullText it returns
      await pool.query(
        'INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)',
        [conversationId, 'assistant', fullText]
      );
    } else {
      const assistantReply = await chat(messages);

      // 5. Save assistant response
      await pool.query(
        'INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)',
        [conversationId, 'assistant', assistantReply]
      );

      res.json({ reply: assistantReply });
    }
  } catch (err) {
    console.error('Chat message error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Could not process message' });
    }
  }
});

export default router;
