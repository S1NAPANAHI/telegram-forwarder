const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'chat-id-resolver' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

class ChatIdResolver {
  constructor() {
    this.cache = new Map(); // Cache resolved IDs to avoid API calls
    this.bot = null;
  }

  /**
   * Set the Telegram bot instance for API calls
   */
  setBotInstance(bot) {
    this.bot = bot;
  }

  /**
   * Check if a chat ID needs resolution (starts with @)
   */
  needsResolution(chatId) {
    return typeof chatId === 'string' && chatId.startsWith('@');
  }

  /**
   * Resolve @username to numeric chat ID using Telegram Bot API
   */
  async resolveChatId(chatId) {
    if (!this.needsResolution(chatId)) {
      return chatId; // Already numeric or not a username
    }

    // Check cache first
    if (this.cache.has(chatId)) {
      const cached = this.cache.get(chatId);
      logger.debug(`Using cached ID for ${chatId}: ${cached}`);\n      return cached;
    }

    if (!this.bot) {
      logger.warn('Bot instance not available for chat ID resolution');
      return chatId; // Return as-is if bot not available
    }

    try {
      // Use Bot API to resolve username to chat object
      const chat = await this.bot.getChat(chatId);
      const numericId = chat.id.toString();
      
      // Cache the resolved ID
      this.cache.set(chatId, numericId);
      
      logger.info(`✅ Resolved ${chatId} → ${numericId}`);
      return numericId;
    } catch (error) {
      logger.error(`Failed to resolve ${chatId}:`, error.message);
      
      // Return original if resolution fails
      return chatId;
    }
  }

  /**
   * Resolve and update destination chat_id in database
   */
  async resolveAndUpdateDestination(destinationId, chatId) {
    if (!this.needsResolution(chatId)) {
      return chatId; // No update needed
    }

    try {
      const resolvedId = await this.resolveChatId(chatId);
      
      if (resolvedId !== chatId) {
        // Update database with resolved numeric ID
        const supabase = require('../database/supabase');
        const { error } = await supabase
          .from('destinations')
          .update({ 
            chat_id: resolvedId,
            updated_at: new Date().toISOString()
          })
          .eq('id', destinationId);

        if (error) {
          logger.error(`Error updating destination ${destinationId}:`, error.message);
        } else {
          logger.info(`✅ Updated destination ${destinationId}: ${chatId} → ${resolvedId}`);
        }
      }

      return resolvedId;
    } catch (error) {
      logger.error(`Error resolving destination ${destinationId}:`, error.message);
      return chatId;
    }
  }

  /**
   * Batch resolve multiple chat IDs
   */
  async resolveMultiple(chatIds) {
    const promises = chatIds.map(id => this.resolveChatId(id));
    return Promise.all(promises);
  }

  /**
   * Clear resolution cache
   */
  clearCache() {
    this.cache.clear();
    logger.info('Chat ID resolution cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries())
    };
  }
}

module.exports = new ChatIdResolver();