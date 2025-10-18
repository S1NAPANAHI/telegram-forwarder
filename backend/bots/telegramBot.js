const TelegramBot = require('node-telegram-bot-api');
const UserService = require('../services/UserService');
const KeywordService = require('../services/KeywordService');
const ChannelServiceInstance = new (require('../services/ChannelService'))();
const DestinationService = require('../services/DestinationService');
const LoggingService = require('../services/LoggingService');
const ChatDiscoveryService = require('../services/ChatDiscoveryService');
const TelegramDiscoveryService = require('../services/TelegramDiscoveryService');
const ForwardingEnhancer = require('../services/ForwardingEnhancer');
const IDResolutionService = require('../services/IDResolutionService'); // Import new service
const attachPassiveAutoPromote = require('./passiveAutoPromote');
const { forwardMessage, checkDuplicate } = require('../services/forwardingService');
const chatIdResolver = require('../utils/chatIdResolver');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://frontend-service-51uy.onrender.com';
const WEBAPP_URL = `${FRONTEND_URL}/webapp`;

// Simple i18n
const i18n = {
  en: {
    welcome: (name) => `🎉 Welcome to Telegram Forwarder Bot, ${name}!\n\nUse /help for all commands or visit the dashboard to configure.`,
    welcome_group: (name) => `🎉 Hi ${name}! I'm now monitoring this chat.\n\n📝 Dashboard: ${WEBAPP_URL}\n\nUse /help for commands.`,
    help: '🆘 Help\n\n/start – Start\n/help – This help\n/status – Bot and your config status\n/webapp – Open management panel\n/menu – Quick actions\n/discover – Scan chats and admin status\n/language – Change language\n/ping – Test bot response\n/add_destination <@username|link|ID> - Add a forwarding destination\n/destinations - List your forwarding destinations',
    status: (count) => `📊 Bot Status\n\nMonitored Channels: ${count}\nUpdated: ${new Date().toLocaleString()}`,
    webapp: '🌐 Open the management Web App:',
    webapp_link: `🌐 Dashboard: ${WEBAPP_URL}`,
    quick: '🎛️ Quick Actions',
    discover_start: '🔍 Starting discovery scan... This may take a moment.',
    discover_summary: (g, c, adminG, adminC) => `🔎 Discovery Summary\n\nGroups: ${g} (admin in ${adminG})\nChannels: ${c} (admin in ${adminC})`,
    language_prompt: (cur) => `🌐 Language\n\nCurrent: ${cur.toUpperCase()}\nChoose a language:`,
    lang_changed: (lang) => `✅ Language changed to ${lang.toUpperCase()}`,
    btn_webapp: '🌐 Open Web App',
    btn_help: '❓ Help',
    btn_status: '📊 Status',
    btn_discover: '🔍 Discover',
    btn_en: 'English',
    btn_fa: 'فارسی'
  },
  fa: {
    welcome: (name) => `🎉 به ربات فوروارد تلگرام خوش آمدی، ${name}!\n\nبرای تنظیمات از داشبورد استفاده کنید.`,
    welcome_group: (name) => `🎉 سلام ${name}! من الان این چت رو زیر نظر دارم.\n\n📝 داشبورد: ${WEBAPP_URL}\n\nبرای دستورات /help رو بزن.`,
    help: '🆘 راهنما\n\n/start – شروع\n/help – این راهنما\n/status – وضعیت ربات و تنظیمات شما\n/webapp – باز کردن پنل مدیریت\n/menu – اقدامات سریع\n/discover – اسکن چت‌ها و سطح دسترسی ادمین\n/language – تغییر زبان\n/ping – تست پاسخ ربات\n/add_destination <@username|link|ID> - افزودن مقصد فوروارد\n/destinations - لیست مقصدهای فوروارد شما',
    status: (count) => `📊 وضعیت ربات\n\nکانال‌های تحت نظارت: ${count}\nبه‌روزرسانی: ${new Date().toLocaleString('fa-IR')}`,
    webapp: '🌐 پنل مدیریت را باز کن:',
    webapp_link: `🌐 داشبورد: ${WEBAPP_URL}`,
    quick: '🎛️ اقدامات سریع',
    discover_start: '🔍 شروع اسکن... چند لحظه صبر کنید.',
    discover_summary: (g, c, adminG, adminC) => `🔎 خلاصه کشف\n\nگروه‌ها: ${g} (ادمین در ${adminG})\nکانال‌ها: ${c} (ادمین در ${adminC})`,
    language_prompt: (cur) => `🌐 زبان\n\nفعلی: ${cur.toUpperCase()}\nیکی را انتخاب کنید:`,
    lang_changed: (lang) => `✅ زبان به ${lang.toUpperCase()} تغییر کرد`,
    btn_webapp: '🌐 وب‌اپ',
    btn_help: '❓ راهنما',
    btn_status: '📊 وضعیت',
    btn_discover: '🔍 کشف',
    btn_en: 'English',
    btn_fa: 'فارسی'
  }
};

