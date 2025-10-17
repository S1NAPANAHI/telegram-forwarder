const DestinationService = require('./DestinationService');
const KeywordService = require('./KeywordService');
const LoggingService = require('./LoggingService');
const DuplicateDetector = require('./duplicateDetector');

class ForwardingEnhancer {
  constructor(supabase, telegramBot) {
    this.supabase = supabase;
    this.telegramBot = telegramBot;
    this.destinationService = new DestinationService(supabase);
    this.keywordService = new KeywordService(supabase);
    this.loggingService = new LoggingService(supabase);
    this.duplicateDetector = new DuplicateDetector();
  }

  handleIncomingMessage = async (message, userId, channel) => {
    try {
      const messageText = message.text || message.caption || '';
      if (!messageText.trim()) return;

      const keywords = await this.keywordService.getKeywordsByChannelId(channel.id);
      const matchedKeywords = this.getMatchedKeywords(messageText, keywords);
      const shouldForward = keywords.length === 0 || matchedKeywords.length > 0;
      if (!shouldForward) return;

      const destinations = await this.destinationService.getUserDestinations(userId, true);
      if (!destinations || destinations.length === 0) return;

      const messageData = {
        userId,
        channelId: channel.id,
        originalChatId: message.chat.id.toString(),
        messageText,
        messageData: {
          message_id: message.message_id,
          date: message.date,
          chat: { id: message.chat.id, title: message.chat.title, type: message.chat.type },
          from: message.from ? { id: message.from.id, first_name: message.from.first_name, username: message.from.username } : null
        },
        matchedKeywords,
        timestamp: new Date().toISOString()
      };

      await this.forwardToAllChannels(messageData, destinations);
    } catch (error) {
      console.error('ForwardingEnhancer error:', error.message);
    }
  }

  forwardToAllChannels = async (messageData, destinations) => {
    const results = await Promise.allSettled([
      this.storeInMessageQueue(messageData),
      this.sendTelegramDM(messageData, destinations),
      this.addToWebFeed(messageData),
      this.queueForEmail(messageData)
    ]);

    results.forEach((r, i) => {
      const channels = ['queue', 'telegram', 'web_feed', 'email'];
      if (r.status === 'rejected') console.error(`${channels[i]} forwarding failed:`, r.reason?.message || r.reason);
    });
  }

  storeInMessageQueue = async (messageData) => {
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
  }

  // Updated: fallback to Telegram destination chat_id when user.telegram_id missing
  sendTelegramDM = async (messageData, destinations) => {
    try {
      const { data: user } = await this.supabase
        .from('users')
        .select('telegram_id')
        .eq('id', messageData.userId)
        .single();

      const telegramDest = destinations.find(d => d.platform === 'telegram');

      // choose target: prefer user.telegram_id; if missing, use destination chat_id
      const targetChatId = (user && user.telegram_id && user.telegram_id !== 'system_bot')
        ? user.telegram_id
        : (telegramDest ? telegramDest.chat_id : null);

      if (!targetChatId) {
        console.log('⚠️ No targetChatId available for DM');
        return;
      }

      const chatTitle = messageData.messageData.chat?.title || 'Unknown Chat';
      const fromUser = messageData.messageData.from?.first_name || 'Unknown User';
      const keywords = messageData.matchedKeywords.map(k => k.keyword).join(', ');

      const formattedMessage = `📢 **Message Forward**\n\n` +
        `📝 **From:** ${chatTitle}\n` +
        `👤 **User:** ${fromUser}\n` +
        `🎯 **Keywords:** ${keywords || 'All messages'}\n\n` +
        `✉️ **Message:**\n${messageData.messageText}`;

      await this.telegramBot.sendMessage(targetChatId, formattedMessage, { parse_mode: 'Markdown' });
      console.log(`📱 Telegram DM sent to ${targetChatId}`);
    } catch (error) {
      console.error('Error sending Telegram DM:', error.message);
    }
  }

  addToWebFeed = async (messageData) => {
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
  }

  queueForEmail = async () => { console.log('📧 Email notification queued (placeholder)'); }

  getMatchedKeywords = (text, keywords) => {
    const matched = []; const lowerText = text.toLowerCase();
    for (const keyword of keywords) {
      try {
        let isMatch = false; const lowerKeyword = keyword.keyword.toLowerCase();
        switch (keyword.match_type) {
          case 'exact': isMatch = keyword.case_sensitive ? text === keyword.keyword : lowerText === lowerKeyword; break;
          case 'contains': isMatch = keyword.case_sensitive ? text.includes(keyword.keyword) : lowerText.includes(lowerKeyword); break;
          case 'regex': { const flags = keyword.case_sensitive ? '' : 'i'; const regex = new RegExp(keyword.keyword, flags); isMatch = regex.test(text); break; }
          default: isMatch = lowerText.includes(lowerKeyword);
        }
        if (isMatch) matched.push(keyword);
      } catch (e) { console.error(`Error matching keyword "${keyword.keyword}":`, e.message); }
    }
    return matched;
  }
}

module.exports = ForwardingEnhancer;
