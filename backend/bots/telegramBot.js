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

// Simple i18n
const i18n = {
  en: {
    welcome: (name) => `🎉 Welcome to Telegram Forwarder Bot, ${name}!\n\nUse /help for all commands or tap the Web App to configure.`,
    help: '🆘 Help\n\n/start – Start\n/help – This help\n/status – Bot and your config status\n/webapp – Open management panel\n/menu – Quick actions\n/discover – Scan chats and admin status\n/language – Change language',
    status: (count) => `📊 Bot Status\n\nMonitored Channels: ${count}\nUpdated: ${new Date().toLocaleString()}`,
    webapp: '🌐 Open the management Web App:',
    quick: '🎛️ Quick Actions',
    discover_start: '🔍 Starting discovery scan... This may take a moment.',
    discover_summary: (g, c, adminG, adminC) => `🔎 Discovery Summary\n\nGroups: ${g} (admin in ${adminG})\nChannels: ${c} (admin in ${adminC})`,
    language_prompt: (cur) => `🌐 Language\n\nCurrent: ${cur.toUpperCase()}\nChoose a language:`,
    lang_changed: (lang) => `✅ Language changed to ${lang.toUpperCase()}`,
    btn_webapp: '🌐 Open Web App',
    btn_help: '❓ Help',
    btn_status: '📊 Status',
    btn_discover: '🔍 Discover',
    btn_en: 'English',
    btn_fa: 'فارسی'
  },
  fa: {
    welcome: (name) => `🎉 به ربات فوروارد تلگرام خوش آمدی، ${name}!\n\nبرای دیدن دستورات /help را بزن یا وب‌اپ را باز کن.`,
    help: '🆘 راهنما\n\n/start – شروع\n/help – این راهنما\n/status – وضعیت ربات و تنظیمات شما\n/webapp – باز کردن پنل مدیریت\n/menu – اقدامات سریع\n/discover – اسکن چت‌ها و سطح دسترسی ادمین\n/language – تغییر زبان',
    status: (count) => `📊 وضعیت ربات\n\nکانال‌های تحت نظارت: ${count}\nبه‌روزرسانی: ${new Date().toLocaleString('fa-IR')}`,
    webapp: '🌐 پنل مدیریت را باز کن:',
    quick: '🎛️ اقدامات سریع',
    discover_start: '🔍 شروع اسکن... چند لحظه صبر کنید.',
    discover_summary: (g, c, adminG, adminC) => `🔎 خلاصه کشف\n\nگروه‌ها: ${g} (ادمین در ${adminG})\nکانال‌ها: ${c} (ادمین در ${adminC})`,
    language_prompt: (cur) => `🌐 زبان\n\nفعلی: ${cur.toUpperCase()}\nیکی را انتخاب کنید:`,
    lang_changed: (lang) => `✅ زبان به ${lang.toUpperCase()} تغییر کرد`,
    btn_webapp: '🌐 وب‌اپ',
    btn_help: '❓ راهنما',
    btn_status: '📊 وضعیت',
    btn_discover: '🔍 کشف',
    btn_en: 'English',
    btn_fa: 'فارسی'
  }
};

async function getUserLang(userId) {
  try {
    const u = await UserService.getByTelegramId?.(userId);
    const lang = (u?.lang || 'en').toLowerCase();
    return ['en','fa'].includes(lang) ? lang : 'en';
  } catch { return 'en'; }
}

async function setUserLang(userId, lang) {
  try { await UserService.createOrUpdateUser({ telegram_id: userId, lang }); } catch {}
}

class TelegramMonitor {
  static instance = null;

  constructor() {
    if (TelegramMonitor.instance) return TelegramMonitor.instance;
    this.webhookUrl = process.env.TELEGRAM_WEBHOOK_URL || 'https://backend-service-idry.onrender.com/api/bot/webhook';
    this.bot = null; // lazily created
    this.monitoredChannels = new Map();
    this.chatDiscovery = null; // lazily created after bot
    TelegramMonitor.instance = this;
  }

  async initialize() {
    try {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      if (!token) {
        console.warn('TELEGRAM_BOT_TOKEN missing; TelegramMonitor disabled');
        return;
      }

      // Create bot lazily
      this.bot = new TelegramBot(token, { polling: false });
      this.chatDiscovery = new ChatDiscoveryService(this.bot);

      // Register command handlers
      this.setupCommandHandlers();

      // Identify bot
      try {
        const me = await this.bot.getMe();
        console.log(`Telegram bot connected: @${me.username}`);
      } catch (e) {
        console.error('getMe failed:', e?.message || e);
      }

      // Reset webhook then set
      try { await this.bot.deleteWebHook({ drop_pending_updates: false }); } catch {}
      try {
        await this.bot.setWebHook(this.webhookUrl);
        console.log('Webhook set OK →', this.webhookUrl);
      } catch (e) {
        console.error('setWebHook failed:', e?.message || e);
      }

      // Commands list & menu
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
      try {
        await this.bot.setChatMenuButton({ menu_button: { type: 'web_app', text: 'Open Panel', web_app: { url: WEBAPP_URL } } });
      } catch {}

      // Load channels
      try {
        const channels = await ChannelService.getActiveChannelsByPlatform('telegram');
        for (const channel of channels) await this.startMonitoringChannel(channel);
      } catch (e) { console.error('Channel load failed:', e?.message || e); }

      console.log('Telegram Monitor initialized (webhook mode)');
    } catch (error) {
      console.error('TelegramMonitor initialize error:', error?.message || error);
    }
  }

