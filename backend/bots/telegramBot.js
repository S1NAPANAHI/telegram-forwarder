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
    this.bot.onText(///start/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      
      const welcomeMessage = `🤖 Welcome to Telegram Keyword Bot!\r\n\r\nThis bot monitors channels and forwards messages containing your keywords.\r\n\r\n🔗 To get started:\r\n1. Visit our web interface: ${process.env.FRONTEND_URL || 'https://your-frontend-url.com'}\r\n2. Create an account\r\n3. Add keywords you want to monitor\r\n4. Add channels to monitor\r\n5. Set up destinations for forwarding\r\n\r\n📋 Available commands:\r\n/start - Show this message\r\n/help - Get help\r\n/status - Check your monitoring status\r\n/webapp - Open web interface\r\n\r\nNeed help? Contact support!`;

      await this.bot.sendMessage(chatId, welcomeMessage);
    });

    // Handle /help command\r\n    this.bot.onText(///help/, async (msg) => {
      const chatId = msg.chat.id;
      
      const helpMessage = `📖 How to use this bot:\r\n\r\n1. **Web Interface**: Use our web app to manage keywords and channels\r\n2. **Keywords**: Add words or phrases to monitor\r\n3. **Channels**: Add Telegram channels to monitor\r\n4. **Destinations**: Set where to forward matched messages\r\n\r\n🌐 Web Interface: ${process.env.FRONTEND_URL || 'https://your-frontend-url.com'}\r\n\r\nCommands:\r\n/start - Welcome message\r\n/help - This help\r\n/status - Your monitoring status\r\n/webapp - Open web interface`;

      await this.bot.sendMessage(chatId, helpMessage);
    });

    // Handle /status command\r\n    this.bot.onText(///status/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      
      try {
        // Check user status in database
        const UserService = require('../services/UserService');
        const KeywordService = require('../services/KeywordService');
        const ChannelService = require('../services/ChannelService');
        
        const user = await UserService.findUserByTelegramId(userId);
        
        if (!user) {
          await this.bot.sendMessage(chatId, 
            `❌ You\'re not registered yet.\n\nPlease visit: ${process.env.FRONTEND_URL || 'https://your-frontend-url.com'}\n\nCreate an account to start monitoring!`
          );
          return;
        }

        const keywords = await KeywordService.getUserKeywords(user.id);
        const channels = await ChannelService.getUserChannels(user.id);
        const activeChannels = channels.filter(c => c.is_active);

        const statusMessage = `📊 Your Monitoring Status:\n\n👤 User: ${user.username || 'User'}\n🔑 Keywords: ${keywords.length}\n📺 Total Channels: ${channels.length}\n✅ Active Channels: ${activeChannels.length}\n\n🌐 Manage settings: ${process.env.FRONTEND_URL || 'https://your-frontend-url.com'}`;

        await this.bot.sendMessage(chatId, statusMessage);
        
      } catch (error) {
        console.error('Status command error:', error);
        await this.bot.sendMessage(chatId, '❌ Error fetching status. Please try again later.');
      }
    });

    // Handle /webapp command\r\n    this.bot.onText(///webapp/, async (msg) => {
      const chatId = msg.chat.id;
      
      const webAppUrl = process.env.FRONTEND_URL || 'https://your-frontend-url.com';
      
      await this.bot.sendMessage(chatId, 
        `🌐 Access Web Interface:`,
        {
          reply_markup: {
            inline_keyboard: [[
              {
                text: '🚀 Open Web App',
                web_app: { url: webAppUrl }
              }
            ]]
          }
        }
      );
    });

    // Handle unknown commands
    this.bot.on('message', async (msg) => {
      // Skip if it\'s a channel message being monitored
      const channelInfo = this.monitoredChannels.get(msg.chat.id.toString());
      if (channelInfo) {
        await this.processMessage(msg, channelInfo.userId, channelInfo.channelId);
        return;
      }

      // Skip if it\'s a known command
      if (msg.text && msg.text.startsWith('/')) {
        const knownCommands = ['/start', '/help', '/status', '/webapp'];
        if (knownCommands.some(cmd => msg.text.startsWith(cmd))) {
          return;
        }
        
        // Unknown command
        await this.bot.sendMessage(msg.chat.id, 
          `❓ Unknown command: ${msg.text}\n\nType /help to see available commands.`
        );
      }
    });
  }

  async initialize() {
    const channels = await ChannelService.getActiveChannelsByPlatform('telegram');
    
    for (const channel of channels) {
      await this.startMonitoringChannel(channel);
    }

    // The message handler for channel monitoring is now part of setupCommandHandlers
    // and will be triggered for all messages, including channel messages.
    // No need for a separate this.bot.on('message') here.
  }

  async startMonitoringChannel(channel) {
    try {
      const chatId = await this.resolveChatId(channel.channel_url);
      
      this.monitoredChannels.set(chatId, {
        channelId: channel.id,
        userId: channel.user.id // Assuming user data is populated by ChannelService
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

      const forwardResults = [];
      for (const destination of destinations) {
        try {
          await forwardMessage({ ...msg, logId: logEntry.id }, destination, keywordObj);
          forwardResults.push({
            destinationId: destination.id,
            status: 'success',
            timestamp: new Date()
          });
        } catch (error) {
          forwardResults.push({
            destinationId: destination.id,
            status: 'failed',
            error: error.message,
            timestamp: new Date()
          });
          console.error(`Error forwarding to destination ${destination.name}:`, error);
        }
      }

      if (destinations.length === 0) {
        await LoggingService.updateLogStatus(logEntry.id, 'success');
      } else {
        // Note: Supabase doesn't directly support array push in update like MongoDB. 
        // You might need to fetch, modify, and then update the array, or use a custom RPC.
        // For simplicity, we'll just update the status here.
        await LoggingService.updateLogStatus(logEntry.id, 'processed');
      }

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

      const channel = await ChannelService.getChannelById(null, channelId); 
      if (channel) {
        await ChannelService.toggleChannel(channel.user_id, channelId, false);
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
