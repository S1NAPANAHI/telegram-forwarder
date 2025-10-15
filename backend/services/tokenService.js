const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// In-memory refresh token store (userId -> { tokenHash, expiresAt })
// NOTE: For production/horizontal scaling, replace with DB (Supabase table)
const refreshStore = new Map();

const ACCESS_EXPIRES_IN = process.env.ACCESS_EXPIRES_IN || '30m';
const REFRESH_EXPIRES_DAYS = parseInt(process.env.REFRESH_EXPIRES_DAYS || '7', 10);

const ACCESS_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET || 'your-secret-key') + '_refresh';

function signAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
    issuer: 'telegram-forwarder'
  });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: `${REFRESH_EXPIRES_DAYS}d`,
    issuer: 'telegram-forwarder'
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function saveRefreshToken(userId, token) {
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
  refreshStore.set(userId, { tokenHash, expiresAt });
}

function rotateRefreshToken(userId, newToken) {
  saveRefreshToken(userId, newToken);
}

function isValidStoredRefresh(userId, token) {
  const entry = refreshStore.get(userId);
  if (!entry) return false;
  if (entry.expiresAt < new Date()) return false;
  return entry.tokenHash === hashToken(token);
}

function revokeRefreshToken(userId) {
  refreshStore.delete(userId);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  saveRefreshToken,
  rotateRefreshToken,
  isValidStoredRefresh,
  revokeRefreshToken,
  ACCESS_EXPIRES_IN,
  REFRESH_EXPIRES_DAYS
};
