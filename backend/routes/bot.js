const express = require('express');
const router = express.Router();
const TelegramMonitor = require('../bots/telegramBot');

// Singleton: reuse the instance created by monitoringManager if available
let monitorInstance = null;
function getMonitor() {
  try {
    const manager = require('../services/monitoringManager');
    if (manager && manager.telegramMonitor) return manager.telegramMonitor;
  } catch {}
  if (!monitorInstance) monitorInstance = new (require('../bots/telegramBot'))();
  return monitorInstance;
}

// Telegram webhook endpoint
router.post('/webhook', express.json({ limit: '2mb' }), async (req, res) => {
  try {
    const monitor = getMonitor();
    if (!monitor || !monitor.bot || !monitor.bot.processUpdate) {
      console.error('Webhook received but bot is not ready');
      return res.status(503).json({ ok: false });
    }
    await monitor.bot.processUpdate(req.body);
    return res.json({ ok: true });
  } catch (e) {
    console.error('Webhook processing error:', e?.message || e);
    return res.status(500).json({ ok: false });
  }
});

module.exports = router;
