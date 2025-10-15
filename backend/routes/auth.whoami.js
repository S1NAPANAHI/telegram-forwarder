const express = require('express');
const router = express.Router();
const AuthMiddleware = require('../middleware/authMiddleware');

router.get('/whoami', AuthMiddleware.authenticate, (req, res) => {
  console.log('[whoami] user:', req.user?.id);
  res.json({ id: req.user?.id, email: req.user?.email, username: req.user?.username, role: req.user?.role });
});

module.exports = router;
