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
  console.log('Set refresh cookie for', REFRESH_EXPIRES_DAYS, 'days');
}

function userPayload(user) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    telegram_id: user.telegram_id || null
  };
}

// Test endpoint for debugging
router.get('/test', (req, res) => {
  res.json({
    message: 'Auth test endpoint working',
    cookies: req.cookies,
    headers: {
      authorization: req.headers.authorization,
      origin: req.headers.origin,
      'user-agent': req.headers['user-agent']
    },
    timestamp: new Date().toISOString()
  });
});

// POST /api/auth/login-cookie
router.post('/login-cookie', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt for:', email);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.log('Supabase login error:', error.message);
      return res.status(400).json({ msg: error.message });
    }

    const supaUser = data.user;
    console.log('Supabase user logged in:', supaUser.id, supaUser.email);
    
    const payload = { 
      userId: supaUser.id, 
      email: supaUser.email, 
      username: (supaUser.user_metadata || {}).username 
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken({ userId: supaUser.id });

    saveRefreshToken(supaUser.id, refreshToken);
    setRefreshCookie(res, refreshToken);
    
    console.log('Generated tokens for user:', supaUser.id, 'access token length:', accessToken.length);

    res.status(200).json({
      accessToken,
      expiresIn: ACCESS_EXPIRES_IN,
      user: { 
        id: supaUser.id, 
        email: supaUser.email, 
        username: (supaUser.user_metadata || {}).username 
      }
    });
  } catch (e) {
    console.error('login-cookie error:', e);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/auth/me 
router.get('/me', async (req, res) => {
  console.log('GET /me - Headers:', JSON.stringify({
    authorization: req.headers.authorization?.substring(0, 50) + '...',
    cookie: req.headers.cookie,
    origin: req.headers.origin
  }));
  
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log('Found Bearer token, length:', token.length);
    }
    if (!token && req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
      console.log('Found access_token cookie, length:', token.length);
    }

    if (!token) {
      console.log('No token found in request');
      return res.status(401).json({ msg: 'Unauthorized - no token' });
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
      console.log('Token decoded successfully for user:', decoded.userId);
    } catch (verifyErr) {
      console.log('Token verification failed:', verifyErr.message);
      throw verifyErr;
    }

    // Try database table lookup first
    let { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, telegram_id, first_name, last_name')
      .eq('id', decoded.userId)
      .single();

    // If not found, fallback to supabase.auth.getUser
    if (error || !user) {
      console.log('User not found in table, trying auth API for:', decoded.userId);
      try {
        const { data: authData, error: authError } = await supabase.auth.admin.getUserById(decoded.userId);
        if (authData?.user) {
          user = {
            id: authData.user.id,
            email: authData.user.email,
            username: authData.user.user_metadata?.username || null,
            telegram_id: null,
            first_name: authData.user.user_metadata?.first_name || null,
            last_name: authData.user.user_metadata?.last_name || null
          };
          console.log('Found user via auth API:', user.email);
        }
      } catch (authErr) {
        console.error('Auth API error:', authErr);
      }
      if (!user) {
        console.log('User not found anywhere for:', decoded.userId);
        return res.status(401).json({ msg: 'User not found' });
      }
    } else {
      console.log('Found user in table:', user.email);
    }

    return res.json(user);
  } catch (e) {
    console.error('/me error:', e.message);
    if (e.name === 'TokenExpiredError') {
      console.log('Access token expired');
      return res.status(401).json({ code: 'TOKEN_EXPIRED', msg: 'Access expired' });
    }
    if (e.name === 'JsonWebTokenError') {
      console.log('JWT malformed');
      return res.status(401).json({ code: 'INVALID_TOKEN', msg: 'Invalid token format' });
    }
    return res.status(401).json({ msg: 'Unauthorized - ' + e.message });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  console.log('POST /refresh - Cookies:', Object.keys(req.cookies || {}));
  console.log('POST /refresh - refresh_token present:', !!req.cookies?.refresh_token);
  
  try {
    const { refresh_token } = req.cookies || {};
    if (!refresh_token) {
      console.log('No refresh token found in cookies');
      return res.status(401).json({ msg: 'No refresh token' });
    }

    console.log('Found refresh token, length:', refresh_token.length, 'verifying...');
    let decoded;
    try {
      decoded = verifyRefreshToken(refresh_token);
      console.log('Refresh token valid for user:', decoded.userId);
    } catch (verifyErr) {
      console.log('Refresh token verification failed:', verifyErr.message);
      throw verifyErr;
    }

    if (!isValidStoredRefresh(decoded.userId, refresh_token)) {
      console.log('Refresh token not found in store for user:', decoded.userId);
      return res.status(401).json({ msg: 'Invalid refresh token' });
    }

    // rotate refresh
    const newRefresh = signRefreshToken({ userId: decoded.userId });
    rotateRefreshToken(decoded.userId, newRefresh);
    setRefreshCookie(res, newRefresh);

    const accessToken = signAccessToken({ userId: decoded.userId });
    console.log('Generated new access token for user:', decoded.userId, 'length:', accessToken.length);
    
    return res.json({ accessToken, expiresIn: ACCESS_EXPIRES_IN });
  } catch (e) {
    console.error('refresh error:', e.message);
    return res.status(401).json({ msg: 'Refresh failed - ' + e.message });
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
        console.log('Revoked refresh token for user:', decoded.userId);
      } catch (e) {
        console.log('Error revoking refresh token:', e.message);
      }
    }
    res.clearCookie('refresh_token', clearCookieOptions());
    console.log('Cleared refresh cookie');
    return res.json({ ok: true });
  } catch (e) {
    console.error('logout error:', e);
    return res.json({ ok: true });
  }
});

module.exports = router;