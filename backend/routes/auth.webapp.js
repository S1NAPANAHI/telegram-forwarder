// Telegram WebApp auth endpoint
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const AuthMiddleware = require('../middleware/authMiddleware');
const UserService = require('../services/UserService');

router.post('/telegram-webapp', async (req, res) => {
  try {
    const initData = req.body?.initData || req.headers['x-telegram-init-data'] || req.query.initData;
    if (!initData) return res.status(400).json({ error: 'initData missing' });

    const validation = AuthMiddleware.validateTelegramInitData(initData);
    if (!validation.valid) return res.status(401).json({ error: 'Invalid initData' });

    const tg = validation.user;
    let user = await UserService.getUserByTelegramId(String(tg.id));
    if (!user) {
      user = await UserService.createUser({
        telegramId: String(tg.id),
        username: tg.username || `user_${tg.id}`,
        firstName: tg.first_name,
        lastName: tg.last_name,
        language: tg.language_code || 'fa',
        isActive: true,
        registeredVia: 'telegram_webapp',
      });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token });
  } catch (e) {
    console.error('telegram-webapp auth error', e);
    return res.status(500).json({ error: 'Auth error' });
  }
});

module.exports = router;
