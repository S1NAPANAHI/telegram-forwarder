const crypto = require('crypto');
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

    // Ensure a user record exists in your users table
    await supabase.from('users').upsert(
      [{ telegram_id: tgId, email, username }],
      { onConflict: 'telegram_id' }
    );

    // Create a JWT via Supabase service role or return a lightweight token
    // For simplicity, return minimal profile and mark as authenticated
    return res.json({
      ok: true,
      user: {
        id: tgId,
        username,
        first_name: unsafe.first_name,
        last_name: unsafe.last_name
      },
      // If you have your own JWT issuing path, return it here
      token: null
    });
  } catch (e) {
    console.error('telegram-webapp session error', e);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
