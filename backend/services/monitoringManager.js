// Enhanced Monitoring Manager - Phase 2.1: Universal Mode Support + Auto-Promotion
// Unified monitoring with automatic admin detection, method switching, and auto-promotion

const winston = require('winston');
const TelegramDiscoveryService = require('./TelegramDiscoveryService');
const PullMonitoringService = require('./PullMonitoringService');
const AutoPromotionService = require('./AutoPromotionService');

// Configure logger for monitoring manager
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'monitoring-manager' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

class MonitoringManager {
  constructor() {
    this.telegramMonitor = null;
    this.eitaaMonitor = null;
    this.newsScraper = null;
    this.pullMonitoringService = null;
    this.telegramDiscoveryService = null;
    this.autoPromotionService = null;
    this.activeMonitors = new Map(); // channelId -> { monitor, method, config }
    this.clientMonitorActive = false;
    this.initialized = false;
  }

  async initialize() {
    logger.info('Initializing Enhanced Monitoring Manager...');

    try {
      // Initialize Discovery Service
      this.telegramDiscoveryService = new TelegramDiscoveryService();
      logger.info('✅ Telegram Discovery Service initialized');

      // Initialize Pull Monitoring Service
      this.pullMonitoringService = new PullMonitoringService();
      logger.info('✅ Pull Monitoring Service initialized');

      // Initialize Auto-Promotion Service
      this.autoPromotionService = AutoPromotionService;
      this.autoPromotionService.start(); // Start background worker
      logger.info('✅ Auto-Promotion Service initialized');

      // Initialize Telegram Monitor
      try {
        const TelegramMonitor = require('../bots/telegramBot');
        this.telegramMonitor = new TelegramMonitor();
        await this.telegramMonitor.initialize();
        logger.info('✅ Telegram Monitor initialized');
      } catch (error) {
        logger.error('Failed to initialize Telegram Monitor:', {
          message: error?.message || error,
          stack: error?.stack
        });
        this.telegramMonitor = null;
      }

      // Initialize Eitaa Monitor
      try {
        const EitaaMonitor = require('../bots/eitaaBot');
        this.eitaaMonitor = new EitaaMonitor();
        await this.eitaaMonitor.initialize();
        logger.info('✅ Eitaa Monitor initialized');
      } catch (error) {
        logger.error('Failed to initialize Eitaa Monitor:', {
          message: error?.message || error,
          stack: error?.stack
        });
        this.eitaaMonitor = null;
      }

      // Initialize News Scraper
      try {
        const NewsScraper = require('../scraper/newsScraper');
        this.newsScraper = new NewsScraper();
        logger.info('✅ News Scraper initialized');
      } catch (error) {
        logger.error('Failed to initialize News Scraper:', {
          message: error?.message || error,
          stack: error?.stack
        });
        this.newsScraper = null;
      }

      // Initialize Client Monitor
      try {
        if (process.env.TG_API_ID && process.env.TG_API_HASH) {
          const { startClientMonitor } = require('../bots/clientMonitor');
          await startClientMonitor();
          this.clientMonitorActive = true;
          logger.info('✅ Telegram Client Monitor initialized');
        } else {
          logger.warn('⚠️ Telegram Client Monitor skipped (missing TG_API_ID/TG_API_HASH)');
        }
      } catch (error) {
        logger.error('Failed to initialize Client Monitor:', {
          message: error?.message || error,
          stack: error?.stack
        });
        this.clientMonitorActive = false;
      }

      // Load active channels from database
      await this.loadAndStartActiveChannels();

      this.initialized = true;
      logger.info('✅ Enhanced Monitoring Manager initialized successfully');
      
    } catch (error) {
      logger.error('Critical error during Monitoring Manager initialization:', {
        message: error?.message || error,
        stack: error?.stack
      });
      throw error;
    }
  }

  /**
   * Load and start monitoring for all active channels
   */
  async loadAndStartActiveChannels() {
    try {
      // Import supabase here to avoid circular dependencies
      const supabase = require('../database/supabase');
      
      const { data: activeChannels, error } = await supabase
        .from('channels')
        .select('*')
        .eq('is_active', true);
      
      if (error) {
        logger.error('Error fetching active channels:', error.message);
        return;
      }
      
      if (!activeChannels || activeChannels.length === 0) {
        logger.info('No active channels found to monitor');
        return;
      }

      for (const channel of activeChannels) {
        try {
          await this.startMonitoring(channel.id);
          logger.info(`✅ Started monitoring channel: ${channel.channel_name}`);
        } catch (channelError) {
          logger.error(`Failed to start monitoring channel ${channel.id}:`, {
            message: channelError?.message || channelError,
            channel: channel.channel_name
          });
        }
      }
    } catch (dbError) {
      logger.error('Database connection failed:', {
        message: dbError?.message || dbError,
        stack: dbError?.stack
      });
    }
  }