async function getUserLang(userId) {
  try { 
    const u = await UserService.getByTelegramId?.(userId); 
    const lang = (u?.lang || u?.language || 'en').toLowerCase(); 
    return ['en','fa'].includes(lang) ? lang : 'en'; 
  } catch { 
    return 'en'; 
  }
}

async function setUserLang(userId, lang) { 
  try { 
    await UserService.createOrUpdateUser({ telegram_id: userId, lang }); 
  } catch (e) {
    console.error('Error setting user language:', e.message);
  }
}

// Helper to get user's internal ID from Telegram ID
async function getUserId(telegramId) {
  if (!telegramId) return null;
  let user = await UserService.getByTelegramId(telegramId);
  if (!user) {
    // If user doesn't exist, create a placeholder or handle as error
    user = await UserService.createOrUpdateUser({ telegram_id: telegramId });
  }
  return user?.id;
}

// Get or create a default admin user for bot operations
async function getOrCreateDefaultUser() {
  try {
    const supabase = require('../database/supabase');
    
    // Try to find an existing admin user
    const { data: existingUsers } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (existingUsers && existingUsers.length > 0) {
      return existingUsers[0].id;
    }
    
    // Create a default admin user for bot operations
    const { data: newUser } = await supabase
      .from('users')
      .insert({
        username: 'telegram_bot_admin',
        telegram_id: 'bot_admin',
        is_active: true,
        registered_via: 'system'
      })
      .select('id')
      .single();
    
    return newUser?.id;
  } catch (error) {
    console.error('Error getting/creating default user:', error.message);
    return null;
  }
}

class TelegramMonitor {
  static instance = null;

  constructor() {
    if (TelegramMonitor.instance) return TelegramMonitor.instance;
    this.webhookUrl = process.env.TELEGRAM_WEBHOOK_URL || 'https://backend-service-idry.onrender.com/api/bot/webhook';
    this.bot = null;
    this.monitoredChannels = new Map();
    this.chatDiscovery = null;
    this.telegramDiscoveryService = null;
    this.defaultUserId = null;
    this.forwardingEnhancer = null;
    TelegramMonitor.instance = this;
  }

