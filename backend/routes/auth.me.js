// Auth routes
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const AuthMiddleware = require('../middleware/authMiddleware');
const UserService = require('../services/UserService');

// GET /api/auth/me - validate JWT and return user profile
router.get('/me', AuthMiddleware.authenticate, async (req, res) => {
  try {
    const u = req.user;
    return res.json({
      id: u.id,
      email: u.email || null,
      username: u.username || null,
      telegramId: u.telegram_id || u.telegramId || null,
      role: u.role || 'user',
      language: u.language || 'fa',
    });
  } catch (e) {
    console.error('auth/me error', e);
    return res.status(500).json({ error: 'Auth error' });
  }
});

module.exports = router;
