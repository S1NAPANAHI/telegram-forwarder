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

async function resolveUserIdFromUpdate(bot, evt) {
  // Try 1: sender telegram id
  if (evt.fromId) {
    try { const u = await UserService.getByTelegramId(evt.fromId); if (u?.id) return { userId: u.id, via: 'sender' }; } catch {}
  }
  // Try 2: channel ownership
  try { const { data: ch } = await supabase.from('channels').select('user_id').eq('channel_url', evt.chatId).maybeSingle(); if (ch?.user_id) return { userId: ch.user_id, via: 'channel_owner' }; } catch {}
  // Try 3: discovered ownership
  try { const { data: dc } = await supabase.from('discovered_chats').select('user_id').eq('chat_id', evt.chatId).order('last_discovered', { ascending: false }).maybeSingle(); if (dc?.user_id) return { userId: dc.user_id, via: 'discovered_owner' }; } catch {}
  // Try 4: single-user fallback
  try { const { data: users } = await supabase.from('users').select('id').limit(2); if (Array.isArray(users) && users.length === 1) return { userId: users[0].id, via: 'single_user' }; } catch {}
  return { userId: null, via: 'none' };
}

function normalizeEvent(raw) {
  // Only accept 'message' and 'channel_post' shape; bail out for others
  const msg = raw || {};
  const chat = msg.chat || {};
  if (!chat.id || !['group','supergroup','channel'].includes(chat.type)) return null;
  const fromId = msg.from && msg.from.id ? msg.from.id : null;
  return { chatId: chat.id.toString(), chatType: chat.type, fromId, title: chat.title || chat.first_name || 'Chat', username: chat.username || null };
}

module.exports = function attachPassiveAutoPromote(bot, monitoredChannels) {
  const cd = new ChatDiscoveryService(bot);

  async function handler(raw) {
    try {
      const evt = normalizeEvent(raw);
      if (!evt) return; // ignore unsupported update types

      // Resolve user context
      const { userId, via } = await resolveUserIdFromUpdate(bot, evt);

      // Check admin
      let isAdmin = false;
      try { const me = await bot.getMe(); const member = await bot.getChatMember(evt.chatId, me.id); isAdmin = ['administrator','creator'].includes(member.status); } catch {}

      // Save discovered only with userId
      if (userId) {
        try {
          await supabase.from('discovered_chats').upsert({ user_id: userId, chat_id: evt.chatId, chat_type: evt.chatType, chat_title: evt.title, chat_username: evt.username, is_admin: isAdmin, discovery_method: 'bot_api', last_discovered: new Date().toISOString() }, { onConflict: 'user_id,chat_id' });
        } catch (e) { console.warn('Error saving discovered chat (guarded):', e?.message || e); }
      } else {
        console.log('Skip discovered save: no user_id (resolution via:', via, ') for chat', evt.chatId);
      }

      // Auto-promote if possible
      if (!userId || !isAdmin) return;
      const auto = await shouldAutoPromote(userId); if (!auto) return;
      const channelId = await ensureChannelForUser(userId, { id: evt.chatId, title: evt.title }, isAdmin);
      if (channelId) {
        monitoredChannels.set(evt.chatId, { channelId, userId, name: evt.title });
        console.log('Auto-promoted and monitoring:', evt.chatId, 'for user', userId);
      }
    } catch (err) {
      console.error('Passive auto-promote error:', err?.message || err);
    }
  }

  bot.on('message', handler);
  bot.on('channel_post', handler);
};