  async initialize() {
    try {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      if (!token) { 
        console.warn('TELEGRAM_BOT_TOKEN missing; TelegramMonitor disabled'); 
        return; 
      }

      // Get or create default user for bot operations
      this.defaultUserId = await getOrCreateDefaultUser();
      console.log('Default bot user ID:', this.defaultUserId);

      this.bot = new TelegramBot(token, { polling: false });
      this.chatDiscovery = new ChatDiscoveryService(this.bot);
      this.telegramDiscoveryService = new TelegramDiscoveryService();
      
      // Initialize enhanced forwarding pipeline
      this.forwardingEnhancer = new ForwardingEnhancer(require('../database/supabase'), this.bot);

      // Set bot instance for chat ID resolver
      chatIdResolver.setBotInstance(this.bot);

      this.setupCommandHandlers();

      try { 
        const me = await this.bot.getMe(); 
        console.log(`Telegram bot connected: @${me.username}`); 
      } catch (e) { 
        console.error('getMe failed:', e?.message || e); 
      }

      try { 
        await this.bot.deleteWebHook({ drop_pending_updates: false }); 
      } catch {}

      try { 
        await this.bot.setWebHook(this.webhookUrl); 
        console.log('Webhook set OK →', this.webhookUrl); 
      } catch (e) { 
        console.error('setWebHook failed:', e?.message || e); 
      }

      try {
        await this.bot.setMyCommands([
          { command: 'start', description: 'Start using the bot' },
          { command: 'help', description: 'Show help and available commands' },
          { command: 'status', description: 'Bot status and health' },
          { command: 'webapp', description: 'Open management panel' },
          { command: 'menu', description: 'Show quick action buttons' },
          { command: 'discover', description: 'Scan chats and report admin status' },
          { command: 'language', description: 'Change language' },
          { command: 'ping', description: 'Test bot response' }
        ]);
      } catch (e) {
        console.error('Error setting bot commands:', e.message);
      }

      try { 
        await this.bot.setChatMenuButton({ 
          menu_button: { 
            type: 'web_app', 
            text: 'Open Panel', 
            web_app: { url: WEBAPP_URL } 
          } 
        }); 
      } catch (e) {
        console.error('Error setting chat menu button:', e.message);
      }

      try { 
        const channels = await ChannelServiceInstance.getActiveChannelsByPlatform('telegram'); 
        for (const channel of channels) {
          await this.startMonitoringChannel(channel); 
        }
      } catch (e) { 
        console.error('Channel load failed:', e?.message || e); 
      }

      this.bot.on('message', (msg) => this.onMessage(msg));
      this.bot.on('channel_post', (post) => this.onChannelPost(post));

      this.registerPassiveDiscovery();
      attachPassiveAutoPromote(this.bot, this.monitoredChannels);

      console.log('Telegram Monitor initialized (webhook mode)');
    } catch (error) {
      console.error('TelegramMonitor initialize error:', error?.message || error);
    }
  }

  registerPassiveDiscovery() {
    const upsertDiscovered = async (chat, userId = null) => {
      try {
        if (!chat || chat.type === 'private') return;
        
        // Use default user ID if no specific user ID provided
        const targetUserId = userId || this.defaultUserId;
        if (!targetUserId) {
          console.warn('No user ID available for passive discovery');
          return;
        }
        
        const data = { 
          chat_id: chat.id.toString(), 
          chat_type: chat.type, 
          title: chat.title || chat.first_name || null, 
          username: chat.username || null 
        };
        
        const supabase = require('../database/supabase');
        const me = await this.bot.getMe();
        let isAdmin = false;
        
        if (['group','supergroup','channel'].includes(chat.type)) {
          try { 
            const member = await this.bot.getChatMember(chat.id, me.id); 
            isAdmin = ['administrator','creator'].includes(member.status); 
            console.log(`Admin check for ${chat.id}: ${member.status} (admin: ${isAdmin})`);
          } catch (e) {
            console.warn('Error checking admin status:', e.message);
          }
        }
        
        // Use consistent column names (is_admin, is_member)
        await supabase.from('discovered_chats').upsert({ 
          user_id: targetUserId, 
          chat_id: data.chat_id, 
          chat_type: data.chat_type, 
          chat_title: data.title, 
          chat_username: data.username, 
          is_admin: isAdmin, 
          is_member: true,
          discovery_method: 'bot_api', 
          last_discovered: new Date().toISOString() 
        }, { onConflict: 'user_id,chat_id' });
        
        console.log(`✅ Discovered chat saved: ${data.title} (${data.chat_type})`);
        
      } catch (e) { 
        console.error('Error saving discovered chat (guarded):', e.message); 
      }
    };
    
    this.bot.on('message', async (msg) => { 
      let userId = null; 
      try { 
        if (msg.from && msg.from.id) { 
          const user = await UserService.getByTelegramId(msg.from.id); 
          userId = user?.id; 
        } 
      } catch (e) {
        console.error('Error finding channel owner:', e.message);
      } 
      await upsertDiscovered(msg.chat, userId); 
    });
    
    this.bot.on('channel_post', async (post) => { 
      await upsertDiscovered(post.chat);
    });
  }

