const express = require('express');
const router = express.Router();

function getMonitor() {
  try {
    const manager = require('../services/monitoringManager');
    return manager && manager.telegramMonitor ? manager.telegramMonitor : null;
  } catch {
    return null;
  }
}

router.post('/webhook', express.json({ limit: '2mb' }), async (req, res) => {
  try {
    const monitor = getMonitor();
    if (!monitor || !monitor.bot) {
      console.warn('[bot/webhook] Bot not ready');
      return res.status(503).json({ ok: false, reason: 'bot_not_ready' });
    }

    const update = req.body;

    // Always let node-telegram-bot-api process the update so onText/handlers fire
    try { monitor.bot.processUpdate(update); } catch {}

    // Additionally run forwarding handlers for channel messages or non-command messages
    try {
      if (update.channel_post) {
        await monitor.onChannelPost(update.channel_post);
      } else if (update.message && !(update.message.text || '').startsWith('/')) {
        await monitor.onMessage(update.message);
      }
    } catch (e) {
      console.error('[bot/webhook] forwarding handler error:', e?.message || e);
    }

    return res.json({ ok: true });
  } catch (e) {
    console.error('[bot/webhook] processing error:', e?.message || e);
    return res.status(500).json({ ok: false });
  }
});

router.get('/status', async (req, res) => {
  try {
    const monitor = getMonitor();
    if (!monitor || !monitor.bot) {
      return res.status(503).json({ status: 'bot_not_ready' });
    }
    const me = await monitor.bot.getMe();
    return res.json({ status: 'active', bot_info: { id: me.id, username: me.username, first_name: me.first_name }, monitored_channels: monitor.monitoredChannels.size, webhook_url: monitor.webhookUrl });
  } catch (e) {
    console.error('[bot/status] error:', e?.message || e);
    return res.status(500).json({ status: 'error', error: e.message });
  }
});

module.exports = router;
