const TelegramBot = require('node-telegram-bot-api');
const UserService = require('../services/UserService');
const KeywordService = require('../services/KeywordService');
const ChannelService = require('../services/ChannelService');
const DestinationService = require('../services/DestinationService');
const LoggingService = require('../services/LoggingService');
const ChatDiscoveryService = require('../services/ChatDiscoveryService');
const { forwardMessage, checkDuplicate } = require('../services/forwardingService');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://frontend-service-51uy.onrender.com';
const WEBAPP_URL = `${FRONTEND_URL}/webapp`;

const STRINGS = {
  fa: {
    welcome: 'به ربات فورواردر تلگرام خوش آمدید! 🤖\n\nاین ربات به شما کمک می‌کند تا پیام‌ها را از کانال‌های مختلف به مقصدهای مورد نظرتان فوروارد کنید.\n\nبرای شروع، روی دکمه زیر کلیک کنید:',
    help: 'راهنما 📖\n\nدستورات موجود:\n/start - شروع کار با ربات\n/help - نمایش راهنما\n/status - وضعیت ربات\n/webapp - باز کردن پنل مدیریت\n/language - تغییر زبان\n/discover - کشف کانال‌ها و گروه‌ها\n\nبرای مدیریت کامل، از پنل وب استفاده کنید.',
    status: 'وضعیت ربات: ✅ آنلاین\n\nربات به درستی کار می‌کند و آماده دریافت دستورات شما است.',
    language_current: 'زبان فعلی: فارسی 🇮🇷\n\nبرای تغییر زبان یکی از گزینه‌های زیر را انتخاب کنید:',
    language_changed: 'زبان با موفقیت تغییر کرد! ✅',
    open_panel: '📱 باز کردن پنل',
    discover_start: 'در حال بررسی کانال‌ها و گروه‌هایی که ربات عضو آنهاست...\n\nلطفاً صبر کنید...',
    discover_complete: (adminCount, memberCount) => `✅ بررسی تکمیل شد!\n\n🔑 ادمین در ${adminCount} کانال/گروه\n👥 عضو در ${memberCount} کانال/گروه\n\nبرای مشاهده و افزودن به لیست نظارت، از پنل وب استفاده کنید.`,
    unknown: (cmd) => `دستور "${cmd}" شناخته نشده است. ❌\n\nبرای مشاهده دستورات موجود از /help استفاده کنید.`
  },
  en: {
    welcome: 'Welcome to Telegram Forwarder Bot! 🤖\n\nThis bot helps you forward messages from different channels to your desired destinations.\n\nTo get started, click the button below:',
    help: 'Help 📖\n\nAvailable commands:\n/start - Start using the bot\n/help - Show this help\n/status - Bot status\n/webapp - Open management panel\n/language - Change language\n/discover - Discover channels and groups\n\nFor full management, use the web panel.',
    status: 'Bot Status: ✅ Online\n\nThe bot is working correctly and ready to receive your commands.',
    language_current: 'Current language: English 🇺🇸\n\nSelect one of the options below to change language:',
    language_changed: 'Language changed successfully! ✅',
    open_panel: '📱 Open Panel',
    discover_start: 'Scanning channels and groups where the bot is a member...\n\nPlease wait...',
    discover_complete: (adminCount, memberCount) => `✅ Scan complete!\n\n🔑 Admin in ${adminCount} channels/groups\n👥 Member in ${memberCount} channels/groups\n\nUse the web panel to view and add them to monitoring.`,
    unknown: (cmd) => `Unknown command "${cmd}". ❌\n\nUse /help to see available commands.`
  }
};

async function getUserLanguage(userId) {
  try {
    const userLang = await UserService.getUserLanguage(userId);
    return userLang || 'fa';
  } catch (error) {
    console.error('Error fetching user language:', error);
    return 'fa';
  }
}

async function setUserLanguage(userId, lang) {
  try {
    await UserService.setUserLanguage(userId, lang);
  } catch (error) {
    console.error('Error setting user language:', error);
  }
}

