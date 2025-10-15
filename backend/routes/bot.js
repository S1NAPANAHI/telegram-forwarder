const express = require('express');
const router = express.Router();

// Use only the instance created by monitoringManager
function getMonitor() {
  try {
    const manager = require('../services/monitoringManager');
    return manager && manager.telegramMonitor ? manager.telegramMonitor : null;
  } catch {
    return null;
  }
}

// Telegram webhook endpoint
router.post('/webhook', express.json({ limit: '2mb' }), async (req, res) => {
  try {
    const monitor = getMonitor();
    if (!monitor || !monitor.bot || !monitor.bot.processUpdate) {
      console.warn('[bot/webhook] Bot not ready');
      return res.status(503).json({ ok: false, reason: 'bot_not_ready' });
    }
    await monitor.bot.processUpdate(req.body);
    return res.json({ ok: true });
  } catch (e) {
    console.error('[bot/webhook] processing error:', e?.message || e);
    return res.status(500).json({ ok: false });
  }
});

module.exports = router;
