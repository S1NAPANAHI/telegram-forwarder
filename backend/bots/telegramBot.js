const TelegramBot = require('node-telegram-bot-api');
const UserService = require('../services/UserService');
const KeywordService = require('../services/KeywordService');
const ChannelService = require('../services/ChannelService');
const DestinationService = require('../services/DestinationService');
const LoggingService = require('../services/LoggingService');
const { forwardMessage, checkDuplicate } = require('../services/forwardingService');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://frontend-service-51uy.onrender.com';
const WEBAPP_URL = `${FRONTEND_URL}/webapp`;

const STRINGS = { /* unchanged strings omitted for brevity */ };

async function getUserLanguage(userId) { /* unchanged */ }
async function setUserLanguage(userId, lang) { /* unchanged */ }

class TelegramMonitor {
  constructor() {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
    this.monitoredChannels = new Map();
    this.setupCommandHandlers();
    this.setupMessageHandlers();
  }

  t(lang) { return STRINGS[lang] || STRINGS.fa; }

  setupCommandHandlers() {
    // existing command handlers (unchanged)
    this.bot.onText(/\/start/, async (msg) => { /* ... */ });
    this.bot.onText(/\/help/, async (msg) => { /* ... */ });
    this.bot.onText(/\/status/, async (msg) => { /* ... */ });
    this.bot.onText(/\/webapp/, async (msg) => { /* ... */ });
    this.bot.onText(/\/(language|lang)/, async (msg) => { /* ... */ });

    this.bot.on('callback_query', async (query) => { /* ... */ });
  }

  setupMessageHandlers() {
    // Group/private messages
    this.bot.on('message', async (msg) => {
      // If this chat is monitored, process
      const channelInfo = this.monitoredChannels.get(msg.chat.id.toString());
      if (channelInfo) {
        await this.processMessage(msg, channelInfo.userId, channelInfo.channelId);
        return;
      }

      // Handle commands gracefully
      if (msg.text && msg.text.startsWith('/')) {
        const known = ['/start','/help','/status','/webapp','/language','/lang'];
        if (known.some(k => msg.text.startsWith(k))) return;
        const lang = await getUserLanguage(msg.from?.id || msg.chat.id);
        const s = this.t(lang);
        await this.safeSend(msg.chat.id, s.unknown(msg.text));
      }
    });

    // Channel posts: critical for channels where bot is admin
    this.bot.on('channel_post', async (post) => {
      const channelInfo = this.monitoredChannels.get(post.chat.id.toString());
      if (!channelInfo) return;
      await this.processMessage(post, channelInfo.userId, channelInfo.channelId, true);
    });
  }

  async initialize() {
    try {
      const botInfo = await this.bot.getMe();
      console.log(`Telegram bot connected: @${botInfo.username}`);

      try {
        await this.bot.setChatMenuButton({ menu_button: { type: 'web_app', text: 'Open Panel', web_app: { url: WEBAPP_URL } } });
      } catch (e) { console.error('Failed to set menu button:', e); }

      // Warn if privacy mode likely enabled (group messages may be limited)
      console.log('Note: Ensure bot privacy mode is disabled in BotFather (/setprivacy → Disable) to read group messages.');

      // Load monitored channels from DB
      let channels = [];
      try { channels = await ChannelService.getActiveChannelsByPlatform('telegram'); }
      catch (e) { console.error('Error fetching channels:', e); }

      for (const channel of channels) {
        await this.startMonitoringChannel(channel);
      }

      console.log('Telegram Monitor initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Telegram Monitor:', error);
    }
  }

  async startMonitoringChannel(channel) {
    try {
      console.log(`Starting monitoring for channel: ${channel.name} (${channel.platform_specific_id})`);
      this.monitoredChannels.set(channel.platform_specific_id.toString(), {
        channelId: channel.id,
        userId: channel.user_id,
        name: channel.name
      });
    } catch (error) {
      console.error('Error starting channel monitoring:', error);
    }
  }

  async stopMonitoringChannel(channelId) {
    try {
      this.monitoredChannels.delete(channelId.toString());
      console.log(`Stopped monitoring channel: ${channelId}`);
    } catch (error) {
      console.error('Error stopping channel monitoring:', error);
    }
  }

  extractText(u) {
    return (u.text || u.caption || '').toString().trim();
  }

  async processMessage(msg, userId, channelId, isChannelPost = false) {
    try {
      // Skip updates without content
      if (!msg.text && !msg.caption && !msg.photo && !msg.video && !msg.document && !msg.audio && !msg.voice) {
        return;
      }

      const text = this.extractText(msg);
      console.log(`Processing ${isChannelPost ? 'channel_post' : 'message'} from chat ${msg.chat.id} for user ${userId} text:"${text.slice(0,80)}"`);

      // Load keywords (channel-specific or user-wide fallback)
      let keywords = [];
      try {
        keywords = await KeywordService.getKeywordsByChannelId(channelId);
      } catch (e) {
        console.warn('Keyword fetch failed, defaulting to forward-all:', e?.message);
      }

      // Decide forwarding
      let shouldForward = keywords.length === 0; // forward all if no keywords configured
      if (keywords.length > 0 && text) {
        const t = text.normalize('NFC');
        shouldForward = keywords.some(k => {
          const kw = (k.keyword || '').toString();
          if (!kw) return false;
          if (k.match_mode === 'regex') {
            try { return new RegExp(kw, k.case_sensitive ? '' : 'i').test(t); } catch { return false; }
          }
          const T = k.case_sensitive ? t : t.toLowerCase();
          const K = k.case_sensitive ? kw : kw.toLowerCase();
          return k.match_mode === 'exact' ? T === K : T.includes(K);
        });
      }

      if (!shouldForward) return;

      // Prevent duplicates
      const isDuplicate = await checkDuplicate(msg, channelId);
      if (isDuplicate) return;

      // Get destinations for this channel
      const destinations = await DestinationService.getDestinationsByChannelId(channelId);
      for (const dest of destinations) {
        try {
          // Prefer copyMessage to preserve content & support media
          await this.bot.copyMessage(dest.platform_specific_id || dest.chat_id || dest.id, msg.chat.id, msg.message_id);

          await LoggingService.logForwarding({
            user_id: userId,
            channel_id: channelId,
            destination_id: dest.id,
            message_type: msg.photo ? 'photo' : msg.video ? 'video' : msg.document ? 'document' : msg.audio ? 'audio' : msg.voice ? 'voice' : 'text',
            success: true
          });
        } catch (e) {
          console.error('Forward/copy error:', e?.response?.body || e?.message || e);
          await LoggingService.logForwarding({
            user_id: userId,
            channel_id: channelId,
            destination_id: dest.id,
            message_type: 'error',
            success: false,
            error: e?.message || String(e)
          });
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      await LoggingService.logForwarding({
        user_id: userId,
        channel_id: channelId,
        destination_id: null,
        message_type: 'error',
        success: false,
        error: error.message
      });
    }
  }

  async getChannelInfo(channelUsername) { /* unchanged */ }

  async safeSend(chatId, text, options = {}) {
    try { return await this.bot.sendMessage(chatId, text, options); }
    catch (e) { console.error('Error sending message:', e?.message || e); }
  }
}

module.exports = TelegramMonitor;
