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

🔗 To get started:
1. Visit our web interface: ${process.env.FRONTEND_URL || 'https://your-frontend-url.com'}
2. Create an account
3. Add keywords you want to monitor
4. Add channels to monitor
5. Set up destinations for forwarding

📋 Available commands:
/start - Show this message
/help - Get help
/status - Check your monitoring status
/webapp - Open web interface

Need help? Contact support!`;

      await this.bot.sendMessage(chatId, welcomeMessage);
    });

    // Handle /help command
    this.bot.onText(/\/help/, async (msg) => {
      const chatId = msg.chat.id;
      
      const helpMessage = `📖 How to use this bot:

1. **Web Interface**: Use our web app to manage keywords and channels
2. **Keywords**: Add words or phrases to monitor
3. **Channels**: Add Telegram channels to monitor
4. **Destinations**: Set where to forward matched messages

🌐 Web Interface: ${process.env.FRONTEND_URL || 'https://your-frontend-url.com'}

Commands:
/start - Welcome message
/help - This help
/status - Your monitoring status
/webapp - Open web interface`;

      await this.bot.sendMessage(chatId, helpMessage);
    });

    // Handle /status command
    this.bot.onText(/\/status/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      
      try {
        await this.bot.sendMessage(chatId, '📊 Bot Status: Active\n\n✅ Telegram monitoring: Enabled\n🌐 Web interface: Available\n\nTo set up monitoring, visit the web interface!');
      } catch (error) {
        console.error('Status command error:', error);
        await this.bot.sendMessage(chatId, '❌ Error fetching status. Please try again later.');
      }
    });

    // Handle /webapp command
    this.bot.onText(/\/webapp/, async (msg) => {
      const chatId = msg.chat.id;
      
      const webAppUrl = process.env.FRONTEND_URL || 'https://your-frontend-url.com';
      
      await this.bot.sendMessage(chatId, 
        `🌐 Access Web Interface: ${webAppUrl}`
      );
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
        
        // Unknown command
        await this.bot.sendMessage(msg.chat.id, 
          `❓ Unknown command: ${msg.text}\n\nType /help to see available commands.`
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