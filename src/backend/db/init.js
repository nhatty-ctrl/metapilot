import pool from './pool.js';

const schema = `
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";

  -- Users: wallet address is the unique identity (no passwords)
  CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username      TEXT,
    wallet_address TEXT UNIQUE NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW()
  );

  -- One conversation = one chat session
  CREATE TABLE IF NOT EXISTS conversations (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title         TEXT DEFAULT 'New conversation',
    created_at    TIMESTAMPTZ DEFAULT NOW()
  );

  -- Every single message in every conversation
  CREATE TABLE IF NOT EXISTS messages (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id   UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role              TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content           TEXT NOT NULL,
    created_at        TIMESTAMPTZ DEFAULT NOW()
  );

  -- Every on-chain transaction the agent executes or recommends
  CREATE TABLE IF NOT EXISTS transactions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type          TEXT NOT NULL CHECK (type IN ('swap', 'deposit', 'withdraw', 'approve')),
    protocol      TEXT NOT NULL,
    token_in      TEXT,
    token_out     TEXT,
    amount        NUMERIC(30, 18),
    tx_hash       TEXT UNIQUE,
    status        TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    plain_summary TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
  );

  -- Indexes for fast lookups
  CREATE INDEX IF NOT EXISTS idx_conversations_user   ON conversations(user_id);
  CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_user    ON transactions(user_id);
  CREATE INDEX IF NOT EXISTS idx_users_wallet         ON users(wallet_address);
`;

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(schema);
    console.log('✅ Database tables created / verified');
  } catch (err) {
    console.error('❌ DB init failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

initDB();