  setupCommandHandlers() {
    // Store user's telegram_id on /start for DM notifications  
    this.bot.onText(/^\/start\b/i, async (msg) => { 
      try {
        const lang = await getUserLang(msg.from?.id); 
        const t = i18n[lang]; 
        const userName = msg.from?.first_name || 'User';
        const isPrivateChat = msg.chat.type === 'private';
        
        // Store user's telegram_id for DM notifications
        if (msg.from?.id) {
          try {
            await UserService.createOrUpdateUser({
              telegram_id: msg.from.id,
              username: msg.from.username,
              first_name: msg.from.first_name,
              last_name: msg.from.last_name,
              language: lang
            });
            console.log(`✅ Stored user telegram_id ${msg.from.id} for DM notifications`);
          } catch (e) {
            console.error('Error storing user telegram_id:', e.message);
          }
        }
        
        if (isPrivateChat) {
          // Private chat: Use web_app button
          const keyboard = { 
            inline_keyboard: [
              [{ text: t.btn_webapp, web_app: { url: WEBAPP_URL } }],
              [{ text: t.btn_help, callback_data: 'help' }, { text: t.btn_status, callback_data: 'status' }],
              [{ text: t.btn_discover, callback_data: 'discover' }]
            ] 
          }; 
          
          await this.bot.sendMessage(msg.chat.id, t.welcome(userName), { reply_markup: keyboard }); 
        } else {
          // Group/channel: Use simple callback buttons and text link
          const keyboard = { 
            inline_keyboard: [
              [{ text: t.btn_help, callback_data: 'help' }, { text: t.btn_status, callback_data: 'status' }],
              [{ text: t.btn_discover, callback_data: 'discover' }]
            ] 
          }; 
          
          await this.bot.sendMessage(msg.chat.id, t.welcome_group(userName), { reply_markup: keyboard }); 
        }
      } catch (e) { 
        console.error('/start error:', e?.message || e); 
        if (e instanceof AggregateError) {
          for (const err of e.errors) {
            console.error('  - AggregateError detail:', err?.message || err);
          }
        }
        try { 
          await this.bot.sendMessage(msg.chat.id, '👋 Bot is online and ready!'); 
        } catch (sendError) {
          console.error('Error sending fallback message:', sendError?.message || sendError);
        } 
      } 
    });
    
    this.bot.onText(/^\/ping\b/i, async (msg) => { 
      try { 
        await this.bot.sendMessage(msg.chat.id, '🏓 pong'); 
      } catch (e) { 
        console.error('/ping error:', e?.message || e); 
      } 
    });
    
    this.bot.onText(/^\/help\b/i, async (msg) => { 
      try { 
        const lang = await getUserLang(msg.from?.id); 
        const t = i18n[lang]; 
        await this.bot.sendMessage(msg.chat.id, t.help); 
      } catch (e) { 
        console.error('/help error:', e?.message || e); 
        try { 
          await this.bot.sendMessage(msg.chat.id, '🆘 Commands: /start /help /status /webapp /discover /ping'); 
        } catch {} 
      } 
    });
    
    this.bot.onText(/^\/status\b/i, async (msg) => { 
      try { 
        const lang = await getUserLang(msg.from?.id); 
        const t = i18n[lang]; 
        await this.bot.sendMessage(msg.chat.id, t.status(this.monitoredChannels.size)); 
      } catch (e) { 
        console.error('/status error:', e?.message || e); 
      } 
    });
    
    this.bot.onText(/^\/webapp\b/i, async (msg) => { 
      try { 
        const lang = await getUserLang(msg.from?.id); 
        const t = i18n[lang]; 
        const isPrivateChat = msg.chat.type === 'private';
        
        if (isPrivateChat) {
          await this.bot.sendMessage(msg.chat.id, t.webapp, { 
            reply_markup: { 
              inline_keyboard: [[{ text: t.btn_webapp, web_app: { url: WEBAPP_URL } }]] 
            } 
          });
        } else {
          await this.bot.sendMessage(msg.chat.id, t.webapp_link);
        }
      } catch (e) { 
        console.error('/webapp error:', e?.message || e); 
      } 
    });
    
    this.bot.onText(/^\/menu\b/i, async (msg) => { 
      try { 
        const lang = await getUserLang(msg.from?.id); 
        const t = i18n[lang]; 
        const isPrivateChat = msg.chat.type === 'private';
        
        if (isPrivateChat) {
          await this.bot.sendMessage(msg.chat.id, t.quick, { 
            reply_markup: { 
              inline_keyboard: [
                [{ text: t.btn_webapp, web_app: { url: WEBAPP_URL } }],
                [{ text: t.btn_status, callback_data: 'status' }, { text: t.btn_help, callback_data: 'help' }],
                [{ text: t.btn_discover, callback_data: 'discover' }]
              ] 
            } 
          }); 
        } else {
          await this.bot.sendMessage(msg.chat.id, t.quick, { 
            reply_markup: { 
              inline_keyboard: [
                [{ text: t.btn_status, callback_data: 'status' }, { text: t.btn_help, callback_data: 'help' }],
                [{ text: t.btn_discover, callback_data: 'discover' }]
              ] 
            } 
          }); 
        }
      } catch (e) { 
        console.error('/menu error:', e?.message || e); 
      } 
    });

    this.bot.onText(/^\/discover\b/i, async (msg) => {
      const userId = await getUserId(msg.from.id);
      const chatId = msg.chat.id;
      
      if (!userId) {
        await this.bot.sendMessage(chatId, '❌ Discovery failed. Please start a private chat with the bot first.');
        return;
      }

      try {
        await this.bot.sendMessage(chatId, '🔍 Scanning for chats...', { parse_mode: 'HTML' });
        
        // Run comprehensive discovery
        const discovered = await this.telegramDiscoveryService.discoverChatsViaUpdates(userId);
        const existing = await this.telegramDiscoveryService.getDiscoveredChats(userId);
        
        // Auto-promote admin chats
        const promoted = await this.telegramDiscoveryService.autoPromoteAdminChats(userId);
        
        let response = this.telegramDiscoveryService.formatDiscoveryResponse(existing);
        if (promoted.length > 0) {
            response += `\n✅ Auto-promoted ${promoted.length} admin chats to monitoring.`;
        }
        
        await this.bot.sendMessage(chatId, response, { parse_mode: 'HTML' });
        
      } catch (error) {
          console.error('Discovery command error:', error);
          await this.bot.sendMessage(chatId, '❌ Discovery failed. Please try again.', { parse_mode: 'HTML' });
      }
    });

    // Add destination command
    this.bot.onText(/^\/add_destination (.+)/, async (msg, match) => {
        const userId = await getUserId(msg.from.id);
        const chatId = msg.chat.id;
        const input = match[1].trim();
        
        if (!userId) {
          await this.bot.sendMessage(chatId, '❌ Failed to add destination. Please start a private chat with the bot first.');
          return;
        }

        try {
            await this.bot.sendMessage(chatId, '🔍 Resolving destination...', { parse_mode: 'HTML' });
            
            const destinationService = new DestinationService();
            const result = await destinationService.addDestinationWithResolution(userId, input);
            
            if (result.success) {
                let response = `✅ <b>Destination Added!</b>\n\n`;
                response += `📌 <b>Name:</b> ${result.chatInfo.title}\n`;
                response += `🆔 <b>ID:</b> <code>${result.chatInfo.id}</code>\n`;
                response += `📱 <b>Type:</b> ${result.chatInfo.type}\n`;
                
                if (result.chatInfo.username) {
                    response += `👤 <b>Username:</b> @${result.chatInfo.username}\n`;
                }
                
                if (result.warnings.length > 0) {
                    response += `\n⚠️ <b>Warnings:</b>\n`;
                    result.warnings.forEach(warning => {
                        response += `• ${warning}\n`;
                    });
                }
                
                await this.bot.sendMessage(chatId, response, { parse_mode: 'HTML' });
            } else {
                await this.bot.sendMessage(chatId, `❌ Failed to add destination: ${result.error}`, { parse_mode: 'HTML' });
            }
            
        } catch (error) {
            console.error('Add destination error:', error);
            await this.bot.sendMessage(chatId, '❌ Failed to add destination. Please try again.', { parse_mode: 'HTML' });
        }
    });

    // List destinations command
    this.bot.onText(/^\/destinations/, async (msg) => {
        const userId = await getUserId(msg.from.id);
        const chatId = msg.chat.id;
        
        if (!userId) {
          await this.bot.sendMessage(chatId, '❌ Failed to fetch destinations. Please start a private chat with the bot first.');
          return;
        }

        try {
            const destinationService = new DestinationService();
            const destinations = await destinationService.getUserDestinations(userId, false);
            
            if (destinations.length === 0) {
                await this.bot.sendMessage(chatId, '📝 No destinations configured yet.\n\nUse /add_destination < @username|link|ID> to add one.', { parse_mode: 'HTML' });
                return;
            }
            
            let response = `📋 <b>Your Destinations (${destinations.length})</b>\n\n`;
            
            destinations.forEach((dest, index) => {
                const status = dest.is_active ? '🟢' : '🔴';
                response += `${status} <b>${dest.name}</b>\n`;
                response += `   ID: <code>${dest.chat_id}</code>\n`;
                response += `   Platform: ${dest.platform}\n\n`;
            });
            
            await this.bot.sendMessage(chatId, response, { parse_mode: 'HTML' });
            
        } catch (error) {
            console.error('List destinations error:', error);
            await this.bot.sendMessage(chatId, '❌ Failed to fetch destinations.', { parse_mode: 'HTML' });
        }
    });
  }