class TelegramMonitor {
  constructor() {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { 
      polling: true,
      onlyFirstMatch: false // Allow multiple handlers to process updates
    });
    this.monitoredChannels = new Map();
    this.chatDiscovery = new ChatDiscoveryService(this.bot);
    this.setupCommandHandlers();
    this.setupMessageHandlers();
  }

  t(lang) { return STRINGS[lang] || STRINGS.fa; }

  setupCommandHandlers() {
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      const lang = await getUserLanguage(userId);
      const s = this.t(lang);
      await this.safeSend(chatId, s.welcome, {
        reply_markup: { inline_keyboard: [[{ text: s.open_panel, web_app: { url: WEBAPP_URL } }]] }
      });
    });

    this.bot.onText(/\/help/, async (msg) => {
      const chatId = msg.chat.id; 
      const userId = msg.from.id; 
      const lang = await getUserLanguage(userId); 
      const s = this.t(lang);
      await this.safeSend(chatId, s.help, { 
        reply_markup: { inline_keyboard: [[{ text: s.open_panel, web_app: { url: WEBAPP_URL } }]] } 
      });
    });

    this.bot.onText(/\/status/, async (msg) => {
      const chatId = msg.chat.id; 
      const userId = msg.from.id; 
      const lang = await getUserLanguage(userId); 
      const s = this.t(lang);
      await this.safeSend(chatId, s.status, { 
        reply_markup: { inline_keyboard: [[{ text: s.open_panel, web_app: { url: WEBAPP_URL } }]] } 
      });
    });

    this.bot.onText(/\/webapp/, async (msg) => {
      const chatId = msg.chat.id; 
      const userId = msg.from.id; 
      const lang = await getUserLanguage(userId); 
      const s = this.t(lang);
      await this.safeSend(chatId, s.open_panel, { 
        reply_markup: { inline_keyboard: [[{ text: s.open_panel, web_app: { url: WEBAPP_URL } }]] } 
      });
    });

    this.bot.onText(/\/(language|lang)/, async (msg) => {
      const chatId = msg.chat.id; 
      const userId = msg.from.id; 
      const lang = await getUserLanguage(userId); 
      const s = this.t(lang);
      await this.safeSend(chatId, s.language_current, { 
        reply_markup: { 
          inline_keyboard: [
            [
              { text: 'فارسی', callback_data: 'set_lang_fa' }, 
              { text: 'English', callback_data: 'set_lang_en' }
            ]
          ] 
        } 
      });
    });

    // NEW: Discover command
    this.bot.onText(/\/discover/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      const lang = await getUserLanguage(userId);
      const s = this.t(lang);
      
      await this.safeSend(chatId, s.discover_start);
      
      try {
        const results = await this.chatDiscovery.refreshAllAdminStatuses();
        const adminChats = results.filter(r => r.isAdmin);
        const memberChats = results.filter(r => r.isMember);
        
        await this.safeSend(chatId, s.discover_complete(adminChats.length, memberChats.length), {
          reply_markup: { inline_keyboard: [[{ text: s.open_panel, web_app: { url: WEBAPP_URL } }]] }
        });
      } catch (err) {
        await this.safeSend(chatId, 'خطا در بررسی کانال‌ها. لطفاً دوباره تلاش کنید.');
      }
    });

    this.bot.on('callback_query', async (query) => {
      const chatId = query.message.chat.id;
      const userId = query.from.id;
      const data = query.callback_data;

      if (data === 'set_lang_fa' || data === 'set_lang_en') {
        const newLang = data.split('_')[2];
        await setUserLanguage(userId, newLang);
        const s = this.t(newLang);
        
        await this.bot.editMessageText(s.language_changed, {
          chat_id: chatId,
          message_id: query.message.message_id,
          reply_markup: { 
            inline_keyboard: [[{ text: s.open_panel, web_app: { url: WEBAPP_URL } }]] 
          }
        });
        
        await this.bot.answerCallbackQuery(query.id);
      }
    });
  }

  setupMessageHandlers() {
    // Group/private messages + chat discovery
    this.bot.on('message', async (msg) => {
      // Auto-discover this chat
      await this.chatDiscovery.processUpdate(msg);
      
      // If this chat is monitored, process for forwarding
      const channelInfo = this.monitoredChannels.get(msg.chat.id.toString());
      if (channelInfo) {
        await this.processMessage(msg, channelInfo.userId, channelInfo.channelId);
        return;
      }

      // Handle commands gracefully (don't process as messages)
      if (msg.text && msg.text.startsWith('/')) {
        const known = ['/start','/help','/status','/webapp','/language','/lang','/discover'];
        if (known.some(k => msg.text.startsWith(k))) return;
        
        const lang = await getUserLanguage(msg.from?.id || msg.chat.id);
        const s = this.t(lang);
        await this.safeSend(msg.chat.id, s.unknown(msg.text), {
          reply_markup: { inline_keyboard: [[{ text: s.open_panel, web_app: { url: WEBAPP_URL } }]] }
        });
      }
    });

    // Channel posts + chat discovery: critical for channels where bot is admin
    this.bot.on('channel_post', async (post) => {
      // Auto-discover this chat
      await this.chatDiscovery.processUpdate(post);
      
      // If monitored, process for forwarding
      const channelInfo = this.monitoredChannels.get(post.chat.id.toString());
      if (!channelInfo) return;
      await this.processMessage(post, channelInfo.userId, channelInfo.channelId, true);
    });

    // Bot membership changes (added/removed/promoted)
    this.bot.on('my_chat_member', async (update) => {
      console.log('Bot membership changed in chat:', update.chat.id, 'New status:', update.new_chat_member?.status);
      
      const chatData = {
        chat_id: update.chat.id.toString(),
        chat_type: update.chat.type,
        title: update.chat.title || null,
        username: update.chat.username || null,
        is_bot_admin: ['administrator', 'creator'].includes(update.new_chat_member?.status),
        is_bot_member: !['left', 'kicked'].includes(update.new_chat_member?.status)
      };
      
      await this.chatDiscovery.saveDiscoveredChat(chatData);
    });
  }

  async initialize() {
    try {
      const botInfo = await this.bot.getMe();
      console.log(`Telegram bot connected: @${botInfo.username}`);

      try {
        await this.bot.setChatMenuButton({ menu_button: { type: 'web_app', text: 'Open Panel', web_app: { url: WEBAPP_URL } } });
      } catch (e) { console.error('Failed to set menu button:', e); }

      // Important setup reminder
      console.log('⚠️  IMPORTANT: Ensure bot privacy mode is disabled in BotFather (/setprivacy → Disable) to read group messages.');

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
      console.log(`Starting monitoring for channel: ${channel.name || channel.channel_name} (${channel.platform_specific_id || channel.channel_url})`);
      const chatId = channel.platform_specific_id || this.extractChatIdFromUrl(channel.channel_url);
      this.monitoredChannels.set(chatId.toString(), {
        channelId: channel.id,
        userId: channel.user_id,
        name: channel.name || channel.channel_name
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

  extractChatIdFromUrl(url) {
    if (url.includes('t.me/+')) {
      return url; // Keep invite links as-is
    }
    if (url.includes('t.me/')) {
      return '@' + url.split('/').pop();
    }
    return url; // Numeric ID or @username
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
        if (keywords.length === 0) {
          // Fallback to user-wide keywords
          keywords = await KeywordService.getUserKeywords(userId, true); // active only
        }
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

      if (!shouldForward) {
        console.log('Message does not match keywords, skipping forward');
        return;
      }

      console.log('Message matches keywords, proceeding to forward');

      // Prevent duplicates
      const isDuplicate = await checkDuplicate(msg, channelId);
      if (isDuplicate) {
        console.log('Duplicate message detected, skipping');
        return;
      }

      // Get destinations for this user/channel
      let destinations = [];
      try {
        destinations = await DestinationService.getUserDestinations(userId, true); // active only
      } catch (e) {
        console.error('Failed to fetch destinations:', e.message);
        return;
      }

      console.log(`Found ${destinations.length} destinations for forwarding`);

      for (const dest of destinations) {
        try {
          // Use copyMessage to preserve content & support media
          const destChatId = dest.chat_id || dest.platform_specific_id;
          console.log(`Copying message to destination: ${destChatId}`);
          
          await this.bot.copyMessage(destChatId, msg.chat.id, msg.message_id);
          console.log(`Successfully forwarded to ${destChatId}`);

          await LoggingService.logForwarding({
            user_id: userId,
            channel_id: channelId,
            destination_id: dest.id,
            original_message_text: text.substring(0, 500),
            matched_text: text.substring(0, 200),
            status: 'success',
            processing_time_ms: Date.now() % 10000
          });
        } catch (e) {
          console.error(`Forward/copy error to ${dest.chat_id}:`, e?.response?.body || e?.message || e);
          await LoggingService.logForwarding({
            user_id: userId,
            channel_id: channelId,
            destination_id: dest.id,
            original_message_text: text.substring(0, 500),
            matched_text: text.substring(0, 200),
            status: 'error',
            processing_time_ms: Date.now() % 10000
          });
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }

  async getChannelInfo(channelUsername) {
    try {
      const chat = await this.bot.getChat(channelUsername);
      return {
        id: chat.id,
        title: chat.title,
        username: chat.username,
        type: chat.type
      };
    } catch (error) {
      console.error('Error getting channel info:', error);
      throw error;
    }
  }

  async safeSend(chatId, text, options = {}) {
    try { return await this.bot.sendMessage(chatId, text, options); }
    catch (e) { console.error('Error sending message:', e?.message || e); }
  }

  // Get chat discovery service for external use
  getChatDiscovery() {
    return this.chatDiscovery;
  }
}

module.exports = TelegramMonitor;