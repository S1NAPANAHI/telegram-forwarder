const TelegramBot = require('node-telegram-bot-api');
const UserService = require('../services/UserService');
const ChatDiscoveryService = require('../services/ChatDiscoveryService');
const { supabase } = require('../database/supabase');

async function shouldAutoPromote(userId) {
  try { const { data } = await supabase.from('users').select('auto_promote_admin').eq('id', userId).maybeSingle(); return data?.auto_promote_admin !== false; } catch { return true; }
}

async function ensureChannelForUser(userId, chat, isAdmin) {
  const chatId = chat?.id?.toString(); if (!chatId || !userId) return null;
  const name = chat.title || chat.first_name || 'Chat';
  const { data: existing } = await supabase.from('channels').select('id').eq('user_id', userId).eq('channel_url', chatId).maybeSingle();
  if (existing?.id) return existing.id;
  const { data: newCh, error } = await supabase.from('channels').insert({ user_id: userId, platform: 'telegram', channel_url: chatId, channel_name: name, monitoring_method: isAdmin ? 'bot_api' : 'client_api', admin_status: !!isAdmin, discovery_source: 'auto_discovered', is_active: true }).select('id').single();
  if (error) { console.warn('ensureChannelForUser insert failed:', error.message); return null; }
  return newCh?.id || null;
}

async function resolveUserIdFromUpdate(bot, msg) {
  // 1) sender telegram id
  try { if (msg && msg.from && msg.from.id) { const u = await UserService.getByTelegramId(msg.from.id); if (u?.id) return u.id; } } catch {}
  const chatId = msg?.chat?.id?.toString();
  // 2) channel ownership
  if (chatId) {
    try { const { data: ch } = await supabase.from('channels').select('user_id').eq('channel_url', chatId).maybeSingle(); if (ch?.user_id) return ch.user_id; } catch {}
  }
  // 3) discovered ownership
  if (chatId) {
    try { const { data: dc } = await supabase.from('discovered_chats').select('user_id').eq('chat_id', chatId).order('last_discovered', { ascending: false }).maybeSingle(); if (dc?.user_id) return dc.user_id; } catch {}
  }
  // 4) single-user instance fallback (safe default for one-user setups)
  try {
    const { data: users } = await supabase.from('users').select('id').limit(2);
    if (Array.isArray(users) && users.length === 1) return users[0].id;
  } catch {}
  return null;
}

module.exports = function attachPassiveAutoPromote(bot, monitoredChannels) {
  const cd = new ChatDiscoveryService(bot);

  async function upsertAndPromote(raw) {
    try {
      // raw can be message or channel_post
      const msg = raw || {};
      const chat = msg.chat || {};
      if (!chat.id || !['group','supergroup','channel'].includes(chat.type)) return;

      const userId = await resolveUserIdFromUpdate(bot, msg);

      // Check admin
      let isAdmin = false;
      try { const me = await bot.getMe(); const member = await bot.getChatMember(chat.id, me.id); isAdmin = ['administrator','creator'].includes(member.status); } catch {}

      // Save discovered only when userId is known
      if (userId) {
        try {
          await supabase.from('discovered_chats').upsert({ user_id: userId, chat_id: chat.id.toString(), chat_type: chat.type, chat_title: chat.title || chat.first_name || 'Chat', chat_username: chat.username || null, is_admin: isAdmin, discovery_method: 'bot_api', last_discovered: new Date().toISOString() }, { onConflict: 'user_id,chat_id' });
        } catch (e) { console.warn('Error saving discovered chat (guarded):', e?.message || e); }
      }

      // Auto-promote only when we have userId and admin
      if (!userId || !isAdmin) return;
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