const TelegramBot = require('node-telegram-bot-api');
const UserService = require('../services/UserService');
const KeywordService = require('../services/KeywordService');
const ChannelService = require('../services/ChannelService');
const DestinationService = require('../services/DestinationService');
const LoggingService = require('../services/LoggingService');
const { forwardMessage, checkDuplicate } = require('../services/forwardingService');

const STRINGS = {
  fa: {
    welcome: '🤖 به ربات پیشرفته پایش کلمات کلیدی خوش آمدید!\n\n✨ امکانات ربات:\n📊 پایش هوشمند کانال‌ها\n🔍 تشخیص کلمات کلیدی\n📱 پنل مدیریت وب\n🚀 فوروارد خودکار پیام‌ها\n\nبرای شروع، یکی از گزینه‌های زیر را انتخاب کنید:',
    main_menu: '📋 منوی اصلی\n\nلطفاً یکی از گزینه‌های زیر را انتخاب کنید:',
    help: '📖 راهنمای کامل\n\n🔸 مدیریت کلمات کلیدی:\nکلمات مورد نظر خود را اضافه کنید تا ربات پیام‌های حاوی آن‌ها را شناسایی کند\n\n🔸 مدیریت کانال‌ها:\nکانال‌هایی که باید پایش شوند را اضافه کنید\n\n🔸 تنظیم مقصد:\nمشخص کنید پیام‌ها به کجا فرستاده شوند\n\n🔸 گزارش‌ها:\nآمار و گزارش‌های عملکرد را مشاهده کنید',
    status: (stats) => `📊 وضعیت سیستم\n\n🟢 ربات: فعال\n📈 کانال‌های پایش شده: ${stats.channels}\n🔑 کلمات کلیدی: ${stats.keywords}\n📤 مقاصد: ${stats.destinations}\n📋 پیام‌های امروز: ${stats.todayMessages}\n\n⏰ آخرین به‌روزرسانی: ${new Date().toLocaleString('fa-IR')}',
    keywords_menu: '🔑 مدیریت کلمات کلیدی\n\nاز طریق این بخش می‌توانید کلمات کلیدی خود را مدیریت کنید:',
    channels_menu: '📺 مدیریت کانال‌ها\n\nکانال‌هایی که باید پایش شوند:',
    settings_menu: '⚙️ تنظیمات\n\nتنظیمات عمومی ربات:',
    language_fa: 'فارسی 🇮🇷',
    language_en: 'English 🇺🇸',
    btn_open_panel: '🌐 پنل مدیریت',
    btn_keywords: '🔑 کلمات کلیدی',
    btn_channels: '📺 کانال‌ها',
    btn_destinations: '📤 مقاصد',
    btn_reports: '📊 گزارش‌ها',
    btn_settings: '⚙️ تنظیمات',
    btn_help: '❓ راهنما',
    btn_status: '🔍 وضعیت سیستم',
    btn_back: '🔙 بازگشت',
    btn_language: '🌐 تغییر زبان',
    btn_notifications: '🔔 اعلان‌ها',
    language_set: 'زبان شما به فارسی تغییر یافت ✅',
    notifications_on: '🔔 اعلان‌ها فعال شد',
    notifications_off: '🔕 اعلان‌ها غیرفعال شد',
    unauthorized: '❌ شما مجاز به استفاده از این ربات نیستید.\n\nابتدا در پنل وب ثبت‌نام کنید.',
    error: 'خطایی رخ داد. لطفاً دوباره تلاش کنید.',
  },
  en: {
    welcome: '🤖 Welcome to Advanced Keyword Monitor Bot!\n\n✨ Bot Features:\n📊 Smart channel monitoring\n🔍 Keyword detection\n📱 Web management panel\n🚀 Automatic message forwarding\n\nTo get started, choose one of the options below:',
    main_menu: '📋 Main Menu\n\nPlease select one of the options below:',
    help: '📖 Complete Guide\n\n🔸 Keyword Management:\nAdd your desired keywords so the bot can identify messages containing them\n\n🔸 Channel Management:\nAdd channels that should be monitored\n\n🔸 Destination Setup:\nSpecify where messages should be forwarded\n\n🔸 Reports:\nView performance statistics and reports',
    status: (stats) => `📊 System Status\n\n🟢 Bot: Active\n📈 Monitored Channels: ${stats.channels}\n🔑 Keywords: ${stats.keywords}\n📤 Destinations: ${stats.destinations}\n📋 Today's Messages: ${stats.todayMessages}\n\n⏰ Last Update: ${new Date().toLocaleString('en-US')}`,
    keywords_menu: '🔑 Keyword Management\n\nFrom this section you can manage your keywords:',
    channels_menu: '📺 Channel Management\n\nChannels to be monitored:',
    settings_menu: '⚙️ Settings\n\nGeneral bot settings:',
    language_fa: 'فارسی 🇮🇷',
    language_en: 'English 🇺🇸',
    btn_open_panel: '🌐 Management Panel',
    btn_keywords: '🔑 Keywords',
    btn_channels: '📺 Channels',
    btn_destinations: '📤 Destinations',
    btn_reports: '📊 Reports',
    btn_settings: '⚙️ Settings',
    btn_help: '❓ Help',
    btn_status: '🔍 System Status',
    btn_back: '🔙 Back',
    btn_language: '🌐 Change Language',
    btn_notifications: '🔔 Notifications',
    language_set: 'Your language has been changed to English ✅',
    notifications_on: '🔔 Notifications enabled',
    notifications_off: '🔕 Notifications disabled',
    unauthorized: '❌ You are not authorized to use this bot.\n\nPlease register on the web panel first.',
    error: 'An error occurred. Please try again.',
  }
};

