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

// Simple command handler for /start
async function handleStartCommand(bot, msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userName = msg.from.first_name || 'User';

  const FRONTEND_URL = process.env.FRONTEND_URL || 'https://frontend-service-51uy.onrender.com';
  const WEBAPP_URL = `${FRONTEND_URL}/webapp`;

  console.log(`[bot/start] User ${userId} (${userName}) started the bot`);

  const welcomeMessage = `🎉 Welcome to Telegram Forwarder Bot, ${userName}!

🚀 I can help you monitor and forward messages from Telegram channels based on your keywords.

📱 Use the Web App below to:
• Add channels to monitor
• Set up keywords for filtering
• Configure destination chats
• View forwarding logs

💡 Quick commands:
/help - Show all commands
/status - Check bot status
/webapp - Open management panel

Ready to get started? 👇`;

  const keyboard = {
    inline_keyboard: [
      [{
        text: '🌐 Open Web App',
        web_app: { url: WEBAPP_URL }
      }],
      [
        { text: '❓ Help', callback_data: 'help' },
        { text: '📊 Status', callback_data: 'status' }
      ]
    ]
  };

  try {
    await bot.sendMessage(chatId, welcomeMessage, {
      reply_markup: keyboard
    });
    console.log(`[bot/start] Welcome message sent to ${userId}`);
  } catch (error) {
    console.error(`[bot/start] Error sending message:`, error?.message || error);
  }
}

// Telegram webhook endpoint
router.post('/webhook', express.json({ limit: '2mb' }), async (req, res) => {
  try {
    const monitor = getMonitor();
    if (!monitor || !monitor.bot) {
      console.warn('[bot/webhook] Bot not ready');
      return res.status(503).json({ ok: false, reason: 'bot_not_ready' });
    }

    const update = req.body;
    console.log('[bot/webhook] Received update:', JSON.stringify({
      update_id: update.update_id,
      message: update.message ? {
        message_id: update.message.message_id,
        from: update.message.from?.first_name,
        chat: update.message.chat?.type,
        text: update.message.text
      } : null,
      channel_post: update.channel_post ? 'present' : null,
      callback_query: update.callback_query ? update.callback_query.data : null
    }));

    // Handle regular messages (including commands)
    if (update.message) {
      const msg = update.message;
      
      // Handle commands
      if (msg.text && msg.text.startsWith('/')) {
        const command = msg.text.toLowerCase().split(' ')[0];
        console.log(`[bot/webhook] Processing command: ${command}`);
        
        if (command === '/start') {
          await handleStartCommand(monitor.bot, msg);
        } else {
          // For other commands, let the bot handle them normally
          monitor.bot.processUpdate(update);
        }
      } else {
        // For non-command messages, check if it's for channel monitoring
        await monitor.onMessage(msg);
      }
    }
    
    // Handle channel posts
    if (update.channel_post) {
      console.log(`[bot/webhook] Processing channel post from chat ${update.channel_post.chat.id}`);
      await monitor.onChannelPost(update.channel_post);
    }
    
    // Handle callback queries from inline keyboards
    if (update.callback_query) {
      console.log(`[bot/webhook] Processing callback: ${update.callback_query.data}`);
      monitor.bot.processUpdate(update);
    }

    return res.json({ ok: true });
  } catch (e) {
    console.error('[bot/webhook] processing error:', e?.message || e);
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// Health check for bot
router.get('/status', async (req, res) => {
  try {
    const monitor = getMonitor();
    if (!monitor || !monitor.bot) {
      return res.status(503).json({ 
        status: 'bot_not_ready',
        message: 'Telegram bot is not initialized yet'
      });
    }
    
    const me = await monitor.bot.getMe();
    return res.json({ 
      status: 'active',
      bot_info: {
        id: me.id,
        username: me.username,
        first_name: me.first_name
      },
      monitored_channels: monitor.monitoredChannels.size,
      webhook_url: monitor.webhookUrl
    });
  } catch (e) {
    console.error('[bot/status] error:', e?.message || e);
    return res.status(500).json({ 
      status: 'error', 
      error: e.message 
    });
  }
});

module.exports = router;