  setupCommandHandlers() {
    // /start
    this.bot.onText(/^\/start\b/i, async (msg) => {
      const lang = await getUserLang(msg.from?.id);
      const t = i18n[lang];
      const userName = msg.from?.first_name || 'User';
      const keyboard = {
        inline_keyboard: [
          [{ text: t.btn_webapp, web_app: { url: WEBAPP_URL } }],
          [{ text: t.btn_help, callback_data: 'help' }, { text: t.btn_status, callback_data: 'status' }],
          [{ text: t.btn_discover, callback_data: 'discover' }]
        ]
      };
      try {
        await this.bot.sendMessage(msg.chat.id, t.welcome(userName), { reply_markup: keyboard });
      } catch (e) { console.error('/start sendMessage error:', e?.message || e); }
    });

    // /help
    this.bot.onText(/^\/help\b/i, async (msg) => {
      const lang = await getUserLang(msg.from?.id);
      const t = i18n[lang];
      try { await this.bot.sendMessage(msg.chat.id, t.help); } catch (e) { console.error('/help error:', e?.message || e); }
    });

    // /status
    this.bot.onText(/^\/status\b/i, async (msg) => {
      const lang = await getUserLang(msg.from?.id);
      const t = i18n[lang];
      try {
        const monitoredCount = this.monitoredChannels.size;
        await this.bot.sendMessage(msg.chat.id, t.status(monitoredCount));
      } catch (e) { console.error('/status error:', e?.message || e); }
    });

    // /webapp
    this.bot.onText(/^\/webapp\b/i, async (msg) => {
      const lang = await getUserLang(msg.from?.id);
      const t = i18n[lang];
      try {
        await this.bot.sendMessage(
          msg.chat.id,
          t.webapp,
          { reply_markup: { inline_keyboard: [[{ text: t.btn_webapp, web_app: { url: WEBAPP_URL } }]] } }
        );
      } catch (e) { console.error('/webapp error:', e?.message || e); }
    });

    // /menu
    this.bot.onText(/^\/menu\b/i, async (msg) => {
      const lang = await getUserLang(msg.from?.id);
      const t = i18n[lang];
      try {
        await this.bot.sendMessage(
          msg.chat.id,
          t.quick,
          { reply_markup: { inline_keyboard: [
            [{ text: t.btn_webapp, web_app: { url: WEBAPP_URL } }],
            [{ text: t.btn_status, callback_data: 'status' }, { text: t.btn_help, callback_data: 'help' }],
            [{ text: t.btn_discover, callback_data: 'discover' }]
          ] } }
        );
      } catch (e) { console.error('/menu error:', e?.message || e); }
    });

    // /discover
    this.bot.onText(/^\/discover\b/i, async (msg) => {
      const lang = await getUserLang(msg.from?.id);
      const t = i18n[lang];
      try {
        await this.bot.sendMessage(msg.chat.id, t.discover_start);
        // quick summary (from services if available)
        let groups = 0, channels = 0, adminGroups = 0, adminChannels = 0;
        try {
          const stats = await ChatDiscoveryService.getSummary?.(msg.from.id);
          if (stats) {
            groups = stats.groups || 0;
            channels = stats.channels || 0;
            adminGroups = stats.adminGroups || 0;
            adminChannels = stats.adminChannels || 0;
          }
        } catch {}
        await this.bot.sendMessage(msg.chat.id, t.discover_summary(groups, channels, adminGroups, adminChannels));
        // kick off background scan
        try { await ChatDiscoveryService.scan?.(msg.from.id); } catch {}
      } catch (e) { console.error('/discover error:', e?.message || e); }
    });

    // /language
    this.bot.onText(/^\/language\b/i, async (msg) => {
      const lang = await getUserLang(msg.from?.id);
      const t = i18n[lang];
      try {
        await this.bot.sendMessage(
          msg.chat.id,
          t.language_prompt(lang),
          { reply_markup: { inline_keyboard: [
            [{ text: i18n.en.btn_en, callback_data: 'lang_en' }, { text: i18n.fa.btn_fa, callback_data: 'lang_fa' }]
          ] } }
        );
      } catch (e) { console.error('/language error:', e?.message || e); }
    });

    // callbacks
    this.bot.on('callback_query', async (cb) => {
      const data = cb.data;
      try { await this.bot.answerCallbackQuery(cb.id); } catch {}
      try {
        if (data === 'help') {
          const lang = await getUserLang(cb.from?.id); const t = i18n[lang];
          await this.bot.sendMessage(cb.message.chat.id, t.help);
        } else if (data === 'status') {
          const lang = await getUserLang(cb.from?.id); const t = i18n[lang];
          const monitoredCount = this.monitoredChannels.size;
          await this.bot.sendMessage(cb.message.chat.id, t.status(monitoredCount));
        } else if (data === 'discover') {
          const lang = await getUserLang(cb.from?.id); const t = i18n[lang];
          let groups = 0, channels = 0, adminGroups = 0, adminChannels = 0;
          try {
            const stats = await ChatDiscoveryService.getSummary?.(cb.from.id);
            if (stats) {
              groups = stats.groups || 0;
              channels = stats.channels || 0;
              adminGroups = stats.adminGroups || 0;
              adminChannels = stats.adminChannels || 0;
            }
          } catch {}
          await this.bot.sendMessage(cb.message.chat.id, t.discover_summary(groups, channels, adminGroups, adminChannels));
        } else if (data === 'lang_en' || data === 'lang_fa') {
          const lang = data === 'lang_en' ? 'en' : 'fa';
          await setUserLang(cb.from?.id, lang);
          const t = i18n[lang];
          await this.bot.sendMessage(cb.message.chat.id, t.lang_changed(lang));
        }
      } catch (e) { console.error('callback error:', e?.message || e); }
    });
  }

