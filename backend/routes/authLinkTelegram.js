const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const UserService = require('../services/UserService');

// POST /api/auth/link-telegram
// Body: { telegram_id: string|number, telegram_username?: string }
router.post('/link-telegram', authMiddleware, async (req, res) => {
  try {
    const { telegram_id, telegram_username } = req.body || {};
    if (!telegram_id) {
      return res.status(400).json({ success: false, error: 'telegram_id is required' });
    }

    const tgId = telegram_id.toString();
    await UserService.linkTelegramAccount(req.user.id, tgId, telegram_username || null);

    return res.json({ success: true, message: 'Telegram account linked', telegram_id: tgId });
  } catch (err) {
    console.error('link-telegram error:', err?.message || err);
    res.status(500).json({ success: false, error: 'Failed to link telegram account' });
  }
});

module.exports = router;
