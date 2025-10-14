const TelegramMonitor = require('../bots/telegramBot');
const EitaaMonitor = require('../bots/eitaaBot');
const NewsScraper = require('../scraper/newsScraper');
const supabase = require('../database/supabase');

class MonitoringManager {
  constructor() {
    this.telegramMonitor = new TelegramMonitor();
    this.eitaaMonitor = new EitaaMonitor();
    this.newsScraper = new NewsScraper();
    this.activeMonitors = new Map();
  }

  async initialize() {
    console.log('Initializing Monitoring Manager...');
    
    try {
      // Initialize Telegram monitor (critical)
      await this.telegramMonitor.initialize();
    } catch (error) {
      console.error('Failed to initialize Telegram Monitor:', error);
      // Don't throw - let the app continue without Telegram monitoring
    }
    
    try {
      // Initialize Eitaa monitor (optional)
      await this.eitaaMonitor.initialize();
    } catch (error) {
      console.error('Failed to initialize Eitaa Monitor:', error);
      // Don't throw - continue without Eitaa monitoring
    }

    try {
      // Try to get active channels, but don't fail if database is unavailable
      const { data: activeChannels, error } = await supabase
        .from('channels')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching active channels:', error.message);
        console.log('Continuing without pre-configured channels');
      } else {
        for (const channel of activeChannels || []) {
          try {
            await this.startMonitoringChannel(channel);
          } catch (channelError) {
            console.error(`Failed to start monitoring channel ${channel.id}:`, channelError);
            // Continue with other channels
          }
        }
      }
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      console.log('Monitoring Manager initialized without database connection');
    }
    
    console.log('Monitoring Manager initialized.');
  }

  async startMonitoringChannel(channel) {
    if (this.activeMonitors.has(channel.id)) {
      console.log(`Channel ${channel.id} is already being monitored.`);
      return;
    }

    let monitorInstance;
    try {
      switch (channel.platform) {
        case 'telegram':
          await this.telegramMonitor.startMonitoringChannel(channel);
          monitorInstance = this.telegramMonitor;
          break;
        case 'eitaa':
          await this.eitaaMonitor.monitorChannel(channel);
          monitorInstance = this.eitaaMonitor;
          break;
        case 'website':
          await this.newsScraper.monitorNewsWebsite(channel);
          monitorInstance = this.newsScraper;
          break;
        default:
          console.warn(`Unsupported platform for monitoring: ${channel.platform}`);
          return;
      }
      this.activeMonitors.set(channel.id, monitorInstance);
      console.log(`Started monitoring for channel: ${channel.channel_name} (${channel.platform})`);
    } catch (error) {
      console.error(`Failed to start monitoring for channel ${channel.channel_name}:`, error);
      // Don't throw - continue with other channels
    }
  }

  async stopMonitoringChannel(channelId) {
    if (!this.activeMonitors.has(channelId)) {
      console.log(`Channel ${channelId} is not currently being monitored.`);
      return;
    }

    try {
      const { data: channel, error } = await supabase
        .from('channels')
        .select('platform')
        .eq('id', channelId)
        .single();

      if (error) {
        console.error('Error fetching channel for stopping monitoring:', error.message);
        // Continue anyway - just remove from active monitors
      } else if (channel) {
        switch (channel.platform) {
          case 'telegram':
            await this.telegramMonitor.stopMonitoringChannel(channelId);
            break;
          case 'eitaa':
            await this.eitaaMonitor.stopMonitoringChannel(channelId);
            break;
          case 'website':
            // No specific stop needed for website scraper
            break;
        }
      }

      this.activeMonitors.delete(channelId);
      console.log(`Stopped monitoring for channel ID: ${channelId}`);
    } catch (error) {
      console.error(`Error stopping monitoring for channel ${channelId}:`, error);
      // Still remove from active monitors
      this.activeMonitors.delete(channelId);
    }
  }

  getMonitoringStatus(userId) {
    const status = [];
    for (const [channelId, monitorInstance] of this.activeMonitors.entries()) {
      status.push({ channelId, status: 'active' });
    }
    return status;
  }
}

module.exports = new MonitoringManager();