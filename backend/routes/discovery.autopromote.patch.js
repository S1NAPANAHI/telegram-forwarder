// Enhanced Discovery Routes - Phase: Auto-promotion
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { supabase } = require('../database/supabase');
const TelegramDiscoveryService = require('../services/TelegramDiscoveryService');
const monitoringManager = require('../services/monitoringManager');
const logger = require('../utils/logger');

const discoveryService = new TelegramDiscoveryService();

async function getUserAutoPromote(userId) {
  try {
    const { data } = await supabase.from('users').select('auto_promote_admin').eq('id', userId).maybeSingle();
    return data?.auto_promote_admin !== false; // default true
  } catch { return true; }
}

async function autoPromoteAdminChats(userId) {
  const auto = await getUserAutoPromote(userId);
  if (!auto) return { promoted: 0 };

  // Get discovered admin chats not yet in channels
  const { data: discovered } = await supabase
    .from('discovered_chats')
    .select('chat_id, chat_title, is_admin')
    .eq('user_id', userId)
    .eq('is_admin', true);

  if (!discovered || discovered.length === 0) return { promoted: 0 };

  let promoted = 0;
  for (const chat of discovered) {
    // Skip if already a channel for this user
    const { data: existing } = await supabase
      .from('channels')
      .select('id')
      .eq('user_id', userId)
      .eq('channel_url', chat.chat_id)
      .maybeSingle();
    if (existing) continue;

    // Create channel
    const { data: newChannel, error } = await supabase
      .from('channels')
      .insert({
        user_id: userId,
        platform: 'telegram',
        channel_url: chat.chat_id,
        channel_name: chat.chat_title || chat.chat_id,
        monitoring_method: 'bot_api',
        admin_status: true,
        discovery_source: 'auto_discovered',
        is_active: true
      })
      .select('*')
      .single();

    if (!error && newChannel) {
      promoted += 1;
      try {
        if (monitoringManager && typeof monitoringManager.startMonitoringChannel === 'function') {
          await monitoringManager.startMonitoringChannel(newChannel);
        }
      } catch (e) {
        logger.warn('Auto-promote: failed to start monitoring', e?.message || e);
      }
    }
  }
  return { promoted };
}

// PATCH existing POST /api/discovery/scan to include auto-promote
router.post('/scan', authMiddleware, async (req, res) => {
  try {
    logger.info('POST /discovery/scan (auto-promote) - User ID:', req.user.id);

    const discoveredChats = await discoveryService.discoverAllChats(req.user.id);

    const { promoted } = await autoPromoteAdminChats(req.user.id);

    const summary = {
      total_discovered: discoveredChats.length,
      admin_chats: discoveredChats.filter(c => c.is_admin).length,
      member_chats: discoveredChats.filter(c => !c.is_admin).length,
      bot_api_chats: discoveredChats.filter(c => c.discovery_method === 'bot_api').length,
      client_api_chats: discoveredChats.filter(c => c.discovery_method === 'client_api').length,
      auto_promoted: promoted
    };

    res.json({ success: true, message: 'Discovery + auto-promotion completed', summary, chats: discoveredChats });
  } catch (err) {
    logger.error('POST /discovery/scan error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to scan for chats', message: err.message });
  }
});

module.exports = router;
