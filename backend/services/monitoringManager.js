const TelegramMonitor = require('../bots/telegramBot');
const EitaaMonitor = require('../bots/eitaaBot');
const NewsScraper = require('../scraper/newsScraper');
const Channel = require('../models/Channel');

// این کلاس وظیفه مدیریت کلیه فرآیندهای مانیتورینگ را بر عهده دارد
class MonitoringManager {
  constructor() {
    // نمونه‌سازی از مانیتورهای مختلف
    this.telegramMonitor = new TelegramMonitor();
    this.eitaaMonitor = new EitaaMonitor();
    this.newsScraper = new NewsScraper();
    // یک Map برای نگهداری مانیتورهای فعال بر اساس شناسه کانال
    this.activeMonitors = new Map();
  }

  // متد راه‌اندازی اولیه مدیر مانیتورینگ
  async initialize() {
    console.log('Initializing Monitoring Manager...');
    await this.telegramMonitor.initialize();
    await this.eitaaMonitor.initialize();

    // بارگذاری و شروع مانیتورینگ تمام کانال‌های فعال از پایگاه داده در زمان شروع به کار برنامه
    const activeChannels = await Channel.find({ isActive: true });
    for (const channel of activeChannels) {
      await this.startMonitoringChannel(channel);
    }
    console.log('Monitoring Manager initialized.');
  }

  // شروع مانیتورینگ یک کانال خاص
  async startMonitoringChannel(channel) {
    // اگر کانال در حال حاضر در حال مانیتور شدن است، از ادامه کار جلوگیری کن
    if (this.activeMonitors.has(channel._id.toString())) {
      console.log(`Channel ${channel._id} is already being monitored.`);
      return;
    }

    let monitorInstance;
    // بر اساس پلتفرم کانال، مانیتور مناسب را انتخاب کن
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
    // اضافه کردن مانیتور به لیست مانیتورهای فعال
    this.activeMonitors.set(channel._id.toString(), monitorInstance);
    console.log(`Started monitoring for channel: ${channel.channelName} (${channel.platform})`);
  }

  // توقف مانیتورینگ یک کانال خاص
  async stopMonitoringChannel(channelId) {
    // اگر کانال در حال مانیتور شدن نیست، از ادامه کار جلوگیری کن
    if (!this.activeMonitors.has(channelId)) {
      console.log(`Channel ${channelId} is not currently being monitored.`);
      return;
    }

    const monitorInstance = this.activeMonitors.get(channelId);
    const channel = await Channel.findById(channelId);

    if (channel) {
        // بر اساس پلتفرم، متد توقف مناسب را فراخوانی کن
        switch (channel.platform) {
            case 'telegram':
                await this.telegramMonitor.stopMonitoringChannel(channelId);
                break;
            case 'eitaa':
                await this.eitaaMonitor.stopMonitoringChannel(channelId);
                break;
            case 'website':
                // برای وب‌سایت‌ها منطق توقف وجود ندارد زیرا اسکرپ یک‌باره است
                break;
        }
    }

    // حذف مانیتور از لیست مانیتورهای فعال
    this.activeMonitors.delete(channelId);
    console.log(`Stopped monitoring for channel ID: ${channelId}`);
  }

  // دریافت وضعیت مانیتورینگ کانال‌ها
  getMonitoringStatus(userId) {
    // این یک بررسی وضعیت ساده شده است
    const status = [];
    for (const [channelId, monitorInstance] of this.activeMonitors.entries()) {
        status.push({ channelId, status: 'active' });
    }
    return status;
  }
}

module.exports = new MonitoringManager(); // Export a singleton instance