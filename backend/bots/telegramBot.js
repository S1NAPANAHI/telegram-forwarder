const TelegramBot = require('node-telegram-bot-api');
const UserService = require('../services/UserService');
const KeywordService = require('../services/KeywordService');
const ChannelService = require('../services/ChannelService');
const DestinationService = require('../services/DestinationService');
const LoggingService = require('../services/LoggingService');
const ChatDiscoveryService = require('../services/ChatDiscoveryService');
const TelegramDiscoveryService = require('../services/TelegramDiscoveryService');
const { forwardMessage, checkDuplicate } = require('../services/forwardingService');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://frontend-service-51uy.onrender.com';
const WEBAPP_URL = `${FRONTEND_URL}/webapp`;

// Simple i18n (omitted for brevity - unchanged)
// ... existing i18n object ...

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
          { command: 'language', description: 'Change language' }
        ]);
      } catch {}
      try { await this.bot.setChatMenuButton({ menu_button: { type: 'web_app', text: 'Open Panel', web_app: { url: WEBAPP_URL } } }); } catch {}

      try {
        const channels = await ChannelService.getActiveChannelsByPlatform('telegram');
        for (const channel of channels) await this.startMonitoringChannel(channel);
      } catch {}

      // Register passive discovery on webhook updates
      this.registerPassiveDiscovery();

      console.log('Telegram Monitor initialized (webhook mode)');
    } catch (error) {
      console.error('TelegramMonitor initialize error:', error?.message || error);
    }
  }

  registerPassiveDiscovery() {
    const upsertDiscovered = async (chat) => {
      try {
        if (!chat) return;
        const data = {
          chat_id: chat.id.toString(),
          chat_type: chat.type,
          title: chat.title || chat.first_name || null,
          username: chat.username || null,
        };
        await this.chatDiscovery.saveDiscoveredChat({
          chat_id: data.chat_id,
          chat_type: data.chat_type,
          title: data.title,
          username: data.username,
          is_bot_admin: undefined,
          is_bot_member: true,
        });
        if (['group','supergroup','channel'].includes(chat.type)) {
          await this.chatDiscovery.checkAdminStatus(chat.id);
        }
      } catch (e) { /* ignore */ }
    };

    this.bot.on('message', async (msg) => {
      await upsertDiscovered(msg.chat);
    });
    this.bot.on('channel_post', async (post) => {
      await upsertDiscovered(post.chat);
    });
  }

  setupCommandHandlers() {
    // existing handlers ...

    // Enhanced /discover
    this.bot.onText(/^\/discover\b(?:\s+(?<handle>@?[A-Za-z0-9_]+))?/i, async (msg, match) => {
      const lang = await getUserLang(msg.from?.id);
      try {
        await this.bot.sendMessage(msg.chat.id, '🔍 Scanning known chats...');
        // Ensure user exists
        let user = await UserService.getByTelegramId(msg.from.id);
        if (!user) {
          user = await UserService.createOrUpdateUser({
            telegram_id: msg.from.id,
            username: msg.from.username,
            first_name: msg.from.first_name,
            last_name: msg.from.last_name,
            language: lang
          });
        }

        // Optional: probe specific handle provided by user
        const handle = match?.groups?.handle;
        if (handle) {
          const svc = this.telegramDiscoveryService;
          const chatId = svc.normalizeChatId(handle);
          try {
            const me = await this.bot.getMe();
            const chat = await this.bot.getChat(chatId);
            const member = await this.bot.getChatMember(chatId, me.id).catch(() => ({ status: 'left' }));
            const isAdmin = ['administrator','creator'].includes(member.status);
            const supabase = require('../database/supabase');
            await supabase.from('discovered_chats').upsert({
              user_id: user.id,
              chat_id: chatId.toString(),
              chat_type: chat.type,
              chat_title: chat.title || chat.first_name || 'Chat',
              chat_username: chat.username || null,
              is_admin: isAdmin,
              discovery_method: 'bot_api',
              last_discovered: new Date().toISOString()
            }, { onConflict: 'user_id,chat_id' });
          } catch {}
        }

        // Probe known channels from DB for this user
        await this.telegramDiscoveryService.probeKnownChannels(user.id);
        const chats = await this.telegramDiscoveryService.getDiscoveredChats(user.id);
        const response = this.telegramDiscoveryService.formatDiscoveryResponse(chats);
        await this.bot.sendMessage(msg.chat.id, response, { parse_mode: 'HTML' });
      } catch (e) {
        await this.bot.sendMessage(msg.chat.id, '❌ Discovery failed. Please try again later.');
      }
    });
  }

  async startMonitoringChannel(channel) { /* unchanged */ }
  async stopMonitoringChannel(channelId) { /* unchanged */ }
  extractChatIdFromUrl(url) { /* unchanged */ }
  extractText(u) { /* unchanged */ }
  async onMessage(msg) { /* unchanged */ }
  async onChannelPost(post) { /* unchanged */ }
  async processMessage(msg, userId, channelId, isChannelPost = false) { /* unchanged */ }
  getChatDiscovery() { return this.chatDiscovery; }
  getTelegramDiscoveryService() { return this.telegramDiscoveryService; }
  async shutdown() { /* unchanged */ }
}

module.exports = TelegramMonitor;
