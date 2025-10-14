const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const supabase = require('../database/supabase');
...
// Add: update language endpoint
router.post('/language', async (req, res) => {
  try {
    const { language } = req.body;
    if (!language || !['fa', 'en'].includes(language)) {
      return res.status(400).json({ msg: 'Invalid language' });
    }
    // If you have JWT, you can derive telegramId or userId from it
    const authHeader = req.headers.authorization || '';
    let telegramId = null;
    if (authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
        const decoded = jwt.verify(token, JWT_SECRET);
        telegramId = decoded.telegramId;
      } catch {}
    }

    if (!telegramId && req.body.telegramId) {
      telegramId = String(req.body.telegramId);
    }

    if (!telegramId) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('users')
      .update({ language })
      .eq('telegram_id', telegramId)
      .select()
      .single();

    if (error) return res.status(500).json({ msg: 'Database error' });

    return res.json({ ok: true, user: data });
  } catch (e) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;