class EnhancedTelegramBot {
  constructor() {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
    this.monitoredChannels = new Map();
    this.userSessions = new Map(); // Track user interaction states
    this.setupHandlers();
  }

  t(lang) {
    return STRINGS[lang] || STRINGS.fa;
  }

  async getUserLanguage(userId) {
    try {
      const user = await UserService.getUserByTelegramId(String(userId));
      return (user && user.language) || 'fa';
    } catch {
      return 'fa';
    }
  }

  async setUserLanguage(userId, lang) {
    try {
      await UserService.updateUserByTelegramId(String(userId), { language: lang });
    } catch (e) {
      console.error('Failed to set language', e);
    }
  }

  async isUserAuthorized(userId) {
    try {
      const user = await UserService.getUserByTelegramId(String(userId));
      return user && user.isActive;
    } catch {
      return false;
    }
  }

  async getUserStats(userId) {
    try {
      const user = await UserService.getUserByTelegramId(String(userId));
      if (!user) return { channels: 0, keywords: 0, destinations: 0, todayMessages: 0 };

      const [channels, keywords, destinations, logs] = await Promise.all([
        ChannelService.getUserChannels(user.id),
        KeywordService.getUserKeywords(user.id),
        DestinationService.getUserDestinations(user.id),
        LoggingService.getTodayLogs(user.id)
      ]);

      return {
        channels: channels?.length || 0,
        keywords: keywords?.length || 0,
        destinations: destinations?.length || 0,
        todayMessages: logs?.length || 0
      };
    } catch (e) {
      console.error('Error getting user stats:', e);
      return { channels: 0, keywords: 0, destinations: 0, todayMessages: 0 };
    }
  }

  getMainMenuKeyboard(lang) {
    const s = this.t(lang);
    return {
      keyboard: [
        [{ text: s.btn_open_panel }, { text: s.btn_status }],
        [{ text: s.btn_keywords }, { text: s.btn_channels }],
        [{ text: s.btn_destinations }, { text: s.btn_reports }],
        [{ text: s.btn_settings }, { text: s.btn_help }]
      ],
      resize_keyboard: true,
      persistent: true
    };
  }

  getSettingsKeyboard(lang) {
    const s = this.t(lang);
    return {
      keyboard: [
        [{ text: s.btn_language }, { text: s.btn_notifications }],
        [{ text: s.btn_back }]
      ],
      resize_keyboard: true
    };
  }

  getLanguageKeyboard() {
    return {
      inline_keyboard: [
        [
          { text: STRINGS.fa.language_fa, callback_data: 'set_lang_fa' },
          { text: STRINGS.en.language_en, callback_data: 'set_lang_en' }
        ]
      ]
    };
  }

