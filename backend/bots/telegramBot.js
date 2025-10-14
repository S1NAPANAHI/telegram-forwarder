const TelegramBot = require('node-telegram-bot-api');
const UserService = require('../services/UserService');
const KeywordService = require('../services/KeywordService');
const ChannelService = require('../services/ChannelService');
const DestinationService = require('../services/DestinationService');
const LoggingService = require('../services/LoggingService');
const { forwardMessage } = require('../services/forwardingService');

// این کلاس مسئول مانیتورینگ کانال‌های تلگرام است
class TelegramMonitor {
  constructor() {
    // نمونه‌سازی از ربات تلگرام با توکن از متغیرهای محیطی
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
      polling: true
    });
    // یک Map برای نگهداری کانال‌های در حال مانیتور
    this.monitoredChannels = new Map();
  }

  // متد راه‌اندازی اولیه
  async initialize() {
    // بارگذاری تمام کانال‌های تلگرام فعال از پایگاه داده
    const channels = await ChannelService.getActiveChannelsByPlatform('telegram');
    
    for (const channel of channels) {
      await this.startMonitoringChannel(channel);
    }

    // گوش دادن به پیام‌های جدید
    this.bot.on('message', async (msg) => {
      // بررسی اینکه آیا پیام از یکی از کانال‌های مانیتور شده است یا خیر
      const channelInfo = this.monitoredChannels.get(msg.chat.id.toString());
      if (channelInfo) {
        // اگر بود، پیام را پردازش کن
        await this.processMessage(msg, channelInfo.userId);
      }
    });
  }

  // شروع مانیتورینگ یک کانال خاص
  async startMonitoringChannel(channel) {
    try {
      // تبدیل URL کانال به شناسه چت عددی
      const chatId = await this.resolveChatId(channel.channelUrl);
      
      // اضافه کردن کانال به لیست کانال‌های مانیتور شده
      this.monitoredChannels.set(chatId, {
        channelId: channel._id,
        userId: channel.userId
      });

      console.log(`Started monitoring Telegram channel: ${channel.channelName}`);
    } catch (error) {
      console.error(`Failed to monitor channel ${channel.channelName}:`, error);
    }
  }

  // پردازش پیام دریافت شده
  async processMessage(msg, userId) {
    try {
      const messageText = this.extractMessageText(msg);
      if (!messageText) return;

      // دریافت کلمات کلیدی فعال کاربر
      const keywords = await KeywordService.getUserKeywords(userId);

      // بررسی تطابق با کلمات کلیدی
      for (const keywordObj of keywords) {
        if (this.isKeywordMatch(messageText, keywordObj)) {
          // بررسی اینکه آیا پیام تکراری است یا خیر
          const isDuplicate = await LoggingService.checkDuplicate(
            userId,
            msg.message_id.toString(),
            'telegram'
          );
          
          if (!isDuplicate) {
            // اگر تکراری نبود، پیام را فوروارد کن
            await this.forwardMatchedMessage(msg, userId, keywordObj);
          }
          break; // توقف پس از اولین تطابق
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }

  // استخراج متن پیام
  extractMessageText(msg) {
    if (msg.text) return msg.text;
    if (msg.caption) return msg.caption;
    return null;
  }

  // بررسی تطابق کلمه کلیدی
  isKeywordMatch(text, keywordObj) {
    let searchText = text;
    let searchKeyword = keywordObj.keyword;

    // اگر حساس به حروف بزرگ و کوچک نبود، هر دو را به حروف کوچک تبدیل کن
    if (!keywordObj.caseSensitive) {
      searchText = searchText.toLowerCase();
      searchKeyword = searchKeyword.toLowerCase();
    }

    if (keywordObj.exactMatch) {
      return searchText === searchKeyword;
    } else {
      return searchText.includes(searchKeyword);
    }
  }

  // فوروارد کردن پیام تطابق یافته
  async forwardMatchedMessage(msg, userId, keywordObj) {
    let logEntry;
    try {
      // ابتدا یک لاگ با وضعیت 'pending' ایجاد کن
      logEntry = await LoggingService.logMessageProcessing({
        userId,
        keywordId: keywordObj._id,
        channelId: this.getChannelId(msg.chat.id),
        originalMessage: {
          messageId: msg.message_id.toString(),
          text: this.extractMessageText(msg),
          platform: 'telegram',
          channelName: msg.chat.title || msg.chat.username || msg.chat.id.toString(),
          timestamp: new Date(msg.date * 1000)
        },
        matchedText: keywordObj.keyword,
        forwardedTo: [],
        status: 'pending'
      });

      // دریافت مقصدهای فعال کاربر
      const destinations = await DestinationService.getUserDestinations(userId);

      const forwardResults = [];
      for (const destination of destinations) {
        try {
          await forwardMessage({ ...msg, logId: logEntry._id }, destination, keywordObj);
          forwardResults.push({
            destinationId: destination._id,
            status: 'success',
            timestamp: new Date()
          });
        } catch (error) {
          forwardResults.push({
            destinationId: destination._id,
            status: 'failed',
            error: error.message,
            timestamp: new Date()
          });
          console.error(`Error forwarding to destination ${destination.name}:`, error);
        }
      }

      // اگر مقصدی وجود نداشت، وضعیت لاگ را به 'success' تغییر بده
      if (destinations.length === 0) {
        await LoggingService.updateLogStatus(logEntry._id, 'success');
      } else {
        // Update log entry with actual forward results
        await LoggingService.updateLogEntry(logEntry._id, { forwardedTo: forwardResults, status: 'processed' });
      }

    } catch (error) {
      // در صورت بروز خطا، وضعیت لاگ را به 'failed' تغییر بده
      if (logEntry) {
        await LoggingService.updateLogStatus(logEntry._id, 'failed');
      }
      console.error('Error forwarding message:', error);
    }
  }

  // ثبت لاگ (این متد حذف خواهد شد)
  // async logAction(userId, keywordId, msg, status) {
  //   const Log = require('../models/Log');
  //   const newLog = await Log.create({
  //     userId,
  //     keywordId,
  //     channelId: this.getChannelId(msg.chat.id),
  //     message: this.extractMessageText(msg),
  //     matchedText: msg.text || msg.caption,
  //     forwardedTo: [],
  //     timestamp: new Date(),
  //     status
  //   });
  //   return newLog;
  // }

  // دریافت شناسه کانال از شناسه چت
  getChannelId(chatId) {
    const channelInfo = this.monitoredChannels.get(chatId.toString());
    return channelInfo ? channelInfo.channelId : null;
  }

  // توقف مانیتورینگ یک کانال خاص
  async stopMonitoringChannel(channelId) {
    let chatIdToRemove = null;
    for (const [chatId, channelInfo] of this.monitoredChannels.entries()) {
      if (channelInfo.channelId.toString() === channelId) {
        chatIdToRemove = chatId;
        break;
      }
    }
    if (chatIdToRemove) {
      this.monitoredChannels.delete(chatIdToRemove);
      console.log(`Stopped monitoring Telegram channel ID: ${channelId}`);

      // Fetch channel to get userId and update isActive status
      const channel = await ChannelService.getChannelById(null, channelId); // userId is not known here, need to adjust getChannelById or toggleChannel
      if (channel) {
        await ChannelService.toggleChannel(channel.userId, channelId, false);
      }
    }
  }

  // تبدیل URL کانال به شناسه چت
  async resolveChatId(channelUrl) {
    try {
      // اگر URL کانال یک شناسه عددی است، آن را برگردان
      if (!isNaN(channelUrl)) {
        return channelUrl;
      }
      // در غیر این صورت، فرض کن که یک نام کاربری است و آن را به شناسه چت تبدیل کن
      const chat = await this.bot.getChat(channelUrl.startsWith('@') ? channelUrl : `@${channelUrl}`);
      return chat.id.toString();
    } catch (error) {
      console.error(`Could not resolve chat ID for ${channelUrl}:`, error.message);
      throw new Error(`Could not resolve chat ID for ${channelUrl}`);
    }
  }
}

module.exports = TelegramMonitor;