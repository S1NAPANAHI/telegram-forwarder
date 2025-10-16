const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'auto-promotion' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

class AutoPromotionService {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.processedUsers = new Set(); // Track users to avoid spamming destination creation logs
  }

  /**
   * Start the auto-promotion service with periodic checks
   */
  start() {
    if (this.isRunning) {
      logger.warn('AutoPromotionService is already running');
      return;
    }

    this.isRunning = true;
    
    // Run immediately on start
    this.runAutoPromotion().catch(error => {
      logger.error('Initial auto-promotion failed:', error.message);
    });

    // Run every 60 seconds
    this.intervalId = setInterval(() => {
      this.runAutoPromotion().catch(error => {
        logger.error('Scheduled auto-promotion failed:', error.message);
      });
    }, 60000);

    logger.info('✅ AutoPromotionService started (runs every 60s)');
  }

  /**
   * Stop the auto-promotion service
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    logger.info('AutoPromotionService stopped');
  }

  /**
   * Main auto-promotion logic
   */
  async runAutoPromotion() {
    try {
      const supabase = require('../database/supabase');
      
      // Get all discovered chats that are admin but not promoted
      const { data: discoveredChats, error } = await supabase
        .from('discovered_chats')
        .select('*')
        .eq('is_admin', true)
        .eq('is_promoted', false)
        .not('user_id', 'is', null);

      if (error) {
        logger.error('Error fetching discovered chats:', error.message);
        return;
      }

      if (!discoveredChats || discoveredChats.length === 0) {
        return; // Nothing to promote
      }

      let promoted = 0;
      let skipped = 0;

      for (const chat of discoveredChats) {
        try {
          const success = await this.promoteChat(chat);
          if (success) {
            promoted++;
            
            // Ensure destination exists for this user
            await this.ensureUserHasDestination(chat.user_id);
          } else {
            skipped++;
          }
        } catch (error) {
          logger.error(`Error promoting chat ${chat.chat_id}:`, error.message);
          skipped++;
        }
      }

      if (promoted > 0) {
        logger.info(`Auto-promoted ${promoted} chats (${skipped} skipped)`);
        
        // Notify monitoring manager to reload channels
        await this.notifyMonitoringManager();
      }
    } catch (error) {
      logger.error('Auto-promotion run failed:', error.message);
    }
  }

  /**
   * Promote a single discovered chat to monitored channel
   */
  async promoteChat(discoveredChat) {
    try {
      const supabase = require('../database/supabase');
      const { chat_id, chat_type, chat_title, chat_username, user_id } = discoveredChat;

      // Normalize channel URL
      let channelUrl;
      if (chat_username) {
        channelUrl = `https://t.me/${chat_username}`;
      } else {
        channelUrl = chat_id; // Use numeric ID
      }

      // Check if channel already exists for this user
      const { data: existingChannel } = await supabase
        .from('channels')
        .select('id')
        .eq('user_id', user_id)
        .eq('channel_url', channelUrl)
        .maybeSingle();

      if (existingChannel) {
        // Already exists, just mark as promoted
        await supabase
          .from('discovered_chats')
          .update({ is_promoted: true })
          .eq('id', discoveredChat.id);
        
        logger.debug(`Channel already exists: ${chat_title || chat_id}`);
        return false;
      }

      // Create new channel record
      const channelData = {
        user_id: user_id,
        platform: 'telegram',
        channel_url: channelUrl,
        channel_name: chat_title || `Chat ${chat_id}`,
        is_active: true,
        admin_status: true,
        monitoring_method: 'bot_api',
        platform_specific_id: chat_id,
        discovery_source: 'auto_discovered',
        created_at: new Date().toISOString()
      };

      const { data: newChannel, error: insertError } = await supabase
        .from('channels')
        .insert(channelData)
        .select('*')
        .single();

      if (insertError) {
        logger.error(`Error creating channel for ${chat_id}:`, insertError.message);
        return false;
      }

      // Mark discovered chat as promoted
      await supabase
        .from('discovered_chats')
        .update({ is_promoted: true })
        .eq('id', discoveredChat.id);

      logger.info(`✅ Auto-promoted: ${chat_title || chat_id} (${chat_id}) for user ${user_id}`);
      return true;
    } catch (error) {
      logger.error(`Error in promoteChat for ${discoveredChat.chat_id}:`, error.message);
      return false;
    }
  }

  /**
   * Ensure user has at least one active destination
   */
  async ensureUserHasDestination(userId) {
    try {
      const supabase = require('../database/supabase');

      // Check if user already has active destinations
      const { data: existingDestinations } = await supabase
        .from('destinations')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .limit(1);

      if (existingDestinations && existingDestinations.length > 0) {
        return; // User already has destinations
      }

      // Check for default destination in environment
      const defaultDestination = process.env.DEFAULT_TELEGRAM_DESTINATION_CHAT_ID;
      if (!defaultDestination) {
        // Only log once per user to avoid spam
        if (!this.processedUsers.has(userId)) {
          logger.info(`⚠️  User ${userId} has no destinations. Add one manually or set DEFAULT_TELEGRAM_DESTINATION_CHAT_ID env var`);
          this.processedUsers.add(userId);
        }
        return;
      }

      // Create default destination for user
      const destinationData = {
        user_id: userId,
        name: 'Auto-created Default',
        type: 'private_chat', // Assume private chat, adjust if needed
        platform: 'telegram',
        chat_id: defaultDestination,
        is_active: true,
        created_via: 'auto_promotion',
        created_at: new Date().toISOString()
      };

      const { error: destError } = await supabase
        .from('destinations')
        .insert(destinationData);

      if (destError) {
        logger.error(`Error creating default destination for user ${userId}:`, destError.message);
      } else {
        logger.info(`✅ Created default destination for user ${userId}: ${defaultDestination}`);
      }
    } catch (error) {
      logger.error(`Error ensuring destination for user ${userId}:`, error.message);
    }
  }

  /**
   * Notify monitoring manager to reload active channels
   */
  async notifyMonitoringManager() {
    try {
      const monitoringManager = require('./monitoringManager');
      if (monitoringManager && typeof monitoringManager.loadAndStartActiveChannels === 'function') {
        await monitoringManager.loadAndStartActiveChannels();
        logger.debug('Notified MonitoringManager to reload channels');
      }
    } catch (error) {
      logger.warn('Could not notify MonitoringManager:', error.message);
    }
  }

  /**
   * Manual trigger for auto-promotion (used by API endpoint)
   */
  async triggerManualPromotion() {
    logger.info('Manual auto-promotion triggered');
    await this.runAutoPromotion();
    return { success: true, message: 'Auto-promotion completed' };
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      processedUsers: this.processedUsers.size,
      hasDefaultDestination: !!process.env.DEFAULT_TELEGRAM_DESTINATION_CHAT_ID
    };
  }
}

module.exports = new AutoPromotionService();