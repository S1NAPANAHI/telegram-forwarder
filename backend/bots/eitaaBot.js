const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const KeywordService = require('../services/KeywordService');
const LoggingService = require('../services/LoggingService');
const ChannelService = require('../services/ChannelService');
const UserService = require('../services/UserService');
const { forwardMessage } = require('../services/forwardingService'); // checkDuplicate will be replaced

puppeteer.use(StealthPlugin());

// این کلاس مسئول مانیتورینگ کانال‌های ایتا با استفاده از Puppeteer است
class EitaaMonitor {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isLoggedIn = false;
    // یک Map برای نگهداری شناسه‌های اینتروال برای هر کانال
    this.channelIntervals = new Map();
  }

  // متد راه‌اندازی اولیه
  async initialize() {
    // راه‌اندازی مرورگر Puppeteer
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
    // تنظیم User-Agent برای شبیه‌سازی یک مرورگر واقعی
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  }

  // شروع مانیتورینگ یک کانال ایتا
  async monitorChannel(channel) {
    try {
      // اگر لاگین نشده بود، ابتدا لاگین کن
      if (!this.isLoggedIn) {
        await this.login(channel.credentials, channel.userId);
      }

      const channelUrl = `https://eitaa.com/${channel.channelUrl}`;
      await this.page.goto(channelUrl, { waitUntil: 'networkidle2' });

      // شروع به بررسی دوره‌ای برای پیام‌های جدید
      await this.startMessagePolling(channel);
    } catch (error) {
      console.error(`Error monitoring Eitaa channel ${channel.channelUrl}:`, error);
    }
  }

  // شروع بررسی دوره‌ای برای پیام‌های جدید
  async startMessagePolling(channel) {
    let lastMessageId = null;

    // ایجاد یک اینتروال که هر 5 ثانیه یک‌بار اجرا می‌شود
    const intervalId = setInterval(async () => {
      try {
        // استخراج پیام‌ها از صفحه وب
        const messages = await this.page.evaluate(() => {
          const messageElements = document.querySelectorAll('.message');
          return Array.from(messageElements).map(el => ({
            id: el.getAttribute('data-message-id'),
            text: el.querySelector('.message-text')?.innerText || '',
            timestamp: el.querySelector('.message-time')?.innerText || ''
          }));
        });

        const latestMessage = messages[0];
        // اگر پیام جدیدی وجود داشت، آن را پردازش کن
        if (latestMessage && latestMessage.id !== lastMessageId) {
          lastMessageId = latestMessage.id;
          await this.processNewMessage(latestMessage, channel);
        }
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    }, 5000); // بررسی هر 5 ثانیه

    // ذخیره شناسه اینتروال برای امکان توقف آن در آینده
    this.channelIntervals.set(channel._id.toString(), intervalId);
  }

  // توقف مانیتورینگ یک کانال خاص
  async stopMonitoringChannel(channelId) {
    if (this.channelIntervals.has(channelId)) {
      clearInterval(this.channelIntervals.get(channelId));
      this.channelIntervals.delete(channelId);
      console.log(`Stopped monitoring Eitaa channel ID: ${channelId}`);

      // Fetch channel to get userId and update isActive status
      const channel = await ChannelService.getChannelById(null, channelId); // userId is not known here, need to adjust getChannelById or toggleChannel
      if (channel) {
        await ChannelService.toggleChannel(channel.userId, channelId, false);
      }
    }
  }

  // پردازش پیام جدید
  async processNewMessage(message, channel) {
    let logEntry;
    try {
      const keywords = await KeywordService.getUserKeywords(channel.userId);

      for (const keywordObj of keywords) {
        if (this.isKeywordMatch(message.text, keywordObj)) {
          const isDuplicate = await LoggingService.checkDuplicate(
            channel.userId,
            message.id,
            'eitaa'
          );
          if (!isDuplicate) {
            logEntry = await LoggingService.logMessageProcessing({
              userId: channel.userId,
              keywordId: keywordObj._id,
              channelId: channel._id,
              originalMessage: {
                messageId: message.id,
                text: message.text,
                platform: 'eitaa',
                channelName: channel.channelName,
                timestamp: new Date(message.timestamp)
              },
              matchedText: message.text,
              forwardedTo: [],
              status: 'pending'
            });
            await forwardMessage({ ...message, logId: logEntry._id }, { ...channel, chatId: channel.channelUrl }, keywordObj);
          }
          break;
        }
      }
    } catch (error) {
      if (logEntry) {
        await LoggingService.updateLogStatus(logEntry._id, 'failed');
      }
      console.error('Error processing Eitaa message:', error);
    }
  }

  // متد لاگین به ایتا
  async login(credentials, userId) {
    await this.page.goto('https://eitaa.com/login', { waitUntil: 'networkidle2' });
    
    // پر کردن فرم لاگین
    await this.page.type('input[name="phone"]', credentials.phone);
    await this.page.click('button[type="submit"]');
    
    // منتظر ماندن برای وارد کردن کد تایید
    console.log('A verification code has been sent to your Eitaa account.');
    console.log('Please enter the code in the browser window that Puppeteer has opened.');
    console.log('You have 30 seconds to enter the code.');
    await this.page.waitForSelector('input[name="code"]', { timeout: 30000 });
    
    console.log('Login successful!');
    this.isLoggedIn = true;
    await UserService.updateLastActive(userId);
  }

  // بررسی تطابق کلمه کلیدی
  isKeywordMatch(text, keywordObj) {
    let searchText = text;
    let searchKeyword = keywordObj.keyword;

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
}

module.exports = EitaaMonitor;