    this.bot.onText(/^\/language\b/i, async (msg) => { 
      try { 
        const lang = await getUserLang(msg.from?.id); 
        const t = i18n[lang]; 
        await this.bot.sendMessage(msg.chat.id, t.language_prompt(lang), { 
          reply_markup: { 
            inline_keyboard: [[{ text: i18n.en.btn_en, callback_data: 'lang_en' }, { text: i18n.fa.btn_fa, callback_data: 'lang_fa' }]] 
          } 
        }); 
      } catch (e) { 
        console.error('/language error:', e?.message || e); 
      } 
    });

    this.bot.on('callback_query', async (cb) => { 
      const data = cb.data; 
      try { 
        await this.bot.answerCallbackQuery(cb.id); 
      } catch {} 
      
      try { 
        if (data === 'help') { 
          const lang = await getUserLang(cb.from?.id); 
          const t = i18n[lang]; 
          await this.bot.sendMessage(cb.message.chat.id, t.help); 
        } else if (data === 'status') { 
          const lang = await getUserLang(cb.from?.id); 
          const t = i18n[lang]; 
          await this.bot.sendMessage(cb.message.chat.id, t.status(this.monitoredChannels.size)); 
        } else if (data === 'discover') { 
          const lang = await getUserLang(cb.from?.id); 
          try { 
            await this.bot.sendMessage(cb.message.chat.id, '🔍 Scanning...'); 
            let user; 
            if (cb.from?.id) {
              user = await UserService.getByTelegramId(cb.from.id); 
              if (!user) { 
                user = await UserService.createOrUpdateUser({ 
                  telegram_id: cb.from.id, 
                  username: cb.from.username, 
                  first_name: cb.from.first_name, 
                  language: lang 
                }); 
              } 
            } else {
              console.warn('Cannot discover chats: cb.from.id is undefined.');
              await this.bot.sendMessage(cb.message.chat.id, '❌ Discovery failed. Please try the /discover command from a private chat with the bot.');
              return;
            }
            await this.telegramDiscoveryService.probeKnownChannels(user.id); 
            const chats = await this.telegramDiscoveryService.getDiscoveredChats(user.id); 
            const response = this.telegramDiscoveryService.formatDiscoveryResponse(chats); 
            await this.bot.sendMessage(cb.message.chat.id, response, { parse_mode: 'HTML' }); 
          } catch (err) { 
            console.error('Discovery callback error:', err); 
            await this.bot.sendMessage(cb.message.chat.id, '❌ Discovery failed. Please try the /discover command.'); 
          } 
        } else if (data === 'lang_en' || data === 'lang_fa') { 
          const lang = data === 'lang_en' ? 'en' : 'fa'; 
          await setUserLang(cb.from?.id, lang); 
          const t = i18n[lang]; 
          await this.bot.sendMessage(cb.message.chat.id, t.lang_changed(lang)); 
        } 
      } catch (e) { 
        console.error('callback error:', e?.message || e); 
      } 
    });
  }

  async startMonitoringChannel(channel) { 
    try { 
      const chatId = channel.platform_specific_id || channel.chat_id || this.extractChatIdFromUrl(channel.channel_url); 
      if (!chatId) return; 
      
      this.monitoredChannels.set(chatId.toString(), { 
        channelId: channel.id, 
        userId: channel.user_id, 
        name: channel.name || channel.channel_name,
        channel: channel
      }); 
      
      console.log(`Monitoring: ${channel.channel_name} (${chatId})`); 
    } catch (e) { 
      console.error('startMonitoringChannel error:', e?.message || e); 
    } 
  }

  async stopMonitoringChannel(channelId) { 
    this.monitoredChannels.delete(channelId.toString()); 
  }

  extractChatIdFromUrl(url) { 
    if (!url) return ''; 
    if (url.includes('t.me/+')) return url; 
    if (url.includes('t.me/')) return '@' + url.split('/').pop(); 
    return url; 
  }

  extractText(u) { 
    return (u.text || u.caption || '').toString().trim(); 
  }

  // Use ForwardingEnhancer pipeline instead of direct forwarding
  async onMessage(msg) { 
    try { 
      if (this.chatDiscovery) await this.chatDiscovery.processUpdate(msg); 
      
      const info = this.monitoredChannels.get(msg.chat.id.toString()); 
      if (!info) return; 
      
      console.log(`📨 Processing message from monitored channel: ${info.name}`);
      
      // Use enhanced pipeline for multi-channel forwarding
      if (this.forwardingEnhancer) {
        await this.forwardingEnhancer.handleIncomingMessage(msg, info.userId, info.channel);
      }
    } catch (e) { 
      console.error('onMessage error:', e?.message || e); 
    } 
  }

  async onChannelPost(post) { 
    try { 
      if (this.chatDiscovery) await this.chatDiscovery.processUpdate(post); 
      
      const info = this.monitoredChannels.get(post.chat.id.toString()); 
      if (!info) return; 
      
      console.log(`📢 Processing channel post from: ${info.name}`);
      
      // Use enhanced pipeline for multi-channel forwarding
      if (this.forwardingEnhancer) {
        await this.forwardingEnhancer.handleIncomingMessage(post, info.userId, info.channel);
      }
    } catch (e) { 
      console.error('onChannelPost error:', e?.message || e); 
    } 
  }

  getChatDiscovery() { 
    return this.chatDiscovery; 
  }

  getTelegramDiscoveryService() { 
    return this.telegramDiscoveryService; 
  }

  async shutdown() { 
    try { 
      if (this.bot) { 
        await this.bot.deleteWebHook(); 
        console.log('Telegram bot webhook deleted'); 
      } 
    } catch (e) { 
      console.error('Error during telegram bot shutdown:', e?.message || e); 
    } 
  }
}

module.exports = TelegramMonitor;