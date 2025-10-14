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
  }

  async initialize() {
    const channels = await ChannelService.getActiveChannelsByPlatform('telegram');
    
    for (const channel of channels) {
      await this.startMonitoringChannel(channel);
    }

    this.bot.on('message', async (msg) => {
      const channelInfo = this.monitoredChannels.get(msg.chat.id.toString());
      if (channelInfo) {
        await this.processMessage(msg, channelInfo.userId, channelInfo.channelId);
      }
    });
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