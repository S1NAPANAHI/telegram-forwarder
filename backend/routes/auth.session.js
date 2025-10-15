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

    await saveRefreshToken(supaUser.id, refreshToken);
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
      return res.status(401).json({ 
        error: 'Access denied. Authentication token required.',
        requiresAuth: true 
      });
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
      console.log('Token decoded successfully for user:', decoded.userId);
    } catch (verifyErr) {
      console.log('Token verification failed:', verifyErr.message);
      if (verifyErr.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Authentication token has expired.',
          requiresAuth: true,
          code: 'TOKEN_EXPIRED' 
        });
      }
      if (verifyErr.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          error: 'Invalid authentication token.',
          requiresAuth: true,
          code: 'INVALID_TOKEN' 
        });
      }
      throw verifyErr;
    }

    // Try database table lookup first
    let { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, telegram_id, first_name, last_name, role, language, is_active')
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
            last_name: authData.user.user_metadata?.last_name || null,
            role: 'user',
            language: 'fa',
            is_active: true
          };
          console.log('Found user via auth API:', user.email);
        }
      } catch (authErr) {
        console.error('Auth API error:', authErr);
      }
      if (!user) {
        console.log('User not found anywhere for:', decoded.userId);
        return res.status(401).json({ 
          error: 'User account not found or deactivated.',
          requiresAuth: true 
        });
      }
    } else {
      console.log('Found user in table:', user.email);
    }

    // Check if user is active
    if (user.is_active === false) {
      return res.status(401).json({ 
        error: 'User account is deactivated.',
        requiresAuth: true 
      });
    }

    return res.json({
      id: user.id,
      email: user.email || null,
      username: user.username || null,
      telegramId: user.telegram_id || null,
      role: user.role || 'user',
      language: user.language || 'fa'
    });
  } catch (e) {
    console.error('/me error:', e.message);
    return res.status(500).json({ error: 'Authentication service error' });
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
      return res.status(401).json({ 
        error: 'Refresh token required for authentication renewal.',
        requiresAuth: true,
        code: 'NO_REFRESH_TOKEN'
      });
    }

    console.log('Found refresh token, length:', refresh_token.length, 'verifying...');
    let decoded;
    try {
      decoded = verifyRefreshToken(refresh_token);
      console.log('Refresh token valid for user:', decoded.userId);
    } catch (verifyErr) {
      console.log('Refresh token verification failed:', verifyErr.message);
      if (verifyErr.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Refresh token has expired. Please login again.',
          requiresAuth: true,
          code: 'REFRESH_TOKEN_EXPIRED'
        });
      }
      if (verifyErr.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          error: 'Invalid refresh token format.',
          requiresAuth: true,
          code: 'INVALID_REFRESH_TOKEN'
        });
      }
      throw verifyErr;
    }

    // Await the async validation
    const isValid = await isValidStoredRefresh(decoded.userId, refresh_token);
    if (!isValid) {
      console.log('Refresh token not found in store for user:', decoded.userId);
      return res.status(401).json({ 
        error: 'Refresh token not recognized. Please login again.',
        requiresAuth: true,
        code: 'REFRESH_TOKEN_NOT_FOUND'
      });
    }

    // Get user info for the new access token
    let { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, telegram_id, role, is_active')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      // Fallback to auth API
      try {
        const { data: authData } = await supabase.auth.admin.getUserById(decoded.userId);
        if (authData?.user) {
          user = {
            id: authData.user.id,
            email: authData.user.email,
            username: authData.user.user_metadata?.username || null,
            role: 'user',
            is_active: true
          };
        }
      } catch (authErr) {
        console.error('Auth API error during refresh:', authErr);
      }
    }

    if (!user || user.is_active === false) {
      return res.status(401).json({ 
        error: 'User account not found or deactivated.',
        requiresAuth: true 
      });
    }

    // Rotate refresh token
    const newRefresh = signRefreshToken({ userId: decoded.userId });
    await rotateRefreshToken(decoded.userId, newRefresh);
    setRefreshCookie(res, newRefresh);

    // Generate new access token with user info
    const accessToken = signAccessToken({ 
      userId: decoded.userId,
      email: user.email,
      username: user.username
    });
    console.log('Generated new access token for user:', decoded.userId, 'length:', accessToken.length);
    
    return res.json({ 
      accessToken, 
      expiresIn: ACCESS_EXPIRES_IN,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (e) {
    console.error('refresh error:', e.message);
    return res.status(401).json({ 
      error: 'Authentication renewal failed. Please login again.',
      requiresAuth: true,
      code: 'REFRESH_FAILED'
    });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    const { refresh_token } = req.cookies || {};
    if (refresh_token) {
      try {
        const decoded = verifyRefreshToken(refresh_token);
        await revokeRefreshToken(decoded.userId);
        console.log('Revoked refresh token for user:', decoded.userId);
      } catch (e) {
        console.log('Error revoking refresh token (non-critical):', e.message);
      }
    }
    res.clearCookie('refresh_token', clearCookieOptions());
    console.log('Cleared refresh cookie');
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (e) {
    console.error('logout error:', e);
    return res.json({ success: true, message: 'Logged out (with errors)' });
  }
});

module.exports = router;