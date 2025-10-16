const TelegramBot = require('node-telegram-bot-api');
const UserService = require('../services/UserService');
const KeywordService = require('../services/KeywordService');
const ChannelService = require('../services/ChannelService');
const DestinationService = require('../services/DestinationService');
const LoggingService = require('../services/LoggingService');
const ChatDiscoveryService = require('../services/ChatDiscoveryService');
const TelegramDiscoveryService = require('../services/TelegramDiscoveryService');
const attachPassiveAutoPromote = require('./passiveAutoPromote');
const { forwardMessage, checkDuplicate } = require('../services/forwardingService');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://frontend-service-51uy.onrender.com';
const WEBAPP_URL = `${FRONTEND_URL}/webapp`;

// Simple i18n
const i18n = { /* unchanged */ };

async function getUserLang(userId) { /* unchanged */ }
async function setUserLang(userId, lang) { /* unchanged */ }

class TelegramMonitor {
  static instance = null;

  constructor() {
    if (TelegramMonitor.instance) return TelegramMonitor.instance;
    this.webhookUrl = process.env.TELEGRAM_WEBHOOK_URL || 'https://backend-service-idry.onrender.com/api/bot/webhook';
    this.bot = null;
    this.monitoredChannels = new Map();
    this.chatDiscovery = null;
    this.telegramDiscoveryService = null;
    TelegramMonitor.instance = this;
  }

  async initialize() {
    try {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      if (!token) {
        console.warn('TELEGRAM_BOT_TOKEN missing; TelegramMonitor disabled');
        return;
      }

      this.bot = new TelegramBot(token, { polling: false });
      this.chatDiscovery = new ChatDiscoveryService(this.bot);
      this.telegramDiscoveryService = new TelegramDiscoveryService();

      this.setupCommandHandlers();

      try { const me = await this.bot.getMe(); console.log(`Telegram bot connected: @${me.username}`); } catch {}
      try { await this.bot.deleteWebHook({ drop_pending_updates: false }); } catch {}
      try { await this.bot.setWebHook(this.webhookUrl); console.log('Webhook set OK →', this.webhookUrl); } catch {}

      try {
        await this.bot.setMyCommands([
          { command: 'start', description: 'Start using the bot' },
          { command: 'help', description: 'Show help and available commands' },
          { command: 'status', description: 'Bot status and health' },
          { command: 'webapp', description: 'Open management panel' },
          { command: 'menu', description: 'Show quick action buttons' },
          { command: 'discover', description: 'Scan chats and report admin status' },
          { command: 'language', description: 'Change language' },
          { command: 'ping', description: 'Test bot response' }
        ]);
      } catch {}
      try { await this.bot.setChatMenuButton({ menu_button: { type: 'web_app', text: 'Open Panel', web_app: { url: WEBAPP_URL } } }); } catch {}

      try {
        const channels = await ChannelService.getActiveChannelsByPlatform('telegram');
        for (const channel of channels) await this.startMonitoringChannel(channel);
      } catch {}

      // Register passive discovery on webhook updates
      this.registerPassiveDiscovery = () => {
        const upsertDiscovered = async (chat, userId = null) => {
          try {
            if (!chat || chat.type === 'private') return;
            const data = {
              chat_id: chat.id.toString(), chat_type: chat.type,
              title: chat.title || chat.first_name || null, username: chat.username || null,
            };
            if (userId) {
              const supabase = require('../database/supabase');
              const me = await this.bot.getMe();
              let isAdmin = false;
              if (['group','supergroup','channel'].includes(chat.type)) {
                try { const member = await this.bot.getChatMember(chat.id, me.id); isAdmin = ['administrator','creator'].includes(member.status); } catch {}
              }
              await supabase.from('discovered_chats').upsert({
                user_id: userId, chat_id: data.chat_id, chat_type: data.chat_type,
                chat_title: data.title, chat_username: data.username, is_admin: isAdmin,
                discovery_method: 'bot_api', last_discovered: new Date().toISOString()
              }, { onConflict: 'user_id,chat_id' });
            }
            await this.chatDiscovery.saveDiscoveredChat({
              chat_id: data.chat_id, chat_type: data.chat_type,
              title: data.title, username: data.username,
              is_bot_admin: undefined, is_bot_member: true,
            });
          } catch (e) { console.warn('Passive discovery error:', e.message); }
        };
        this.bot.on('message', async (msg) => {
          let userId = null; try { if (msg.from && msg.from.id) { const user = await UserService.getByTelegramId(msg.from.id); userId = user?.id; } } catch {}
          await upsertDiscovered(msg.chat, userId);
        });
        this.bot.on('channel_post', async (post) => { await upsertDiscovered(post.chat); });
      };
      this.registerPassiveDiscovery();

      // Attach passive auto-promote
      try { attachPassiveAutoPromote(this.bot, this.monitoredChannels); } catch {}

      console.log('Telegram Monitor initialized (webhook mode)');
    } catch (error) {
      console.error('TelegramMonitor initialize error:', error?.message || error);
    }
  }

  // ... rest unchanged
}

module.exports = TelegramMonitor;