const TelegramBot = require('node-telegram-bot-api');
const UserService = require('../services/UserService');
const KeywordService = require('../services/KeywordService');
const ChannelService = require('../services/ChannelService');
const DestinationService = require('../services/DestinationService');
const LoggingService = require('../services/LoggingService');
const ChatDiscoveryService = require('../services/ChatDiscoveryService');
const TelegramDiscoveryService = require('../services/TelegramDiscoveryService');
const attachPassiveAutoPromote = require('./passiveAutoPromote');
const { forwardMessage, checkDuplicate } = require('../services/forwardingService');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://frontend-service-51uy.onrender.com';
const WEBAPP_URL = `${FRONTEND_URL}/webapp`;

// ... file content remains unchanged above

      // Register passive discovery on webhook updates
      this.registerPassiveDiscovery();

      // Attach passive auto-promote (admin chats become monitored automatically)
      try { attachPassiveAutoPromote(this.bot, this.monitoredChannels); } catch {}

      console.log('Telegram Monitor initialized (webhook mode)');
// ... rest of file remains unchanged
