const TelegramBot = require('node-telegram-bot-api');
const UserService = require('../services/UserService');
const KeywordService = require('../services/KeywordService');
const ChannelService = require('../services/ChannelService');
const DestinationService = require('../services/DestinationService');
const LoggingService = require('../services/LoggingService');
const { forwardMessage, checkDuplicate } = require('../services/forwardingService');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://frontend-service-51uy.onrender.com';
const WEBAPP_URL = `${FRONTEND_URL}/webapp`;

const STRINGS = {
  fa: {
    welcome: 'به ربات فورواردر تلگرام خوش آمدید! 🤖\n\nاین ربات به شما کمک می‌کند تا پیام‌ها را از کانال‌های مختلف به مقصدهای مورد نظرتان فوروارد کنید.\n\nبرای شروع، روی دکمه زیر کلیک کنید:',
    help: 'راهنما 📖\n\nدستورات موجود:\n/start - شروع کار با ربات\n/help - نمایش راهنما\n/status - وضعیت ربات\n/webapp - باز کردن پنل مدیریت\n/language - تغییر زبان\n\nبرای مدیریت کامل، از پنل وب استفاده کنید.',
    status: 'وضعیت ربات: ✅ آنلاین\n\nربات به درستی کار می‌کند و آماده دریافت دستورات شما است.',
    language_current: 'زبان فعلی: فارسی 🇮🇷\n\nبرای تغییر زبان یکی از گزینه‌های زیر را انتخاب کنید:',
    language_changed: 'زبان با موفقیت تغییر کرد! ✅',
    open_panel: '📱 باز کردن پنل',
    unknown: (cmd) => `دستور "${cmd}" شناخته نشده است. ❌\n\nبرای مشاهده دستورات موجود از /help استفاده کنید.`
  },
  en: {
    welcome: 'Welcome to Telegram Forwarder Bot! 🤖\n\nThis bot helps you forward messages from different channels to your desired destinations.\n\nTo get started, click the button below:',
    help: 'Help 📖\n\nAvailable commands:\n/start - Start using the bot\n/help - Show this help\n/status - Bot status\n/webapp - Open management panel\n/language - Change language\n\nFor full management, use the web panel.',
    status: 'Bot Status: ✅ Online\n\nThe bot is working correctly and ready to receive your commands.',
    language_current: 'Current language: English 🇺🇸\n\nSelect one of the options below to change language:',
    language_changed: 'Language changed successfully! ✅',
    open_panel: '📱 Open Panel',
    unknown: (cmd) => `Unknown command "${cmd}". ❌\n\nUse /help to see available commands.`
  }
};

async function getUserLanguage(userId) {
  try {
    const userLang = await UserService.getUserLanguage(userId);
    return userLang || 'fa'; // default to Farsi
  } catch (error) {
    console.error('Error fetching user language:', error);
    return 'fa'; // fallback to Farsi
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
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
    this.monitoredChannels = new Map();
    this.setupCommandHandlers();
  }

  t(lang) { 
    return STRINGS[lang] || STRINGS.fa; 
  }

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
      const chatId = msg.chat.id; 
      const userId = msg.from.id; 
      const lang = await getUserLanguage(userId); 
      const s = this.t(lang);
      await this.bot.sendMessage(chatId, s.help, { 
        reply_markup: { inline_keyboard: [[{ text: s.open_panel, web_app: { url: WEBAPP_URL } }]] } 
      });
    });

    this.bot.onText(/\/status/, async (msg) => {
      const chatId = msg.chat.id; 
      const userId = msg.from.id; 
      const lang = await getUserLanguage(userId); 
      const s = this.t(lang);
      await this.bot.sendMessage(chatId, s.status, { 
        reply_markup: { inline_keyboard: [[{ text: s.open_panel, web_app: { url: WEBAPP_URL } }]] } 
      });
    });

    this.bot.onText(/\/webapp/, async (msg) => {
      const chatId = msg.chat.id; 
      const userId = msg.from.id; 
      const lang = await getUserLanguage(userId); 
      const s = this.t(lang);
      await this.bot.sendMessage(chatId, s.open_panel, { 
        reply_markup: { inline_keyboard: [[{ text: s.open_panel, web_app: { url: WEBAPP_URL } }]] } 
      });
    });

    this.bot.onText(/\/(language|lang)/, async (msg) => {
      const chatId = msg.chat.id; 
      const userId = msg.from.id; 
      const lang = await getUserLanguage(userId); 
      const s = this.t(lang);
      await this.bot.sendMessage(chatId, s.language_current, { 
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

    this.bot.on('message', async (msg) => {
      const channelInfo = this.monitoredChannels.get(msg.chat.id.toString());
      if (channelInfo) { 
        await this.processMessage(msg, channelInfo.userId, channelInfo.channelId); 
        return; 
      }
      
      if (msg.text && msg.text.startsWith('/')) {
        const known = ['/start', '/help', '/status', '/webapp', '/language', '/lang'];
        if (known.some(k => msg.text.startsWith(k))) return;
        
        const lang = await getUserLanguage(msg.from.id); 
        const s = this.t(lang);
        await this.bot.sendMessage(msg.chat.id, s.unknown(msg.text), { 
          reply_markup: { inline_keyboard: [[{ text: s.open_panel, web_app: { url: WEBAPP_URL } }]] } 
        });
      }
    });
  }

  async initialize() {
    try {
      const botInfo = await this.bot.getMe();
      console.log(`Telegram bot connected: @${botInfo.username}`);
      
      try {
        await this.bot.setChatMenuButton({ 
          menu_button: { 
            type: 'web_app', 
            text: 'Open Panel', 
            web_app: { url: WEBAPP_URL } 
          } 
        });
      } catch (e) { 
        console.error('Failed to set menu button:', e); 
      }
      
      let channels = []; 
      try { 
        channels = await ChannelService.getActiveChannelsByPlatform('telegram'); 
      } catch (e) { 
        console.error('Error fetching channels:', e); 
      }
      
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

  async processMessage(msg, userId, channelId) {
    try {
      if (!msg.text && !msg.photo && !msg.video && !msg.document) {
        return; // Skip messages without content
      }

      console.log(`Processing message from channel ${channelId} for user ${userId}`);
      
      // Check for keywords
      const keywords = await KeywordService.getKeywordsByChannelId(channelId);
      let shouldForward = keywords.length === 0; // Forward all if no keywords
      
      if (keywords.length > 0 && msg.text) {
        const messageText = msg.text.toLowerCase();
        shouldForward = keywords.some(keyword => 
          messageText.includes(keyword.keyword.toLowerCase())
        );
      }

      if (shouldForward) {
        // Check for duplicates
        const isDuplicate = await checkDuplicate(msg, channelId);
        if (!isDuplicate) {
          // Get destinations for this channel
          const destinations = await DestinationService.getDestinationsByChannelId(channelId);
          
          for (const dest of destinations) {
            await forwardMessage(msg, dest, this.bot);
            
            // Log the forwarding
            await LoggingService.logForwarding({
              user_id: userId,
              channel_id: channelId,
              destination_id: dest.id,
              message_type: msg.photo ? 'photo' : msg.video ? 'video' : msg.document ? 'document' : 'text',
              success: true
            });
          }
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Log the error
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

  async sendMessage(chatId, text, options = {}) {
    try {
      return await this.bot.sendMessage(chatId, text, options);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
}

module.exports = TelegramMonitor;