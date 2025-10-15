const express = require('express');
const router = express.Router();
const supabase = require('../database/supabase');
const { 
  signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken,
  saveRefreshToken, rotateRefreshToken, isValidStoredRefresh, revokeRefreshToken,
  ACCESS_EXPIRES_IN, REFRESH_EXPIRES_DAYS
} = require('../services/tokenService');
const { refreshCookieOptions, clearCookieOptions } = require('../utils/cookies');

// Helpers
function setRefreshCookie(res, refreshToken) {
  res.cookie('refresh_token', refreshToken, refreshCookieOptions(REFRESH_EXPIRES_DAYS));
}

function userPayload(user) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    telegram_id: user.telegram_id || null
  };
}

// POST /api/auth/login (cookie-based)
router.post('/login-cookie', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(400).json({ msg: error.message });

    // We will build our own app tokens from supabase user
    const supaUser = data.user;
    const payload = { userId: supaUser.id, email: supaUser.email, username: (supaUser.user_metadata||{}).username };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken({ userId: supaUser.id });

    saveRefreshToken(supaUser.id, refreshToken);
    setRefreshCookie(res, refreshToken);

    res.status(200).json({
      accessToken,
      expiresIn: ACCESS_EXPIRES_IN,
      user: { id: supaUser.id, email: supaUser.email, username: (supaUser.user_metadata||{}).username }
    });
  } catch (e) {
    console.error('login-cookie error:', e);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/auth/me (cookie-based access token or Authorization)
router.get('/me', async (req, res) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) token = authHeader.substring(7);
    if (!token && req.cookies && req.cookies.access_token) token = req.cookies.access_token;

    if (!token) return res.status(401).json({ msg: 'Unauthorized' });

    const decoded = verifyAccessToken(token);

    // fetch latest user from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, telegram_id, first_name, last_name')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) return res.status(401).json({ msg: 'User not found' });

    return res.json(user);
  } catch (e) {
    if (e.name === 'TokenExpiredError') return res.status(401).json({ code: 'TOKEN_EXPIRED', msg: 'Access expired' });
    return res.status(401).json({ msg: 'Unauthorized' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.cookies || {};
    if (!refresh_token) return res.status(401).json({ msg: 'No refresh token' });

    const decoded = verifyRefreshToken(refresh_token);

    if (!isValidStoredRefresh(decoded.userId, refresh_token)) {
      return res.status(401).json({ msg: 'Invalid refresh token' });
    }

    // rotate refresh
    const newRefresh = signRefreshToken({ userId: decoded.userId });
    rotateRefreshToken(decoded.userId, newRefresh);
    setRefreshCookie(res, newRefresh);

    const accessToken = signAccessToken({ userId: decoded.userId });
    return res.json({ accessToken, expiresIn: ACCESS_EXPIRES_IN });
  } catch (e) {
    console.error('refresh error:', e.message);
    return res.status(401).json({ msg: 'Refresh failed' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    const { refresh_token } = req.cookies || {};
    if (refresh_token) {
      try {
        const decoded = verifyRefreshToken(refresh_token);
        revokeRefreshToken(decoded.userId);
      } catch {}
    }
    res.clearCookie('refresh_token', clearCookieOptions());
    return res.json({ ok: true });
  } catch (e) {
    return res.json({ ok: true });
  }
});

module.exports = router;
