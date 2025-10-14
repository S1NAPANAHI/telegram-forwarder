const TelegramBot = require('node-telegram-bot-api');
const UserService = require('../services/UserService');
const KeywordService = require('../services/KeywordService');
const ChannelService = require('../services/ChannelService');
const DestinationService = require('../services/DestinationService');
const LoggingService = require('../services/LoggingService');
const { forwardMessage, checkDuplicate } = require('../services/forwardingService');

class TelegramMonitor {
  constructor() {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
      polling: true
    });
    this.monitoredChannels = new Map();
    
    // Add command handlers
    this.setupCommandHandlers();
  }

  setupCommandHandlers() {
    // Handle /start command
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      
      const welcomeMessage = `🤖 Welcome to Telegram Keyword Bot!

This bot monitors channels and forwards messages containing your keywords.

🚀 Open the admin panel to get started with keyword monitoring and channel management!`;

      const webAppUrl = 'https://frontend-service-51uy.onrender.com/webapp';
      
      await this.bot.sendMessage(chatId, welcomeMessage, {
        reply_markup: {
          inline_keyboard: [[
            {
              text: "🚀 Open Admin Panel",
              web_app: { url: webAppUrl }
            }
          ]]
        }
      });
    });

    // Handle /help command
    this.bot.onText(/\/help/, async (msg) => {
      const chatId = msg.chat.id;
      
      const helpMessage = `📖 How to use this bot:

1. **Web Interface**: Use our web app to manage keywords and channels
2. **Keywords**: Add words or phrases to monitor
3. **Channels**: Add Telegram channels to monitor
4. **Destinations**: Set where to forward matched messages

🚀 Tap the button below to open the admin panel:`;

      const webAppUrl = 'https://frontend-service-51uy.onrender.com/webapp';
      
      await this.bot.sendMessage(chatId, helpMessage, {
        reply_markup: {
          inline_keyboard: [[
            {
              text: "🚀 Open Admin Panel",
              web_app: { url: webAppUrl }
            }
          ]]
        }
      });
    });

    // Handle /status command
    this.bot.onText(/\/status/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      
      try {
        const webAppUrl = 'https://frontend-service-51uy.onrender.com/webapp';
        
        await this.bot.sendMessage(chatId, '📊 Bot Status: Active\n\n✅ Telegram monitoring: Enabled\n🌐 Web interface: Available\n\n🚀 Open the admin panel to set up monitoring:', {
          reply_markup: {
            inline_keyboard: [[
              {
                text: "🚀 Open Admin Panel",
                web_app: { url: webAppUrl }
              }
            ]]
          }
        });
      } catch (error) {
        console.error('Status command error:', error);
        await this.bot.sendMessage(chatId, '❌ Error fetching status. Please try again later.');
      }
    });

    // Handle /webapp command
    this.bot.onText(/\/webapp/, async (msg) => {
      const chatId = msg.chat.id;
      
      const webAppUrl = 'https://frontend-service-51uy.onrender.com/webapp';
      
      await this.bot.sendMessage(chatId, '🚀 Access your admin panel:', {
        reply_markup: {
          inline_keyboard: [[
            {
              text: "🚀 Open Admin Panel",
              web_app: { url: webAppUrl }
            }
          ]]
        }
      });
    });

    // Handle unknown commands and channel messages
    this.bot.on('message', async (msg) => {
      // Skip if it's a channel message being monitored
      const channelInfo = this.monitoredChannels.get(msg.chat.id.toString());
      if (channelInfo) {
        await this.processMessage(msg, channelInfo.userId, channelInfo.channelId);
        return;
      }

      // Skip if it's a known command
      if (msg.text && msg.text.startsWith('/')) {
        const knownCommands = ['/start', '/help', '/status', '/webapp'];
        if (knownCommands.some(cmd => msg.text.startsWith(cmd))) {
          return;
        }
        
        // Unknown command - show help with WebApp button
        const webAppUrl = 'https://frontend-service-51uy.onrender.com/webapp';
        
        await this.bot.sendMessage(msg.chat.id, 
          `❓ Unknown command: ${msg.text}\n\nUse the admin panel to manage your bot:`, {
            reply_markup: {
              inline_keyboard: [[
                {
                  text: "🚀 Open Admin Panel",
                  web_app: { url: webAppUrl }
                }
              ]]
            }
          }
        );
      }
    });
  }

  async initialize() {
    try {
      console.log('Initializing Telegram Monitor...');
      
      // Test bot connection
      const botInfo = await this.bot.getMe();
      console.log(`Telegram bot connected: @${botInfo.username}`);
      
      // Set a persistent menu button for easy access to the web interface
      try {
        await this.bot.setChatMenuButton({
          menu_button: {
            type: 'web_app',
            text: 'Open Panel',
            web_app: {
              url: 'https://frontend-service-51uy.onrender.com/webapp'
            }
          }
        });
        console.log('WebApp menu button set successfully');
      } catch (error) {
        console.error('Failed to set menu button:', error);
      }
      
      // Get active channels (with error handling)
      let channels = [];
      try {
        channels = await ChannelService.getActiveChannelsByPlatform('telegram');
      } catch (error) {
        console.error('Error fetching channels:', error);
        // Continue without channels for now
      }
      
      for (const channel of channels) {
        await this.startMonitoringChannel(channel);
      }
      
      console.log('Telegram Monitor initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Telegram Monitor:', error);
      // Don't throw error - let the app continue
    }
  }

  async startMonitoringChannel(channel) {
    try {
      const chatId = await this.resolveChatId(channel.channel_url);
      
      this.monitoredChannels.set(chatId, {
        channelId: channel.id,
        userId: channel.user_id
      });

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
          const isDuplicate = await checkDuplicate(
            userId,
            keywordObj.id,
            messageText
          );
          
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

  async forwardMatchedMessage(msg, userId, keywordObj, channelId) {
    let logEntry;
    try {
      logEntry = await LoggingService.logMessage({
        userId,
        keywordId: keywordObj.id,
        channelId: channelId,
        originalMessageId: msg.message_id.toString(),
        originalMessageText: this.extractMessageText(msg),
        matchedText: keywordObj.keyword,
        status: 'pending'
      });

      const destinations = await DestinationService.getUserDestinations(userId);

      for (const destination of destinations) {
        try {
          await forwardMessage({ ...msg, logId: logEntry.id }, destination, keywordObj);
        } catch (error) {
          console.error(`Error forwarding to destination ${destination.name}:`, error);
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

  getChannelId(chatId) {
    const channelInfo = this.monitoredChannels.get(chatId.toString());
    return channelInfo ? channelInfo.channelId : null;
  }

  async stopMonitoringChannel(channelId) {
    let chatIdToRemove = null;
    for (const [chatId, channelInfo] of this.monitoredChannels.entries()) {
      if (channelInfo.channelId === channelId) {
        chatIdToRemove = chatId;
        break;
      }
    }
    if (chatIdToRemove) {
      this.monitoredChannels.delete(chatIdToRemove);
      console.log(`Stopped monitoring Telegram channel ID: ${channelId}`);

      try {
        const channel = await ChannelService.getChannelById(null, channelId);
        if (channel) {
          await ChannelService.toggleChannel(channel.user_id, channelId, false);
        }
      } catch (error) {
        console.error('Error stopping channel monitoring:', error);
      }
    }
  }

  async resolveChatId(channelUrl) {
    try {
      if (!isNaN(channelUrl)) {
        return channelUrl;
      }
      const chat = await this.bot.getChat(channelUrl.startsWith('@') ? channelUrl : `@${channelUrl}`);
      return chat.id.toString();
    } catch (error) {
      console.error(`Could not resolve chat ID for ${channelUrl}:`, error.message);
      throw new Error(`Could not resolve chat ID for ${channelUrl}`);
    }
  }
}

module.exports = TelegramMonitor;