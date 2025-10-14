const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const supabase = require('../database/supabase');

function parseInitData(initData) {
  const params = new URLSearchParams(initData);
  const data = {};
  for (const [key, value] of params.entries()) {
    data[key] = value;
  }
  return data;
}

function verifyTelegramWebAppData(initData, botToken) {
  const data = parseInitData(initData);
  const hash = data.hash;
  delete data.hash;

  const dataCheckString = Object.keys(data)
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join('\n');

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return calculatedHash === hash;
}

function generateJWT(user) {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  const payload = {
    userId: user.id,
    telegramId: user.telegram_id,
    username: user.username,
    email: user.email,
    type: 'telegram_webapp'
  };
  
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '7d',
    issuer: 'telegram-forwarder'
  });
}

// POST /api/auth/telegram-webapp/session
router.post('/session', async (req, res) => {
  try {
    const { initData } = req.body;
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
    if (!BOT_TOKEN) return res.status(500).json({ msg: 'BOT_TOKEN missing' });
    if (!initData) return res.status(400).json({ msg: 'initData required' });

    const valid = verifyTelegramWebAppData(initData, BOT_TOKEN);
    if (!valid) return res.status(401).json({ msg: 'Invalid signature' });

    const params = parseInitData(initData);
    const unsafe = JSON.parse(params.user || '{}');
    if (!unsafe.id) return res.status(400).json({ msg: 'Invalid user' });

    // Upsert user in Supabase by telegram id
    const tgId = String(unsafe.id);
    const email = `tg_${tgId}@telegram.local`;
    const username = unsafe.username || `tg_${tgId}`;
    const firstName = unsafe.first_name || '';
    const lastName = unsafe.last_name || '';

    // Ensure a user record exists in your users table
    const { data: userData, error: upsertError } = await supabase
      .from('users')
      .upsert(
        [{ 
          telegram_id: tgId, 
          email, 
          username,
          first_name: firstName,
          last_name: lastName,
          profile_picture: unsafe.photo_url || null,
          updated_at: new Date().toISOString()
        }],
        { onConflict: 'telegram_id', ignoreDuplicates: false }
      )
      .select()
      .single();

    if (upsertError) {
      console.error('Error upserting user:', upsertError);
      return res.status(500).json({ msg: 'Database error' });
    }

    // Generate JWT token
    const token = generateJWT(userData);

    return res.json({
      ok: true,
      user: {
        id: userData.id,
        telegramId: tgId,
        username: userData.username,
        email: userData.email,
        firstName: firstName,
        lastName: lastName,
        profilePicture: userData.profile_picture,
        fullName: `${firstName} ${lastName}`.trim() || username
      },
      token: token,
      expiresIn: '7d'
    });
  } catch (e) {
    console.error('telegram-webapp session error', e);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/auth/telegram-webapp/verify - Verify JWT token
router.post('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ msg: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Optionally fetch fresh user data from database
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', decoded.telegramId)
      .single();

    if (error || !userData) {
      return res.status(401).json({ msg: 'User not found' });
    }

    return res.json({
      ok: true,
      user: {
        id: userData.id,
        telegramId: userData.telegram_id,
        username: userData.username,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        profilePicture: userData.profile_picture,
        fullName: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.username
      },
      decoded: decoded
    });
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: 'Token expired' });
    } else if (e.name === 'JsonWebTokenError') {
      return res.status(401).json({ msg: 'Invalid token' });
    }
    console.error('JWT verify error', e);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/auth/telegram-webapp/logout - Logout (client-side token removal)
router.post('/logout', (req, res) => {
  // JWT tokens are stateless, so logout is handled client-side
  // This endpoint exists for completeness and future token blacklisting
  res.json({ ok: true, msg: 'Logged out successfully' });
});

module.exports = router;