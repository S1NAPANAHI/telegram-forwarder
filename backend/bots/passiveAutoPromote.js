const TelegramBot = require('node-telegram-bot-api');
const UserService = require('../services/UserService');
const ChatDiscoveryService = require('../services/ChatDiscoveryService');
const { supabase } = require('../database/supabase');

async function shouldAutoPromote(userId) {
  try { const { data } = await supabase.from('users').select('auto_promote_admin').eq('id', userId).maybeSingle(); return data?.auto_promote_admin !== false; } catch { return true; }
}

async function ensureChannelForUser(userId, chat, isAdmin) {
  const chatId = chat?.id?.toString(); if (!chatId) return null;
  const name = chat.title || chat.first_name || 'Chat';
  const { data: existing } = await supabase.from('channels').select('id').eq('user_id', userId).eq('channel_url', chatId).maybeSingle();
  if (existing) return existing.id;
  const { data: newCh, error } = await supabase.from('channels').insert({ user_id: userId, platform: 'telegram', channel_url: chatId, channel_name: name, monitoring_method: isAdmin ? 'bot_api' : 'client_api', admin_status: !!isAdmin, discovery_source: 'auto_discovered', is_active: true }).select('id').single();
  if (error) { console.warn('ensureChannelForUser insert failed:', error.message); return null; }
  return newCh?.id || null;
}

// Resolve a user context to attach discovered/promoted data
async function resolveUserIdFromUpdate(bot, msg) {
  // 1) Prefer sender's telegram_id mapping
  if (msg?.from?.id) {
    const u = await UserService.getByTelegramId(msg.from.id).catch(() => null);
    if (u?.id) return u.id;
  }
  // 2) Fallback: see if this chat already tied to a channel -> user_id
  const chatId = msg?.chat?.id?.toString();
  if (chatId) {
    const { data: ch } = await supabase.from('channels').select('user_id').eq('channel_url', chatId).maybeSingle();
    if (ch?.user_id) return ch.user_id;
  }
  // 3) Fallback: discovered_chats row with any user_id
  if (chatId) {
    const { data: dc } = await supabase.from('discovered_chats').select('user_id').eq('chat_id', chatId).order('last_discovered', { ascending: false }).maybeSingle();
    if (dc?.user_id) return dc.user_id;
  }
  return null;
}

module.exports = function attachPassiveAutoPromote(bot, monitoredChannels) {
  const cd = new ChatDiscoveryService(bot);

  async function upsertAndPromote(msg) {
    try {
      const chat = msg?.chat; if (!chat) return;
      if (!['group','supergroup','channel'].includes(chat.type)) return;

      // Resolve user_id robustly
      const userId = await resolveUserIdFromUpdate(bot, msg);
      
      // Save discovered row (with or without user_id)
      try {
        const me = await bot.getMe();
        let isAdmin = false;
        try { const member = await bot.getChatMember(chat.id, me.id); isAdmin = ['administrator','creator'].includes(member.status); } catch {}
        if (userId) {
          await supabase.from('discovered_chats').upsert({ user_id: userId, chat_id: chat.id.toString(), chat_type: chat.type, chat_title: chat.title || chat.first_name || 'Chat', chat_username: chat.username || null, is_admin: isAdmin, discovery_method: 'bot_api', last_discovered: new Date().toISOString() }, { onConflict: 'user_id,chat_id' });
        } else {
          // store without user_id is not allowed due to NOT NULL; skip DB write, but still proceed to try linking via channel
        }
      } catch (e) {
        console.warn('Error saving discovered chat:', e?.message || e);
      }

      if (!userId) return; // cannot promote without a user context

      // Auto-promote if enabled
      const auto = await shouldAutoPromote(userId);
      if (!auto) return;

      const me = await bot.getMe();
      let isAdmin = false;
      try { const member = await bot.getChatMember(chat.id, me.id); isAdmin = ['administrator','creator'].includes(member.status); } catch {}
      if (!isAdmin) return;

      const channelId = await ensureChannelForUser(userId, chat, isAdmin);
      if (channelId) {
        monitoredChannels.set(chat.id.toString(), { channelId, userId, name: chat.title || 'Chat' });
        console.log('Auto-promoted and monitoring:', chat.id, 'for user', userId);
      }
    } catch (err) {
      console.error('Passive auto-promote error:', err?.message || err);
    }
  }

  bot.on('message', upsertAndPromote);
  bot.on('channel_post', upsertAndPromote);
};