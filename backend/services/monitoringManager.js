const winston = require('winston');

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
    this.activeMonitors = new Map();
    this.clientMonitorActive = false;
    this.initialized = false;
  }

  async initialize() {
    logger.info('Initializing Monitoring Manager...');

    try {
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
      try {
        const supabase = require('../database/supabase');
        const { data: activeChannels, error } = await supabase
          .from('channels')
          .select('*')
          .eq('is_active', true);
        
        if (error) {
          logger.error('Error fetching active channels:', error.message);
        } else if (activeChannels && activeChannels.length > 0) {
          for (const channel of activeChannels) {
            try {
              await this.startMonitoringChannel(channel);
              logger.info(`✅ Started monitoring channel: ${channel.channel_name}`);
            } catch (channelError) {
              logger.error(`Failed to start monitoring channel ${channel.id}:`, {
                message: channelError?.message || channelError,
                channel: channel.channel_name
              });
            }
          }
        } else {
          logger.info('No active channels found to monitor');
        }
      } catch (dbError) {
        logger.error('Database connection failed:', {
          message: dbError?.message || dbError,
          stack: dbError?.stack
        });
      }

      this.initialized = true;
      logger.info('✅ Monitoring Manager initialized successfully');
      
    } catch (error) {
      logger.error('Critical error during Monitoring Manager initialization:', {
        message: error?.message || error,
        stack: error?.stack
      });
      throw error;
    }
  }

  async startMonitoringChannel(channel) {
    if (!channel || !channel.id) {
      throw new Error('Invalid channel object provided');
    }

    if (this.activeMonitors.has(channel.id)) {
      logger.warn(`Channel ${channel.id} is already being monitored`);
      return;
    }

    let monitorInstance = null;
    
    try {
      switch (channel.platform) {
        case 'telegram':
          if (!this.telegramMonitor) {
            throw new Error('Telegram monitor not available');
          }
          await this.telegramMonitor.startMonitoringChannel(channel);
          monitorInstance = this.telegramMonitor;
          break;
        
        case 'eitaa':
          if (!this.eitaaMonitor) {
            throw new Error('Eitaa monitor not available');
          }
          await this.eitaaMonitor.monitorChannel(channel);
          monitorInstance = this.eitaaMonitor;
          break;
        
        case 'website':
          if (!this.newsScraper) {
            throw new Error('News scraper not available');
          }
          await this.newsScraper.monitorNewsWebsite(channel);
          monitorInstance = this.newsScraper;
          break;
        
        default:
          throw new Error(`Unsupported platform for monitoring: ${channel.platform}`);
      }
      
      if (monitorInstance) {
        this.activeMonitors.set(channel.id, monitorInstance);
        logger.info(`✅ Started monitoring: ${channel.channel_name} (${channel.platform})`);
      }
      
    } catch (error) {
      logger.error(`Failed to start monitoring for channel ${channel.channel_name}:`, {
        message: error?.message || error,
        platform: channel.platform,
        channelId: channel.id
      });
      throw error;
    }
  }

  async stopMonitoringChannel(channelId) {
    if (!channelId) {
      throw new Error('Channel ID is required');
    }

    if (!this.activeMonitors.has(channelId)) {
      logger.warn(`Channel ${channelId} is not being monitored`);
      return;
    }

    try {
      // Get channel info from database to determine platform
      const supabase = require('../database/supabase');
      const { data: channel } = await supabase
        .from('channels')
        .select('platform, channel_name')
        .eq('id', channelId)
        .maybeSingle();

      if (channel) {
        switch (channel.platform) {
          case 'telegram':
            if (this.telegramMonitor) {
              await this.telegramMonitor.stopMonitoringChannel(channelId);
            }
            break;
          case 'eitaa':
            if (this.eitaaMonitor) {
              await this.eitaaMonitor.stopMonitoringChannel(channelId);
            }
            break;
          case 'website':
            if (this.newsScraper) {
              await this.newsScraper.stopMonitoringChannel(channelId);
            }
            break;
        }
      }

      this.activeMonitors.delete(channelId);
      logger.info(`✅ Stopped monitoring ID: ${channelId}`);
      
    } catch (error) {
      logger.error(`Error stopping monitoring for ${channelId}:`, {
        message: error?.message || error
      });
      // Still remove from active monitors even if stop failed
      this.activeMonitors.delete(channelId);
      throw error;
    }
  }

  getMonitoringStatus(userId = null) {
    const status = [];
    
    for (const [channelId, monitorInstance] of this.activeMonitors.entries()) {
      status.push({ 
        channelId, 
        status: 'active', 
        type: monitorInstance ? monitorInstance.constructor.name : 'unknown'
      });
    }

    return {
      initialized: this.initialized,
      botMonitor: this.telegramMonitor ? 'active' : 'inactive',
      clientMonitor: this.clientMonitorActive ? 'active' : 'inactive',
      eitaaMonitor: this.eitaaMonitor ? 'active' : 'inactive',
      newsScraper: this.newsScraper ? 'active' : 'inactive',
      activeChannelsCount: this.activeMonitors.size,
      activeChannels: status
    };
  }

  async shutdown() {
    logger.info('Shutting down Monitoring Manager...');
    
    try {
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

      // Stop all active monitors
      const stopPromises = [];
      for (const [channelId] of this.activeMonitors.entries()) {
        stopPromises.push(
          this.stopMonitoringChannel(channelId).catch(error => {
            logger.error(`Error stopping channel ${channelId}:`, error?.message || error);
          })
        );
      }
      
      await Promise.allSettled(stopPromises);
      this.activeMonitors.clear();

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
      logger.info('✅ Monitoring Manager shutdown complete');
      
    } catch (error) {
      logger.error('Error during monitoring manager shutdown:', {
        message: error?.message || error,
        stack: error?.stack
      });
    }
  }
}

module.exports = new MonitoringManager();