  /**
   * Universal monitoring starter - detects admin status and chooses method
   * @param {string} channelId - Channel ID from database
   */
  async startMonitoring(channelId) {
    try {
      const supabase = require('../database/supabase');
      
      // Get channel configuration
      const { data: channel, error } = await supabase
        .from('channels')
        .select('*')
        .eq('id', channelId)
        .single();
      
      if (error || !channel) {
        throw new Error(`Channel ${channelId} not found`);
      }

      if (this.activeMonitors.has(channelId)) {
        logger.warn(`Channel ${channelId} is already being monitored`);
        return;
      }

      // Determine monitoring method based on platform and admin status
      const monitoringMethod = await this.determineMonitoringMethod(channel);
      
      await this.startChannelMonitoring(channel, monitoringMethod);
      
      logger.info(`✅ Started ${monitoringMethod} monitoring for: ${channel.channel_name}`);
      
    } catch (error) {
      logger.error(`Failed to start monitoring for channel ${channelId}:`, {
        message: error?.message || error
      });
      throw error;
    }
  }

  /**
   * Determine the best monitoring method for a channel
   * @param {Object} channel - Channel configuration
   * @returns {string} - Monitoring method ('bot_api', 'client_api', 'pull')
   */
  async determineMonitoringMethod(channel) {
    try {
      const supabase = require('../database/supabase');
      
      switch (channel.platform) {
        case 'telegram':
          // Check admin status if not already known
          if (channel.admin_status === null || channel.admin_status === undefined) {
            await this.updateChannelAdminStatus(channel);
            // Reload channel with updated admin status
            const { data: updatedChannel } = await supabase
              .from('channels')
              .select('admin_status')
              .eq('id', channel.id)
              .single();
            channel.admin_status = updatedChannel?.admin_status;
          }

          // Prefer bot API if admin, client API if available, fall back to pull
          if (channel.admin_status && this.telegramMonitor) {
            return 'bot_api';
          } else if (this.clientMonitorActive) {
            return 'client_api';
          } else {
            return 'pull';
          }
        
        case 'eitaa':
          return this.eitaaMonitor ? 'eitaa_api' : 'pull';
        
        case 'website':
        case 'rss':
          return 'pull';
        
        default:
          logger.warn(`Unknown platform: ${channel.platform}, defaulting to pull`);
          return 'pull';
      }
    } catch (error) {
      logger.error(`Error determining monitoring method for channel ${channel.id}:`, error);
      return 'pull'; // Fallback to pull monitoring
    }
  }

  /**
   * Start channel monitoring with specified method
   * @param {Object} channel - Channel configuration
   * @param {string} method - Monitoring method
   */
  async startChannelMonitoring(channel, method) {
    let monitorInstance = null;
    let monitorConfig = { method, startTime: Date.now() };
    
    try {
      const supabase = require('../database/supabase');
      
      switch (method) {
        case 'bot_api':
          if (!this.telegramMonitor) {
            throw new Error('Telegram bot monitor not available');
          }
          await this.telegramMonitor.startMonitoringChannel(channel);
          monitorInstance = this.telegramMonitor;
          break;
        
        case 'client_api':
          if (!this.clientMonitorActive) {
            throw new Error('Telegram client monitor not available');
          }
          // Client monitoring is handled globally, just mark as active
          monitorInstance = { type: 'client_monitor' };
          break;
        
        case 'eitaa_api':
          if (!this.eitaaMonitor) {
            throw new Error('Eitaa monitor not available');
          }
          await this.eitaaMonitor.monitorChannel(channel);
          monitorInstance = this.eitaaMonitor;
          break;
        
        case 'pull':
          await this.pullMonitoringService.startPolling(channel);
          monitorInstance = this.pullMonitoringService;
          break;
        
        default:
          throw new Error(`Unsupported monitoring method: ${method}`);
      }
      
      // Update channel monitoring method in database
      await supabase
        .from('channels')
        .update({ 
          monitoring_method: method,
          last_checked: new Date().toISOString() 
        })
        .eq('id', channel.id);
      
      this.activeMonitors.set(channel.id, {
        monitor: monitorInstance,
        config: monitorConfig,
        channel: channel
      });
      
    } catch (error) {
      logger.error(`Failed to start ${method} monitoring for channel ${channel.id}:`, error);
      throw error;
    }
  }

