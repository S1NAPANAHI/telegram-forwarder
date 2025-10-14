const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const KeywordService = require('../services/KeywordService');
const LoggingService = require('../services/LoggingService');
const ChannelService = require('../services/ChannelService');
const UserService = require('../services/UserService');
const { forwardMessage, checkDuplicate } = require('../services/forwardingService');
const puppeteerConfig = require('../config/puppeteer');
const fs = require('fs');

puppeteer.use(StealthPlugin());

class EitaaMonitor {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isLoggedIn = false;
    this.channelIntervals = new Map();
    this.isDisabled = false; // Add this to disable Eitaa if Chrome unavailable
  }

  async initialize() {
    try {
      // Check if Chrome is available
      if (process.env.NODE_ENV === 'production') {
        const chromePaths = [
          '/usr/bin/google-chrome',
          '/usr/bin/chromium-browser',
          '/usr/bin/chromium'
        ];
        
        let chromeAvailable = false;
        for (const path of chromePaths) {
          if (fs.existsSync(path)) {
            chromeAvailable = true;
            break;
          }
        }
        
        if (!chromeAvailable) {
          console.log('Chrome not available in production environment. Disabling Eitaa monitoring.');
          this.isDisabled = true;
          return;
        }
      }
      
      this.browser = await puppeteer.launch(puppeteerConfig);
      this.page = await this.browser.newPage();
      
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      console.log('Eitaa monitor initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Eitaa monitor:', error.message);
      console.log('Falling back to system Chrome detection');
      this.isDisabled = true;
    }
  }

  async monitorChannel(channel) {
    if (this.isDisabled) {
      console.log(`Eitaa monitoring disabled - skipping channel ${channel.channel_url}`);
      return;
    }
    
    try {
      if (!this.isLoggedIn) {
        await this.login(channel.credentials, channel.user_id);
      }

      const channelUrl = `https://eitaa.com/${channel.channel_url}`;
      await this.page.goto(channelUrl, { waitUntil: 'networkidle2' });

      await this.startMessagePolling(channel);
    } catch (error) {
      console.error(`Error monitoring Eitaa channel ${channel.channel_url}:`, error);
    }
  }

  async startMessagePolling(channel) {
    let lastMessageId = null;

    const intervalId = setInterval(async () => {
      try {
        const messages = await this.page.evaluate(() => {
          const messageElements = document.querySelectorAll('.message');
          return Array.from(messageElements).map(el => ({
            id: el.getAttribute('data-message-id'),
            text: el.querySelector('.message-text')?.innerText || '',
            timestamp: el.querySelector('.message-time')?.innerText || ''
          }));
        });

        const latestMessage = messages[0];
        if (latestMessage && latestMessage.id !== lastMessageId) {
          lastMessageId = latestMessage.id;
          await this.processNewMessage(latestMessage, channel);
        }
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    }, 5000);

    this.channelIntervals.set(channel.id, intervalId);
  }

  async stopMonitoringChannel(channelId) {
    if (this.channelIntervals.has(channelId)) {
      clearInterval(this.channelIntervals.get(channelId));
      this.channelIntervals.delete(channelId);
      console.log(`Stopped monitoring Eitaa channel ID: ${channelId}`);

      const channel = await ChannelService.getChannelById(null, channelId); 
      if (channel) {
        await ChannelService.toggleChannel(channel.user_id, channelId, false);
      }
    }
  }

  async processNewMessage(message, channel) {
    let logEntry;
    try {
      const keywords = await KeywordService.getUserKeywords(channel.user_id);

      for (const keywordObj of keywords) {
        if (this.isKeywordMatch(message.text, keywordObj)) {
          const isDuplicate = await checkDuplicate(
            channel.user_id,
            keywordObj.id,
            message.text
          );
          if (!isDuplicate) {
            logEntry = await LoggingService.logMessage({
              userId: channel.user_id,
              keywordId: keywordObj.id,
              channelId: channel.id,
              originalMessageId: message.id,
              originalMessageText: message.text,
              matchedText: message.text,
              status: 'pending'
            });
            await forwardMessage({ ...message, logId: logEntry.id }, { ...channel, chat_id: channel.channel_url }, keywordObj);
          }
          break;
        }
      }
    } catch (error) {
      if (logEntry) {
        await LoggingService.updateLogStatus(logEntry.id, 'failed');
      }
      console.error('Error processing Eitaa message:', error);
    }
  }

  async login(credentials, userId) {
    await this.page.goto('https://eitaa.com/login', { waitUntil: 'networkidle2' });
    
    await this.page.type('input[name="phone"]', credentials.phone);
    await this.page.click('button[type="submit"]');
    
    console.log('A verification code has been sent to your Eitaa account.');
    console.log('Please enter the code in the browser window that Puppeteer has opened.');
    console.log('You have 30 seconds to enter the code.');
    await this.page.waitForSelector('input[name="code"]', { timeout: 30000 });
    
    console.log('Login successful!');
    this.isLoggedIn = true;
    await UserService.updateLastActive(userId);
  }

  isKeywordMatch(text, keywordObj) {
    let searchText = text;
    let searchKeyword = keywordObj.keyword;

    if (!keywordObj.case_sensitive) {
      searchText = searchText.toLowerCase();
      searchKeyword = searchKeyword.toLowerCase();
    }

    if (keywordObj.exact_match) {
      return searchText === searchKeyword;
    } else {
      return searchText.includes(searchKeyword);
    }
  }
}

module.exports = EitaaMonitor;