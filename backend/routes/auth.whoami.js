const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.get('/whoami', auth, (req, res) => {
  console.log('[whoami] user:', req.user?.id);
  res.json({ id: req.user?.id, email: req.user?.email, username: req.user?.username, role: req.user?.role });
});

module.exports = router;