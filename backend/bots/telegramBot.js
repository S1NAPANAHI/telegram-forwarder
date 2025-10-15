const TelegramBot = require('node-telegram-bot-api');
const UserService = require('../services/UserService');
const KeywordService = require('../services/KeywordService');
const ChannelService = require('../services/ChannelService');
const DestinationService = require('../services/DestinationService');
const LoggingService = require('../services/LoggingService');
const { forwardMessage, checkDuplicate } = require('../services/forwardingService');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://frontend-service-51uy.onrender.com';
const WEBAPP_URL = `${FRONTEND_URL}/webapp`;

const STRINGS = { /* unchanged */ };

async function getUserLanguage(userId) { /* unchanged */ }
async function setUserLanguage(userId, lang) { /* unchanged */ }

class TelegramMonitor {
  constructor() {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
    this.monitoredChannels = new Map();
    this.setupCommandHandlers();
  }

  t(lang) { return STRINGS[lang] || STRINGS.fa; }

  setupCommandHandlers() {
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      const lang = await getUserLanguage(userId);
      const s = this.t(lang);
      await this.bot.sendMessage(chatId, s.welcome, {
        reply_markup: { inline_keyboard: [[{ text: s.open_panel, web_app: { url: WEBAPP_URL } }]] }
      });
    });

    this.bot.onText(/\/help/, async (msg) => {
      const chatId = msg.chat.id; const userId = msg.from.id; const lang = await getUserLanguage(userId); const s = this.t(lang);
      await this.bot.sendMessage(chatId, s.help, { reply_markup: { inline_keyboard: [[{ text: s.open_panel, web_app: { url: WEBAPP_URL } }]] } });
    });

    this.bot.onText(/\/status/, async (msg) => {
      const chatId = msg.chat.id; const userId = msg.from.id; const lang = await getUserLanguage(userId); const s = this.t(lang);
      await this.bot.sendMessage(chatId, s.status, { reply_markup: { inline_keyboard: [[{ text: s.open_panel, web_app: { url: WEBAPP_URL } }]] } });
    });

    this.bot.onText(/\/webapp/, async (msg) => {
      const chatId = msg.chat.id; const userId = msg.from.id; const lang = await getUserLanguage(userId); const s = this.t(lang);
      await this.bot.sendMessage(chatId, s.open_panel, { reply_markup: { inline_keyboard: [[{ text: s.open_panel, web_app: { url: WEBAPP_URL } }]] } });
    });

    this.bot.onText(/\/(language|lang)/, async (msg) => {
      const chatId = msg.chat.id; const userId = msg.from.id; const lang = await getUserLanguage(userId); const s = this.t(lang);
      await this.bot.sendMessage(chatId, s.language_current, { reply_markup: { inline_keyboard: [[{ text: 'فارسی', callback_data: 'set_lang_fa' }, { text: 'English', callback_data: 'set_lang_en' }]] } });
    });

    this.bot.on('callback_query', async (query) => { /* unchanged */ });

    this.bot.on('message', async (msg) => {
      const channelInfo = this.monitoredChannels.get(msg.chat.id.toString());
      if (channelInfo) { await this.processMessage(msg, channelInfo.userId, channelInfo.channelId); return; }
      if (msg.text && msg.text.startsWith('/')) {
        const known = ['/start', '/help', '/status', '/webapp', '/language', '/lang'];
        if (known.some(k => msg.text.startsWith(k))) return;
        const lang = await getUserLanguage(msg.from.id); const s = this.t(lang);
        await this.bot.sendMessage(msg.chat.id, s.unknown(msg.text), { reply_markup: { inline_keyboard: [[{ text: s.open_panel, web_app: { url: WEBAPP_URL } }]] } });
      }
    });
  }

  async initialize() {
    try {
      const botInfo = await this.bot.getMe();
      console.log(`Telegram bot connected: @${botInfo.username}`);
      try {
        await this.bot.setChatMenuButton({ menu_button: { type: 'web_app', text: 'Open Panel', web_app: { url: WEBAPP_URL } } });
      } catch (e) { console.error('Failed to set menu button:', e); }
      let channels = []; try { channels = await ChannelService.getActiveChannelsByPlatform('telegram'); } catch (e) { console.error('Error fetching channels:', e); }
      for (const channel of channels) await this.startMonitoringChannel(channel);
      console.log('Telegram Monitor initialized successfully');
    } catch (error) { console.error('Failed to initialize Telegram Monitor:', error); }
  }

  /* rest unchanged */
}

module.exports = TelegramMonitor;
