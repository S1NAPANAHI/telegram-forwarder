const TelegramBot = require('node-telegram-bot-api');
const UserService = require('../services/UserService');
const KeywordService = require('../services/KeywordService');
const ChannelService = require('../services/ChannelService');
const DestinationService = require('../services/DestinationService');
const LoggingService = require('../services/LoggingService');
const { forwardMessage, checkDuplicate } = require('../services/forwardingService');

const STRINGS = {
  fa: {
    welcome: '🤖 به ربات پایش کلمات کلیدی خوش آمدید!\n\nاین ربات کانال‌ها را پایش می‌کند و پیام‌های حاوی کلیدواژه‌های شما را فوروارد می‌کند.\n\nبرای شروع، روی دکمه زیر بزنید:',
    help: '📖 راهنما:\n\n۱) از طریق پنل وب، کلمات کلیدی و کانال‌ها را مدیریت کنید\n۲) کلیدواژه‌ها را اضافه کنید\n۳) کانال‌ها را اضافه کنید\n۴) مقصد فوروارد را مشخص کنید',
    status: '📊 وضعیت ربات: فعال\n\n✅ پایش تلگرام: روشن\n🌐 پنل وب: در دسترس',
    open_panel: '🚀 ورود به پنل مدیریت',
    language_current: '🌐 زبان فعلی: فارسی\nلطفاً زبان خود را انتخاب کنید:',
    language_set_fa: '✅ زبان شما روی فارسی تنظیم شد.',
    language_set_en: '✅ زبان شما روی English تنظیم شد.',
    unknown: (cmd) => `❓ دستور ناشناخته: ${cmd}\n\nبرای مدیریت، دکمه زیر را بزنید:`
  },
  en: {
    welcome: '🤖 Welcome to the Keyword Monitor Bot!\n\nThis bot monitors channels and forwards messages containing your keywords.\n\nTo get started, tap the button below:',
    help: '📖 Help:\n\n1) Use the web panel to manage keywords and channels\n2) Add keywords\n3) Add channels\n4) Set forwarding destinations',
    status: '📊 Bot Status: Active\n\n✅ Telegram monitoring: Enabled\n🌐 Web interface: Available',
    open_panel: '🚀 Open Admin Panel',
    language_current: '🌐 Current language: English\nPlease select your language:',
    language_set_fa: '✅ Your language has been set to فارسی.',
    language_set_en: '✅ Your language has been set to English.',
    unknown: (cmd) => `❓ Unknown command: ${cmd}\n\nUse the button below to manage:`
  }
};

async function getUserLanguage(userId) {
  try {
    const user = await UserService.getUserByTelegramId(String(userId));
    return (user && user.language) || 'fa';
  } catch {
    return 'fa';
  }
}

