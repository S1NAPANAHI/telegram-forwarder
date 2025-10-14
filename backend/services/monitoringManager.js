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
    await this.telegramMonitor.initialize();
    await this.eitaaMonitor.initialize();

    const { data: activeChannels, error } = await supabase
      .from('channels')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching active channels:', error.message);
      throw new Error(error.message);
    }

    for (const channel of activeChannels) {
      await this.startMonitoringChannel(channel);
    }
    console.log('Monitoring Manager initialized.');
  }

  async startMonitoringChannel(channel) {
    if (this.activeMonitors.has(channel.id)) {
      console.log(`Channel ${channel.id} is already being monitored.`);
      return;
    }

    let monitorInstance;
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
  }

  async stopMonitoringChannel(channelId) {
    if (!this.activeMonitors.has(channelId)) {
      console.log(`Channel ${channelId} is not currently being monitored.`);
      return;
    }

    const monitorInstance = this.activeMonitors.get(channelId);
    const { data: channel, error } = await supabase
      .from('channels')
      .select('platform')
      .eq('id', channelId)
      .single();

    if (error) {
      console.error('Error fetching channel for stopping monitoring:', error.message);
      throw new Error(error.message);
    }

    if (channel) {
        switch (channel.platform) {
            case 'telegram':
                await this.telegramMonitor.stopMonitoringChannel(channelId);
                break;
            case 'eitaa':
                await this.eitaaMonitor.stopMonitoringChannel(channelId);
                break;
            case 'website':
                break;
        }
    }

    this.activeMonitors.delete(channelId);
    console.log(`Stopped monitoring for channel ID: ${channelId}`);
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