  /**
   * Update admin status for a Telegram channel
   * @param {Object} channel - Channel configuration
   */
  async updateChannelAdminStatus(channel) {
    try {
      if (channel.platform !== 'telegram' || !this.telegramMonitor?.bot) {
        return;
      }

      const supabase = require('../database/supabase');
      const chatId = this.extractChatId(channel.channel_url);
      if (!chatId) {
        logger.warn(`Cannot extract chat ID from URL: ${channel.channel_url}`);
        return;
      }

      try {
        const botId = await this.telegramMonitor.bot.getMe().then(me => me.id);
        const member = await this.telegramMonitor.bot.getChatMember(chatId, botId);
        const isAdmin = ['administrator', 'creator'].includes(member.status);
        
        // Update database
        await supabase
          .from('channels')
          .update({ admin_status: isAdmin })
          .eq('id', channel.id);
        
        logger.info(`Updated admin status for ${channel.channel_name}: ${isAdmin}`);
      } catch (apiError) {
        logger.warn(`Could not check admin status for ${channel.channel_name}:`, apiError.message);
        // Set as non-admin if we can't check
        await supabase
          .from('channels')
          .update({ admin_status: false })
          .eq('id', channel.id);
      }
    } catch (error) {
      logger.error(`Error updating admin status for channel ${channel.id}:`, error);
    }
  }

  /**
   * Handle admin status change for a channel
   * @param {string} chatId - Chat ID
   * @param {boolean} isAdmin - New admin status
   */
  async handleAdminStatusChange(chatId, isAdmin) {
    try {
      const supabase = require('../database/supabase');
      
      // Find channel by chat ID
      const { data: channel } = await supabase
        .from('channels')
        .select('*')
        .eq('channel_url', chatId)
        .eq('platform', 'telegram')
        .single();
      
      if (!channel) {
        logger.warn(`No channel found for chat ID: ${chatId}`);
        return;
      }

      // Update admin status in database
      await supabase
        .from('channels')
        .update({ admin_status: isAdmin })
        .eq('id', channel.id);
      
      // Switch monitoring method if channel is active
      if (channel.is_active && this.activeMonitors.has(channel.id)) {
        logger.info(`Admin status changed for ${channel.channel_name}, switching monitoring method`);
        
        // Stop current monitoring
        await this.stopMonitoring(channel.id);
        
        // Start with new method
        await this.startMonitoring(channel.id);
      }
      
    } catch (error) {
      logger.error(`Error handling admin status change for ${chatId}:`, error);
    }
  }

  /**
   * Stop monitoring for a channel
   * @param {string} channelId - Channel ID
   */
  async stopMonitoring(channelId) {
    if (!channelId) {
      throw new Error('Channel ID is required');
    }

    if (!this.activeMonitors.has(channelId)) {
      logger.warn(`Channel ${channelId} is not being monitored`);
      return;
    }

    try {
      const monitorData = this.activeMonitors.get(channelId);
      const { monitor, config, channel } = monitorData;

      // Stop monitoring based on method
      switch (config.method) {
        case 'bot_api':
          if (this.telegramMonitor) {
            await this.telegramMonitor.stopMonitoringChannel(channelId);
          }
          break;
        case 'client_api':
          // Client monitoring is global, nothing specific to stop
          break;
        case 'eitaa_api':
          if (this.eitaaMonitor) {
            await this.eitaaMonitor.stopMonitoringChannel(channelId);
          }
          break;
        case 'pull':
          if (this.pullMonitoringService) {
            this.pullMonitoringService.stopPolling(channelId);
          }
          break;
      }

      this.activeMonitors.delete(channelId);
      logger.info(`✅ Stopped ${config.method} monitoring for channel: ${channelId}`);
      
    } catch (error) {
      logger.error(`Error stopping monitoring for ${channelId}:`, {
        message: error?.message || error
      });
      // Still remove from active monitors even if stop failed
      this.activeMonitors.delete(channelId);
      throw error;
    }
  }