  async startMonitoringChannel(channel) {
    try {
      const chatId = channel.platform_specific_id || this.extractChatIdFromUrl(channel.channel_url);
      if (!chatId) return;
      this.monitoredChannels.set(chatId.toString(), { channelId: channel.id, userId: channel.user_id, name: channel.name || channel.channel_name });
      console.log(`Monitoring: ${channel.channel_name} (${chatId})`);
    } catch (e) { console.error('startMonitoringChannel error:', e?.message || e); }
  }

  async stopMonitoringChannel(channelId) { this.monitoredChannels.delete(channelId.toString()); }

  extractChatIdFromUrl(url) {
    if (!url) return '';
    if (url.includes('t.me/+')) return url; // invite link
    if (url.includes('t.me/')) return '@' + url.split('/').pop();
    return url; // numeric id or @username
  }

  extractText(u) { return (u.text || u.caption || '').toString().trim(); }

  async onMessage(msg) {
    try {
      if (this.chatDiscovery) await this.chatDiscovery.processUpdate(msg);
      const info = this.monitoredChannels.get(msg.chat.id.toString());
      if (!info) return;
      await this.processMessage(msg, info.userId, info.channelId, false);
    } catch (e) { console.error('onMessage error:', e?.message || e); }
  }

  async onChannelPost(post) {
    try {
      if (this.chatDiscovery) await this.chatDiscovery.processUpdate(post);
      const info = this.monitoredChannels.get(post.chat.id.toString());
      if (!info) return;
      await this.processMessage(post, info.userId, info.channelId, true);
    } catch (e) { console.error('onChannelPost error:', e?.message || e); }
  }

  async processMessage(msg, userId, channelId, isChannelPost = false) {
    try {
      if (!msg) return;
      if (!msg.text && !msg.caption && !msg.photo && !msg.video && !msg.document && !msg.audio && !msg.voice) return;
      const text = this.extractText(msg);

      let keywords = [];
      try {
        keywords = await KeywordService.getKeywordsByChannelId(channelId);
        if (keywords.length === 0) keywords = await KeywordService.getUserKeywords(userId, true);
      } catch {}

      let shouldForward = keywords.length === 0;
      if (keywords.length > 0 && text) {
        const t = text.normalize('NFC');
        shouldForward = keywords.some(k => {
          const kw = (k.keyword || '').toString(); if (!kw) return false;
          if (k.match_mode === 'regex') { try { return new RegExp(kw, k.case_sensitive ? '' : 'i').test(t); } catch { return false; } }
          const T = k.case_sensitive ? t : t.toLowerCase();
          const K = k.case_sensitive ? kw : kw.toLowerCase();
          return k.match_mode === 'exact' ? T === K : T.includes(K);
        });
      }
      if (!shouldForward) return;

      const isDup = await checkDuplicate(msg, channelId);
      if (isDup) return;

      const destinations = await DestinationService.getUserDestinations(userId, true);
      for (const dest of destinations) {
        try {
          await this.bot.copyMessage(dest.chat_id || dest.platform_specific_id, msg.chat.id, msg.message_id);
          await LoggingService.logForwarding({ user_id: userId, channel_id: channelId, destination_id: dest.id, original_message_text: text.slice(0,500), matched_text: text.slice(0,200), status: 'success' });
        } catch (e) {
          await LoggingService.logForwarding({ user_id: userId, channel_id: channelId, destination_id: dest.id, original_message_text: text.slice(0,500), matched_text: text.slice(0,200), status: 'error' });
        }
      }
    } catch (e) { console.error('processMessage error:', e?.message || e); }
  }

  getChatDiscovery() {
    return this.chatDiscovery;
  }

  async shutdown() {
    try {
      if (this.bot) {
        await this.bot.deleteWebHook();
        console.log('Telegram bot webhook deleted');
      }
    } catch (e) {
      console.error('Error during telegram bot shutdown:', e?.message || e);
    }
  }
}

module.exports = TelegramMonitor;