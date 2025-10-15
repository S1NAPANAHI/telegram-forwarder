const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const supabase = require('../database/supabase');

// Fallback in-memory store (for development or if DB fails)
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

async function saveRefreshToken(userId, token) {
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
  
  try {
    // Try to save to database first
    const { error } = await supabase
      .from('user_refresh_tokens')
      .upsert({
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.warn('Failed to save refresh token to DB, using memory:', error.message);
      // Fallback to memory
      refreshStore.set(userId, { tokenHash, expiresAt });
    } else {
      console.log('Refresh token saved to database for user:', userId);
    }
  } catch (dbError) {
    console.warn('Database error saving refresh token, using memory:', dbError.message);
    // Fallback to memory
    refreshStore.set(userId, { tokenHash, expiresAt });
  }
}

async function rotateRefreshToken(userId, newToken) {
  await saveRefreshToken(userId, newToken);
}

async function isValidStoredRefresh(userId, token) {
  const tokenHash = hashToken(token);
  
  try {
    // Try database first
    const { data, error } = await supabase
      .from('user_refresh_tokens')
      .select('token_hash, expires_at')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.log('No refresh token in DB for user:', userId, 'checking memory');
      // Fallback to memory
      const entry = refreshStore.get(userId);
      if (!entry) return false;
      if (entry.expiresAt < new Date()) {
        refreshStore.delete(userId); // Clean up expired
        return false;
      }
      return entry.tokenHash === tokenHash;
    }

    // Check if token is expired
    const expiresAt = new Date(data.expires_at);
    if (expiresAt < new Date()) {
      console.log('Refresh token expired for user:', userId);
      // Clean up expired token
      await supabase
        .from('user_refresh_tokens')
        .delete()
        .eq('user_id', userId);
      return false;
    }

    const isValid = data.token_hash === tokenHash;
    console.log('Token validation result for user:', userId, isValid ? 'valid' : 'invalid');
    return isValid;
  } catch (dbError) {
    console.warn('Database error checking refresh token, using memory:', dbError.message);
    // Fallback to memory
    const entry = refreshStore.get(userId);
    if (!entry) return false;
    if (entry.expiresAt < new Date()) {
      refreshStore.delete(userId);
      return false;
    }
    return entry.tokenHash === tokenHash;
  }
}

async function revokeRefreshToken(userId) {
  try {
    // Remove from database
    const { error } = await supabase
      .from('user_refresh_tokens')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.warn('Failed to revoke refresh token from DB:', error.message);
    } else {
      console.log('Refresh token revoked from database for user:', userId);
    }
  } catch (dbError) {
    console.warn('Database error revoking refresh token:', dbError.message);
  }
  
  // Also remove from memory
  refreshStore.delete(userId);
}

// Cleanup expired tokens periodically
setInterval(async () => {
  try {
    const { error } = await supabase
      .from('user_refresh_tokens')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) {
      console.warn('Failed to cleanup expired refresh tokens:', error.message);
    } else {
      console.log('Cleaned up expired refresh tokens');
    }
  } catch (cleanupError) {
    console.warn('Error during token cleanup:', cleanupError.message);
  }
  
  // Also cleanup memory
  const now = new Date();
  for (const [userId, entry] of refreshStore.entries()) {
    if (entry.expiresAt < now) {
      refreshStore.delete(userId);
    }
  }
}, 24 * 60 * 60 * 1000); // Run daily

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