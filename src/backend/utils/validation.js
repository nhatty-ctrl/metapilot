const WALLET_RE = /^0x[a-fA-F0-9]{40}$/;
const TX_HASH_RE = /^0x[a-fA-F0-9]{64}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function normalizeWalletAddress(value) {
  if (typeof value !== 'string') return null;

  const wallet = value.trim();
  return WALLET_RE.test(wallet) ? wallet.toLowerCase() : null;
}

export function normalizeTxHash(value) {
  if (typeof value !== 'string') return null;

  const txHash = value.trim();
  return TX_HASH_RE.test(txHash) ? txHash.toLowerCase() : null;
}

export function isUuid(value) {
  return typeof value === 'string' && UUID_RE.test(value);
}

export function cleanText(value, maxLength = 2000) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

export function cleanOptionalText(value, maxLength = 255) {
  const text = cleanText(value, maxLength);
  return text || null;
}

export function normalizeAmount(value) {
  if (value === undefined || value === null || value === '') return null;
  const amount = String(value).trim();

  if (!/^\d+(\.\d+)?$/.test(amount)) return null;
  if (Number(amount) <= 0) return null;

  return amount;
}