  /**
   * Legacy method name for compatibility
   */
  async startMonitoringChannel(channel) {
    if (typeof channel === 'string') {
      // If channel ID is passed, load from database
      return await this.startMonitoring(channel);
    } else {
      // If channel object is passed, get its ID
      return await this.startMonitoring(channel.id);
    }
  }

  /**
   * Legacy method name for compatibility
   */
  async stopMonitoringChannel(channelId) {
    return await this.stopMonitoring(channelId);
  }

  /**
   * Extract chat ID from various Telegram URL formats
   * @param {string} url - Channel URL
   * @returns {string} - Chat ID
   */
  extractChatId(url) {
    if (!url) return null;
    
    if (url.startsWith('@')) {
      return url;
    }
    
    if (url.includes('t.me/')) {
      const match = url.match(/t\.me\/([^/\s]+)/);
      if (match) {
        return `@${match[1]}`;
      }
    }
    
    // Assume numeric ID or @username
    return url;
  }

  /**
   * Get comprehensive monitoring status
   * @param {string} userId - Optional user ID for filtering
   * @returns {Object} - Monitoring status
   */
  getMonitoringStatus(userId = null) {
    const activeChannels = [];
    const methodStats = { bot_api: 0, client_api: 0, eitaa_api: 0, pull: 0 };
    
    for (const [channelId, monitorData] of this.activeMonitors.entries()) {
      const { config, channel } = monitorData;
      
      if (!userId || channel.user_id === userId) {
        activeChannels.push({
          channelId,
          channelName: channel.channel_name,
          platform: channel.platform,
          method: config.method,
          startTime: config.startTime,
          status: 'active'
        });
        
        methodStats[config.method] = (methodStats[config.method] || 0) + 1;
      }
    }

    return {
      initialized: this.initialized,
      services: {
        telegramBot: this.telegramMonitor ? 'active' : 'inactive',
        telegramClient: this.clientMonitorActive ? 'active' : 'inactive',
        eitaaMonitor: this.eitaaMonitor ? 'active' : 'inactive',
        newsScraper: this.newsScraper ? 'active' : 'inactive',
        pullMonitoring: this.pullMonitoringService ? 'active' : 'inactive',
        discovery: this.telegramDiscoveryService ? 'active' : 'inactive',
        autoPromotion: this.autoPromotionService ? 'active' : 'inactive'
      },
      monitoring: {
        totalActiveChannels: activeChannels.length,
        methodBreakdown: methodStats,
        activeChannels
      }
    };
  }

  /**
   * Shutdown all monitoring
   */
  async shutdown() {
    logger.info('Shutting down Enhanced Monitoring Manager...');
    
    try {
      // Stop auto-promotion service
      if (this.autoPromotionService) {
        this.autoPromotionService.stop();
        logger.info('✅ Auto-promotion service stopped');
      }

      // Stop all active monitors
      const stopPromises = [];
      for (const [channelId] of this.activeMonitors.entries()) {
        stopPromises.push(
          this.stopMonitoring(channelId).catch(error => {
            logger.error(`Error stopping channel ${channelId}:`, error?.message || error);
          })
        );
      }
      
      await Promise.allSettled(stopPromises);
      this.activeMonitors.clear();

      // Stop pull monitoring service
      if (this.pullMonitoringService) {
        this.pullMonitoringService.stopAllPolling();
      }

      // Stop client monitor
      if (this.clientMonitorActive) {
        try {
          const { stopClientMonitor } = require('../bots/clientMonitor');
          await stopClientMonitor();
          this.clientMonitorActive = false;
          logger.info('✅ Client monitor stopped');
        } catch (error) {
          logger.error('Error shutting down client monitor:', {
            message: error?.message || error
          });
        }
      }

      // Shutdown individual monitors
      if (this.telegramMonitor && typeof this.telegramMonitor.shutdown === 'function') {
        try {
          await this.telegramMonitor.shutdown();
        } catch (error) {
          logger.error('Error shutting down telegram monitor:', error?.message || error);
        }
      }

      if (this.eitaaMonitor && typeof this.eitaaMonitor.shutdown === 'function') {
        try {
          await this.eitaaMonitor.shutdown();
        } catch (error) {
          logger.error('Error shutting down eitaa monitor:', error?.message || error);
        }
      }

      this.initialized = false;
      logger.info('✅ Enhanced Monitoring Manager shutdown complete');
      
    } catch (error) {
      logger.error('Error during monitoring manager shutdown:', {
        message: error?.message || error,
        stack: error?.stack
      });
    }
  }
}

module.exports = new MonitoringManager();