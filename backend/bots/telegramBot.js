const TelegramBot = require('node-telegram-bot-api');
const UserService = require('../services/UserService');
const KeywordService = require('../services/KeywordService');
const ChannelService = require('../services/ChannelService');
const DestinationService = require('../services/DestinationService');
const LoggingService = require('../services/LoggingService');
const ChatDiscoveryService = require('../services/ChatDiscoveryService');
const { forwardMessage, checkDuplicate } = require('../services/forwardingService');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://frontend-service-51uy.onrender.com';
const WEBAPP_URL = `${FRONTEND_URL}/webapp`;

// ... strings and helpers unchanged ...

class TelegramMonitor {
  constructor() {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { 
      polling: true,
      onlyFirstMatch: false
    });
    this.monitoredChannels = new Map();
    this.chatDiscovery = new ChatDiscoveryService(this.bot);
    this.setupCommandHandlers();
    this.setupMessageHandlers();
  }

  // ... other methods unchanged ...

  async initialize() {
    try {
      const botInfo = await this.bot.getMe();
      console.log(`Telegram bot connected: @${botInfo.username}`);

      // 1) Native Telegram commands menu
      try {
        await this.bot.setMyCommands([
          { command: 'start', description: 'Start using the bot' },
          { command: 'help', description: 'Show help and available commands' },
          { command: 'status', description: 'Bot status and health' },
          { command: 'webapp', description: 'Open management panel' },
          { command: 'language', description: 'Change language' },
          { command: 'discover', description: 'Scan chats and update admin status' },
          { command: 'menu', description: 'Show quick action buttons' }
        ]);
        console.log('✓ Registered bot commands');
      } catch (e) {
        console.error('Failed to set bot commands:', e?.message || e);
      }

      // 2) Chat menu button (keeps web app entry)
      try {
        await this.bot.setChatMenuButton({ 
          menu_button: { type: 'web_app', text: 'Open Panel', web_app: { url: WEBAPP_URL } } 
        });
        console.log('✓ Set chat menu button to Web App');
      } catch (e) { console.error('Failed to set menu button:', e?.message || e); }

      console.log('⚠️  IMPORTANT: Ensure bot privacy mode is disabled in BotFather (/setprivacy → Disable) to read group messages.');

      // Load monitored channels
      let channels = [];
      try { channels = await ChannelService.getActiveChannelsByPlatform('telegram'); }
      catch (e) { console.error('Error fetching channels:', e); }

      for (const channel of channels) {
        await this.startMonitoringChannel(channel);
      }

      console.log('Telegram Monitor initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Telegram Monitor:', error);
    }
  }

  setupCommandHandlers() {
    // existing command handlers ...

    // NEW: /menu quick-reply keyboard
    this.bot.onText(/\/menu/, async (msg) => {
      const chatId = msg.chat.id;
      const keyboard = {
        keyboard: [
          [{ text: '/help' }, { text: '/status' }],
          [{ text: '/discover' }, { text: '/webapp' }],
          [{ text: '/language' }]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      };
      await this.safeSend(chatId, 'Choose an action:', { reply_markup: keyboard });
    });
  }

  // ... rest unchanged ...
}

module.exports = TelegramMonitor;