  setupHandlers() {
    // /start command
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      
      const isAuthorized = await this.isUserAuthorized(userId);
      const lang = await this.getUserLanguage(userId);
      const s = this.t(lang);

      if (!isAuthorized) {
        const webAppUrl = process.env.FRONTEND_URL || 'https://frontend-service-51uy.onrender.com';
        return this.bot.sendMessage(chatId, s.unauthorized, {
          reply_markup: {
            inline_keyboard: [[
              { text: s.btn_open_panel, url: webAppUrl + '/register' }
            ]]
          }
        });
      }

      await this.bot.sendMessage(chatId, s.welcome, {
        reply_markup: this.getMainMenuKeyboard(lang)
      });
    });

    // Menu button handlers
    this.bot.on('message', async (msg) => {
      if (!msg.text || msg.text.startsWith('/')) return;

      const chatId = msg.chat.id;
      const userId = msg.from.id;
      const text = msg.text;

      // Check if this is a monitored channel message
      const channelInfo = this.monitoredChannels.get(msg.chat.id.toString());
      if (channelInfo) {
        await this.processMessage(msg, channelInfo.userId, channelInfo.channelId);
        return;
      }

      // Check authorization for menu interactions
      const isAuthorized = await this.isUserAuthorized(userId);
      if (!isAuthorized) {
        const lang = await this.getUserLanguage(userId);
        return this.bot.sendMessage(chatId, this.t(lang).unauthorized);
      }

      const lang = await this.getUserLanguage(userId);
      const s = this.t(lang);
      const webAppUrl = process.env.FRONTEND_URL || 'https://frontend-service-51uy.onrender.com';

      try {
        if (text === s.btn_open_panel) {
          await this.bot.sendMessage(chatId, s.btn_open_panel, {
            reply_markup: {
              inline_keyboard: [[
                { text: s.btn_open_panel, web_app: { url: webAppUrl + '/webapp' } }
              ]]
            }
          });
        }
        else if (text === s.btn_status) {
          const stats = await this.getUserStats(userId);
          await this.bot.sendMessage(chatId, s.status(stats));
        }
        else if (text === s.btn_keywords) {
          await this.bot.sendMessage(chatId, s.keywords_menu, {
            reply_markup: {
              inline_keyboard: [[
                { text: s.btn_open_panel, web_app: { url: webAppUrl + '/keywords' } }
              ]]
            }
          });
        }
        else if (text === s.btn_channels) {
          await this.bot.sendMessage(chatId, s.channels_menu, {
            reply_markup: {
              inline_keyboard: [[
                { text: s.btn_open_panel, web_app: { url: webAppUrl + '/channels' } }
              ]]
            }
          });
        }
        else if (text === s.btn_destinations) {
          await this.bot.sendMessage(chatId, 'مدیریت مقاصد', {
            reply_markup: {
              inline_keyboard: [[
                { text: s.btn_open_panel, web_app: { url: webAppUrl + '/destinations' } }
              ]]
            }
          });
        }
        else if (text === s.btn_reports) {
          await this.bot.sendMessage(chatId, 'گزارش‌ها و آمار', {
            reply_markup: {
              inline_keyboard: [[
                { text: s.btn_open_panel, web_app: { url: webAppUrl + '/analytics' } }
              ]]
            }
          });
        }
        else if (text === s.btn_settings) {
          await this.bot.sendMessage(chatId, s.settings_menu, {
            reply_markup: this.getSettingsKeyboard(lang)
          });
        }
        else if (text === s.btn_help) {
          await this.bot.sendMessage(chatId, s.help);
        }
        else if (text === s.btn_language) {
          await this.bot.sendMessage(chatId, 'انتخاب زبان / Choose Language:', {
            reply_markup: this.getLanguageKeyboard()
          });
        }
        else if (text === s.btn_back) {
          await this.bot.sendMessage(chatId, s.main_menu, {
            reply_markup: this.getMainMenuKeyboard(lang)
          });
        }
        else if (text === s.btn_notifications) {
          // Toggle notifications (implement in user settings)
          await this.bot.sendMessage(chatId, s.notifications_on);
        }
      } catch (error) {
        console.error('Error handling menu action:', error);
        await this.bot.sendMessage(chatId, s.error);
      }
    });

    // Callback query handler for language selection
    this.bot.on('callback_query', async (query) => {
      try {
        const userId = query.from.id;
        const data = query.data;

        if (data === 'set_lang_fa') {
          await this.setUserLanguage(userId, 'fa');
          await this.bot.answerCallbackQuery(query.id, { text: 'زبان به فارسی تغییر کرد ✅' });
          await this.bot.editMessageText(STRINGS.fa.language_set, {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id
          });
          // Update keyboard to Persian
          setTimeout(async () => {
            await this.bot.sendMessage(query.message.chat.id, STRINGS.fa.main_menu, {
              reply_markup: this.getMainMenuKeyboard('fa')
            });
          }, 1000);
        }
        else if (data === 'set_lang_en') {
          await this.setUserLanguage(userId, 'en');
          await this.bot.answerCallbackQuery(query.id, { text: 'Language changed to English ✅' });
          await this.bot.editMessageText(STRINGS.en.language_set, {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id
          });
          // Update keyboard to English
          setTimeout(async () => {
            await this.bot.sendMessage(query.message.chat.id, STRINGS.en.main_menu, {
              reply_markup: this.getMainMenuKeyboard('en')
            });
          }, 1000);
        }
      } catch (error) {
        console.error('Error handling callback query:', error);
      }
    });
  }

  async initialize() {
    try {
      const botInfo = await this.bot.getMe();
      console.log(`Enhanced Telegram bot connected: @${botInfo.username}`);

      // Set bot commands
      await this.bot.setMyCommands([
        { command: 'start', description: 'شروع کار با ربات / Start the bot' },
        { command: 'menu', description: 'نمایش منو / Show menu' },
        { command: 'status', description: 'وضعیت سیستم / System status' },
        { command: 'help', description: 'راهنما / Help' }
      ]);

      // Set menu button
      try {
        await this.bot.setChatMenuButton({
          menu_button: {
            type: 'web_app',
            text: 'پنل مدیریت / Admin Panel',
            web_app: { url: (process.env.FRONTEND_URL || 'https://frontend-service-51uy.onrender.com') + '/webapp' }
          }
        });
      } catch (e) {
        console.error('Failed to set menu button:', e);
      }

      // Load and monitor channels
      let channels = [];
      try {
        channels = await ChannelService.getActiveChannelsByPlatform('telegram');
      } catch (e) {
        console.error('Error fetching channels:', e);
      }

      for (const channel of channels) {
        await this.startMonitoringChannel(channel);
      }

      console.log('Enhanced Telegram Monitor initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Enhanced Telegram Monitor:', error);
    }
  }

  // Message processing and forwarding logic (unchanged from original)
  async startMonitoringChannel(channel) {
    try {
      const chatId = await this.resolveChatId(channel.channel_url);
      this.monitoredChannels.set(chatId, { channelId: channel.id, userId: channel.user_id });
      console.log(`Started monitoring Telegram channel: ${channel.channel_name}`);
    } catch (error) {
      console.error(`Failed to monitor channel ${channel.channel_name}:`, error);
    }
  }

  async processMessage(msg, userId, channelId) {
    try {
      const messageText = this.extractMessageText(msg);
      if (!messageText) return;

      const keywords = await KeywordService.getUserKeywords(userId);
      for (const keywordObj of keywords) {
        if (this.isKeywordMatch(messageText, keywordObj)) {
          const isDuplicate = await checkDuplicate(userId, keywordObj.id, messageText);
          if (!isDuplicate) {
            await this.forwardMatchedMessage(msg, userId, keywordObj, channelId);
          }
          break;
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }

  extractMessageText(msg) {
    if (msg.text) return msg.text;
    if (msg.caption) return msg.caption;
    return null;
  }

  isKeywordMatch(text, keywordObj) {
    let t = text, k = keywordObj.keyword;
    if (!keywordObj.case_sensitive) {
      t = t.toLowerCase();
      k = k.toLowerCase();
    }
    return keywordObj.exact_match ? t === k : t.includes(k);
  }

  async forwardMatchedMessage(msg, userId, keywordObj, channelId) {
    let logEntry;
    try {
      logEntry = await LoggingService.logMessage({
        userId,
        keywordId: keywordObj.id,
        channelId,
        originalMessageId: msg.message_id.toString(),
        originalMessageText: this.extractMessageText(msg),
        matchedText: keywordObj.keyword,
        status: 'pending'
      });

      const destinations = await DestinationService.getUserDestinations(userId);
      for (const destination of destinations) {
        try {
          await forwardMessage({ ...msg, logId: logEntry.id }, destination, keywordObj);
        } catch (e) {
          console.error(`Error forwarding to destination ${destination.name}:`, e);
        }
      }

      await LoggingService.updateLogStatus(logEntry.id, 'processed');
    } catch (error) {
      if (logEntry) {
        await LoggingService.updateLogStatus(logEntry.id, 'failed');
      }
      console.error('Error forwarding message:', error);
    }
  }

  async resolveChatId(channelUrl) {
    try {
      if (!isNaN(channelUrl)) return channelUrl;
      const chat = await this.bot.getChat(channelUrl.startsWith('@') ? channelUrl : `@${channelUrl}`);
      return chat.id.toString();
    } catch (e) {
      console.error(`Could not resolve chat ID for ${channelUrl}:`, e.message);
      throw new Error(`Could not resolve chat ID for ${channelUrl}`);
    }
  }

  // Additional helper methods
  getChannelId(chatId) {
    const info = this.monitoredChannels.get(chatId.toString());
    return info ? info.channelId : null;
  }

  async stopMonitoringChannel(channelId) {
    let removeKey = null;
    for (const [chatId, info] of this.monitoredChannels.entries()) {
      if (info.channelId === channelId) {
        removeKey = chatId;
        break;
      }
    }
    if (removeKey) {
      this.monitoredChannels.delete(removeKey);
      console.log(`Stopped monitoring Telegram channel ID: ${channelId}`);
    }
  }
}

module.exports = EnhancedTelegramBot;