async function setUserLanguage(userId, lang) {
  try {
    await UserService.updateUserByTelegramId(String(userId), { language: lang });
  } catch (e) {
    console.error('Failed to set language', e);
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
    // /start
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      const lang = await getUserLanguage(userId);
      const s = this.t(lang);
      const webAppUrl = 'https://frontend-service-51uy.onrender.com/webapp';

      await this.bot.sendMessage(chatId, s.welcome, {
        reply_markup: { inline_keyboard: [[{ text: s.open_panel, web_app: { url: webAppUrl } }]] }
      });
    });

    // /help
    this.bot.onText(/\/help/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      const lang = await getUserLanguage(userId);
      const s = this.t(lang);
      const webAppUrl = 'https://frontend-service-51uy.onrender.com/webapp';

      await this.bot.sendMessage(chatId, s.help, {
        reply_markup: { inline_keyboard: [[{ text: s.open_panel, web_app: { url: webAppUrl } }]] }
      });
    });

    // /status
    this.bot.onText(/\/status/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      const lang = await getUserLanguage(userId);
      const s = this.t(lang);
      const webAppUrl = 'https://frontend-service-51uy.onrender.com/webapp';

      await this.bot.sendMessage(chatId, s.status, {
        reply_markup: { inline_keyboard: [[{ text: s.open_panel, web_app: { url: webAppUrl } }]] }
      });
    });

    // /webapp
    this.bot.onText(/\/webapp/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      const lang = await getUserLanguage(userId);
      const s = this.t(lang);
      const webAppUrl = 'https://frontend-service-51uy.onrender.com/webapp';

      await this.bot.sendMessage(chatId, s.open_panel, {
        reply_markup: { inline_keyboard: [[{ text: s.open_panel, web_app: { url: webAppUrl } }]] }
      });
    });

    // /language
    this.bot.onText(/\/(language|lang)/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      const lang = await getUserLanguage(userId);
      const s = this.t(lang);

      await this.bot.sendMessage(chatId, s.language_current, {
        reply_markup: {
          inline_keyboard: [[
            { text: 'فارسی', callback_data: 'set_lang_fa' },
            { text: 'English', callback_data: 'set_lang_en' }
          ]]
        }
      });
    });

    // Callback for language change
    this.bot.on('callback_query', async (query) => {
      try {
        const userId = query.from.id;
        const data = query.data || '';
        if (data === 'set_lang_fa') {
          await setUserLanguage(userId, 'fa');
          await this.bot.answerCallbackQuery(query.id, { text: 'زبان به فارسی تغییر کرد' });
          await this.bot.editMessageText(STRINGS.fa.language_set_fa, { chat_id: query.message.chat.id, message_id: query.message.message_id });
        } else if (data === 'set_lang_en') {
          await setUserLanguage(userId, 'en');
          await this.bot.answerCallbackQuery(query.id, { text: 'Language changed to English' });
          await this.bot.editMessageText(STRINGS.en.language_set_en, { chat_id: query.message.chat.id, message_id: query.message.message_id });
        }
      } catch (e) {
        console.error('Language switch error', e);
      }
    });

    // Unknown commands/messages
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
        const webAppUrl = 'https://frontend-service-51uy.onrender.com/webapp';
        await this.bot.sendMessage(msg.chat.id, s.unknown(msg.text), {
          reply_markup: { inline_keyboard: [[{ text: s.open_panel, web_app: { url: webAppUrl } }]] }
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
          menu_button: { type: 'web_app', text: 'Open Panel', web_app: { url: 'https://frontend-service-51uy.onrender.com/webapp' } }
        });
      } catch (e) { console.error('Failed to set menu button:', e); }

      let channels = [];
      try { channels = await ChannelService.getActiveChannelsByPlatform('telegram'); } catch (e) { console.error('Error fetching channels:', e); }
      for (const channel of channels) await this.startMonitoringChannel(channel);
      console.log('Telegram Monitor initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Telegram Monitor:', error);
    }
  }

  // ... rest of class unchanged ...

  async startMonitoringChannel(channel) {
    try {
      const chatId = await this.resolveChatId(channel.channel_url);
      this.monitoredChannels.set(chatId, { channelId: channel.id, userId: channel.user_id });
      console.log(`Started monitoring Telegram channel: ${channel.channel_name}`);
    } catch (error) { console.error(`Failed to monitor channel ${channel.channel_name}:`, error); }
  }

  async processMessage(msg, userId, channelId) {
    try {
      const messageText = this.extractMessageText(msg);
      if (!messageText) return;
      const keywords = await KeywordService.getUserKeywords(userId);
      for (const keywordObj of keywords) {
        if (this.isKeywordMatch(messageText, keywordObj)) {
          const isDuplicate = await checkDuplicate(userId, keywordObj.id, messageText);
          if (!isDuplicate) await this.forwardMatchedMessage(msg, userId, keywordObj, channelId);
          break;
        }
      }
    } catch (error) { console.error('Error processing message:', error); }
  }

  extractMessageText(msg) { if (msg.text) return msg.text; if (msg.caption) return msg.caption; return null; }
  isKeywordMatch(text, keywordObj) { let t=text, k=keywordObj.keyword; if (!keywordObj.case_sensitive){ t=t.toLowerCase(); k=k.toLowerCase(); } return keywordObj.exact_match ? t===k : t.includes(k); }

  async forwardMatchedMessage(msg, userId, keywordObj, channelId) {
    let logEntry; try {
      logEntry = await LoggingService.logMessage({ userId, keywordId: keywordObj.id, channelId, originalMessageId: msg.message_id.toString(), originalMessageText: this.extractMessageText(msg), matchedText: keywordObj.keyword, status: 'pending' });
      const destinations = await DestinationService.getUserDestinations(userId);
      for (const destination of destinations) { try { await forwardMessage({ ...msg, logId: logEntry.id }, destination, keywordObj); } catch (e) { console.error(`Error forwarding to destination ${destination.name}:`, e); } }
      await LoggingService.updateLogStatus(logEntry.id, 'processed');
    } catch (error) { if (logEntry) await LoggingService.updateLogStatus(logEntry.id, 'failed'); console.error('Error forwarding message:', error); }
  }

  getChannelId(chatId) { const info=this.monitoredChannels.get(chatId.toString()); return info?info.channelId:null; }
  async stopMonitoringChannel(channelId){ let rm=null; for (const [chatId,info] of this.monitoredChannels.entries()){ if(info.channelId===channelId){ rm=chatId; break; } } if(rm){ this.monitoredChannels.delete(rm); console.log(`Stopped monitoring Telegram channel ID: ${channelId}`); try{ const channel=await ChannelService.getChannelById(null,channelId); if(channel){ await ChannelService.toggleChannel(channel.user_id, channelId, false);} }catch(e){ console.error('Error stopping channel monitoring:', e);} } }
  async resolveChatId(channelUrl){ try{ if(!isNaN(channelUrl)) return channelUrl; const chat=await this.bot.getChat(channelUrl.startsWith('@')?channelUrl:`@${channelUrl}`); return chat.id.toString(); }catch(e){ console.error(`Could not resolve chat ID for ${channelUrl}:`, e.message); throw new Error(`Could not resolve chat ID for ${channelUrl}`);} }
}

module.exports = TelegramMonitor;