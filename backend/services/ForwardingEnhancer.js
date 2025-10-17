const DestinationService = require('./DestinationService');
const KeywordService = require('./KeywordService');
const LoggingService = require('./LoggingService');
const DuplicateDetector = require('./duplicateDetector');

/**
 * Enhanced ForwardingEnhancer Service
 * Handles multi-channel message forwarding:
 * 1. Telegram DM to user
 * 2. Web feed for dashboard
 * 3. Email queue for notifications
 */
class ForwardingEnhancer {
  constructor(supabase, telegramBot) {
    this.supabase = supabase;
    this.telegramBot = telegramBot;
    this.destinationService = new DestinationService(supabase);
    this.keywordService = new KeywordService(supabase);
    this.loggingService = new LoggingService(supabase);
    this.duplicateDetector = new DuplicateDetector();

  /**
   * Handle incoming message from monitored channel
   * @param {Object} message - Telegram message object
   * @param {string} userId - User ID who owns the channel
   * @param {Object} channel - Channel configuration object
   */
  handleIncomingMessage = async (message, userId, channel) => {
    try {
      const messageText = message.text || message.caption || '';
      if (!messageText.trim()) {
        console.log('⏭️ Skipping empty message');
        return;
      }

      console.log(`🔍 ForwardingEnhancer processing: "${messageText.substring(0, 50)}..."`);

      // Duplicate guard
      if (this.duplicateDetector && await this.duplicateDetector.isDuplicate(message, userId, channel.id)) {
        console.log('⏭️ Skipping duplicate message');
        return;
      }

      // Get keywords for the channel
      const keywords = await this.keywordService.getChannelKeywords(channel.id);
      
      // Check if message matches keywords (empty keywords = forward all)
      const matchedKeywords = this.getMatchedKeywords(messageText, keywords);
      const shouldForward = keywords.length === 0 || matchedKeywords.length > 0;
      
      if (!shouldForward) {
        console.log(`🚫 Message doesn't match keywords, skipping`);
        return;
      }

      console.log(`🎯 Message matches keywords: ${matchedKeywords.map(k => k.keyword).join(', ')}`);

      // Get user's destinations
      const destinations = await this.destinationService.getActiveDestinations(userId);
      if (!destinations || destinations.length === 0) {
        console.log(`⚠️ No active destinations for user ${userId}`);
        return;
      }

      // Prepare message data for multi-channel forwarding
      const messageData = {
        userId: userId,
        channelId: channel.id,
        originalChatId: message.chat.id.toString(),
        messageText: messageText,
        messageData: {
          message_id: message.message_id,
          date: message.date,
          chat: {
            id: message.chat.id,
            title: message.chat.title,
            type: message.chat.type
          },
          from: message.from ? {
            id: message.from.id,
            first_name: message.from.first_name,
            username: message.from.username
          } : null
        },
        matchedKeywords: matchedKeywords,
        timestamp: new Date().toISOString()
      };

      // Forward to all channels simultaneously
      await this.forwardToAllChannels(messageData, destinations);

      console.log(`✅ Multi-channel forwarding completed for message`);

    } catch (error) {
      console.error('ForwardingEnhancer error:', error.message);
    }
  }

  /**
   * Forward message to all available channels
   * @param {Object} messageData - Structured message data
   * @param {Array} destinations - User's active destinations
   */
  forwardToAllChannels = async (messageData, destinations) => {
    const promises = [];

    // 1. Store in message queue first
    promises.push(this.storeInMessageQueue(messageData));

    // 2. Send Telegram DM
    promises.push(this.sendTelegramDM(messageData, destinations));

    // 3. Add to web feed
    promises.push(this.addToWebFeed(messageData));

    // 4. Queue for email (if enabled)
    promises.push(this.queueForEmail(messageData));

    // Execute all forwarding channels in parallel
    const results = await Promise.allSettled(promises);
    
    // Log any failures
    results.forEach((result, index) => {
      const channels = ['queue', 'telegram', 'web_feed', 'email'];
      if (result.status === 'rejected') {
        console.error(`${channels[index]} forwarding failed:`, result.reason?.message || result.reason);
      } else {
        console.log(`✅ ${channels[index]} forwarding successful`);
      }
    });
  }

  /**
   * Store message in queue for tracking
   */
  storeInMessageQueue = async (messageData) => {
    try {
      const { error } = await this.supabase
        .from('message_queue')
        .insert({
          user_id: messageData.userId,
          channel_id: messageData.channelId,
          original_chat_id: messageData.originalChatId,
          message_text: messageData.messageText,
          message_type: 'text',
          matched_keywords: messageData.matchedKeywords,
          message_data: messageData.messageData,
          status: 'processing',
          created_at: messageData.timestamp
        });

      if (error) throw error;
      console.log('📎 Message stored in queue');
    } catch (error) {
      console.error('Error storing in message queue:', error.message);
      throw error;
    }
  }

  /**
   * Send Telegram DM to user
   */
  sendTelegramDM = async (messageData, destinations) => {
    try {
      // Find user's telegram_id from user table
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('telegram_id')
        .eq('id', messageData.userId)
        .single();

      if (userError || !user?.telegram_id || user.telegram_id === 'system_bot') {
        console.log('⚠️ No telegram_id found for user, skipping DM');
        return;
      }

      const telegramDest = destinations.find(d => d.platform === 'telegram');
      if (!telegramDest) {
        console.log('⚠️ No Telegram destination configured');
        return;
      }

      // Format message for Telegram
      const chatTitle = messageData.messageData.chat?.title || 'Unknown Chat';
      const fromUser = messageData.messageData.from?.first_name || 'Unknown User';
      const keywords = messageData.matchedKeywords.map(k => k.keyword).join(', ');
      
      const formattedMessage = `📢 **Message Forward**\n\n` +
        `📝 **From:** ${chatTitle}\n` +
        `👤 **User:** ${fromUser}\n` +
        `🎯 **Keywords:** ${keywords || 'All messages'}\n\n` +
        `✉️ **Message:**\n${messageData.messageText}`;

      // Send to user's telegram_id (DM) or destination chat_id
      const targetChatId = user.telegram_id !== 'system_bot' ? user.telegram_id : telegramDest.chat_id;
      
      await this.telegramBot.sendMessage(targetChatId, formattedMessage, { 
        parse_mode: 'Markdown' 
      });
      
      console.log(`📱 Telegram DM sent to ${targetChatId}`);
    } catch (error) {
      console.error('Error sending Telegram DM:', error.message);
      // Don't throw - continue with other channels
    }
  }

  /**
   * Add message to web feed for dashboard
   */
  addToWebFeed = async (messageData) => {
    try {
      const { error } = await this.supabase
        .from('message_feed')
        .insert({
          user_id: messageData.userId,
          title: `New message from ${messageData.messageData.chat?.title || 'Unknown Chat'}`,
          content: messageData.messageText,
          data: {
            channel_id: messageData.channelId,
            original_chat_id: messageData.originalChatId,
            matched_keywords: messageData.matchedKeywords,
            message_data: messageData.messageData
          },
          created_at: messageData.timestamp
        });

      if (error) throw error;
      console.log('🌐 Message added to web feed');
    } catch (error) {
      console.error('Error adding to web feed:', error.message);
      // Don't throw - continue with other channels
    }
  }

  /**
   * Queue message for email notification
   */
  queueForEmail = async (messageData) => {
    try {
      // For now, just log the email queuing
      // TODO: Implement actual email queuing service
      console.log('📧 Email notification queued (placeholder)');
    } catch (error) {
      console.error('Error queuing email:', error.message);
    }
  }

  /**
   * Get matched keywords from message text
   */
  getMatchedKeywords = (text, keywords) => {
    const matched = [];
    const lowerText = text.toLowerCase();

    for (const keyword of keywords) {
      try {
        let isMatch = false;
        const lowerKeyword = keyword.keyword.toLowerCase();

        switch (keyword.match_type) {
          case 'exact':
            isMatch = keyword.case_sensitive ? 
                     text === keyword.keyword : 
                     lowerText === lowerKeyword;
            break;
          case 'contains':
            isMatch = keyword.case_sensitive ? 
                     text.includes(keyword.keyword) : 
                     lowerText.includes(lowerKeyword);
            break;
          case 'regex':
            const flags = keyword.case_sensitive ? '' : 'i';
            const regex = new RegExp(keyword.keyword, flags);
            isMatch = regex.test(text);
            break;
          default:
            // Default to contains, case-insensitive
            isMatch = lowerText.includes(lowerKeyword);
        }

        if (isMatch) {
          matched.push(keyword);
        }
      } catch (error) {
        console.error(`Error matching keyword "${keyword.keyword}":`, error.message);
      }
    }

    return matched;
  }

  /**
   * Update message queue status
   */
  updateMessageStatus = async (messageId, status, failureReason = null) => {
    try {
      const updateData = {
        status: status,
        updated_at: new Date().toISOString()
      };

      if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      if (failureReason) {
        updateData.failure_reason = failureReason;
      }

      const { error } = await this.supabase
        .from('message_queue')
        .update(updateData)
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating message status:', error.message);
    }
  }

  /**
   * Retry failed message delivery
   */
  retryMessage = async (messageId) => {
    try {
      // Get message from queue
      const { data: message, error } = await this.supabase
        .from('message_queue')
        .select('*')
        .eq('id', messageId)
        .single();

      if (error || !message) {
        throw new Error('Message not found');
      }

      // Get user's destinations
      const destinations = await this.destinationService.getActiveDestinations(message.user_id);
      
      if (!destinations || destinations.length === 0) {
        throw new Error('No active destinations');
      }

      // Reconstruct message data
      const messageData = {
        userId: message.user_id,
        channelId: message.channel_id,
        originalChatId: message.original_chat_id,
        messageText: message.message_text,
        messageData: message.message_data,
        matchedKeywords: message.matched_keywords,
        timestamp: new Date().toISOString()
      };

      // Update status to retrying
      await this.updateMessageStatus(messageId, 'retrying');

      // Attempt to forward again
      await this.forwardToAllChannels(messageData, destinations);
      
      // Update status to delivered
      await this.updateMessageStatus(messageId, 'delivered');
      
      console.log(`✅ Message ${messageId} retried successfully`);

    } catch (error) {
      console.error(`Error retrying message ${messageId}:`, error.message);
      await this.updateMessageStatus(messageId, 'failed', error.message);
      throw error;
    }
  }
}

module.exports = ForwardingEnhancer;
// Temporary comment to force Git change