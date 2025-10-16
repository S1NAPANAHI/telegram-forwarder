const TelegramBot = require('node-telegram-bot-api');
const UserService = require('../services/UserService');
const ChatDiscoveryService = require('../services/ChatDiscoveryService');
const TelegramDiscoveryService = require('../services/TelegramDiscoveryService');
const { supabase } = require('../database/supabase');

// helper to get auto_promote setting
async function shouldAutoPromote(userId) {
  try {
    const { data } = await supabase.from('users').select('auto_promote_admin').eq('id', userId).maybeSingle();
    return data?.auto_promote_admin !== false; // default true
  } catch {
    return true;
  }
}

async function ensureChannelForUser(userId, chat, isAdmin) {
  // Idempotent: create channels row if missing
  const chatId = chat.id?.toString();
  const name = chat.title || chat.first_name || 'Chat';
  const { data: existing } = await supabase
    .from('channels')
    .select('id')
    .eq('user_id', userId)
    .eq('channel_url', chatId)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: newCh, error } = await supabase
    .from('channels')
    .insert({
      user_id: userId,
      platform: 'telegram',
      channel_url: chatId,
      channel_name: name,
      monitoring_method: isAdmin ? 'bot_api' : 'client_api',
      admin_status: !!isAdmin,
      discovery_source: 'auto_discovered',
      is_active: true
    })
    .select('id')
    .single();
  if (error) throw error;
  return newCh.id;
}

module.exports = function attachPassiveAutoPromote(bot, monitoredChannels) {
  async function upsertAndPromote(msg) {
    const chat = msg?.chat; if (!chat) return;
    if (!['group','supergroup','channel'].includes(chat.type)) return; // ignore private chats

    // Try to resolve user via telegram sender
    let user = null;
    try { user = await UserService.getByTelegramId(msg.from?.id); } catch {}
    if (!user) return; // we need a user context to promote under

    // Save discovered
    const cd = new ChatDiscoveryService(bot);
    await cd.processUpdate(msg);

    // Check admin
    const me = await bot.getMe();
    let isAdmin = false;
    try {
      const member = await bot.getChatMember(chat.id, me.id);
      isAdmin = ['administrator','creator'].includes(member.status);
    } catch {}

    // Auto-promote if setting enabled and admin
    const auto = await shouldAutoPromote(user.id);
    if (!auto || !isAdmin) return;

    const channelId = await ensureChannelForUser(user.id, chat, isAdmin);
    // Register in monitored map immediately
    if (channelId) {
      monitoredChannels.set(chat.id.toString(), { channelId, userId: user.id, name: chat.title || 'Chat' });
      console.log('Auto-promoted and monitoring:', chat.id, 'for user', user.id);
    }
  }

  bot.on('message', upsertAndPromote);
  bot.on('channel_post', upsertAndPromote);
};