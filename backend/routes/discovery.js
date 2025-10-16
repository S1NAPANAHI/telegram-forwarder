// Enhanced Discovery Routes - Phase 1.1 & 3.2
// Comprehensive chat discovery API endpoints with filtering and management

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { supabase } = require('../database/supabase');
const TelegramDiscoveryService = require('../services/TelegramDiscoveryService');
const monitoringManager = require('../services/monitoringManager');
const logger = require('../utils/logger');

// Initialize discovery service
const discoveryService = new TelegramDiscoveryService();

// GET /api/discovery - Get all discovered chats with enhanced filtering
router.get('/', authMiddleware, async (req, res) => {
  try {
    logger.info('GET /discovery - User ID:', req.user.id);
    
    const { 
      admin_only, 
      member_only, 
      type, 
      not_promoted, 
      discovery_method,
      search 
    } = req.query;
    
    const filters = {
      adminOnly: admin_only === 'true',
      chatType: type,
      notPromoted: not_promoted === 'true'
    };
    
    let chats = await discoveryService.getDiscoveredChats(req.user.id, filters);
    
    // Additional filtering
    if (member_only === 'true') {
      chats = chats.filter(chat => !chat.is_admin);
    }
    
    if (discovery_method) {
      chats = chats.filter(chat => chat.discovery_method === discovery_method);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      chats = chats.filter(chat => 
        chat.chat_title?.toLowerCase().includes(searchLower) ||
        chat.chat_username?.toLowerCase().includes(searchLower)
      );
    }
    
    logger.info(`GET /discovery - Found ${chats.length} chats`);
    res.json({
      success: true,
      chats: chats,
      total: chats.length,
      summary: {
        admin_chats: chats.filter(c => c.is_admin).length,
        member_chats: chats.filter(c => !c.is_admin).length,
        promoted: chats.filter(c => c.is_promoted).length,
        not_promoted: chats.filter(c => !c.is_promoted).length
      }
    });
  } catch (err) {
    logger.error('GET /discovery error:', err.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch discovered chats',
      message: err.message 
    });
  }
});

// POST /api/discovery/scan - Trigger full chat discovery
router.post('/scan', authMiddleware, async (req, res) => {
  try {
    logger.info('POST /discovery/scan - User ID:', req.user.id);
    
    // Trigger comprehensive chat discovery
    const discoveredChats = await discoveryService.discoverAllChats(req.user.id);
    
    const summary = {
      total_discovered: discoveredChats.length,
      admin_chats: discoveredChats.filter(c => c.is_admin).length,
      member_chats: discoveredChats.filter(c => !c.is_admin).length,
      bot_api_chats: discoveredChats.filter(c => c.discovery_method === 'bot_api').length,
      client_api_chats: discoveredChats.filter(c => c.discovery_method === 'client_api').length
    };
    
    logger.info(`Discovery scan complete for user ${req.user.id}: ${summary.total_discovered} chats`);
    
    res.json({
      success: true,
      message: 'Chat discovery completed successfully',
      summary: summary,
      chats: discoveredChats
    });
  } catch (err) {
    logger.error('POST /discovery/scan error:', err.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to scan for chats',
      message: err.message 
    });
  }
});

// GET /api/discovery/status - Get discovery status and statistics
router.get('/status', authMiddleware, async (req, res) => {
  try {
    logger.info('GET /discovery/status - User ID:', req.user.id);
    
    const { data: chats, error } = await supabase
      .from('discovered_chats')
      .select('*')
      .eq('user_id', req.user.id);
    
    if (error) {
      throw error;
    }
    
    const { data: channels, error: channelsError } = await supabase
      .from('channels')
      .select('*')
      .eq('user_id', req.user.id);
    
    if (channelsError) {
      throw channelsError;
    }
    
    const status = {
      discovered_chats: chats?.length || 0,
      admin_chats: chats?.filter(c => c.is_admin).length || 0,
      member_chats: chats?.filter(c => !c.is_admin).length || 0,
      promoted_chats: chats?.filter(c => c.is_promoted).length || 0,
      active_channels: channels?.filter(c => c.is_active).length || 0,
      total_channels: channels?.length || 0,
      last_discovery: chats?.length > 0 ? chats[0].last_discovered : null,
      has_bot_api: !!process.env.TELEGRAM_BOT_TOKEN,
      has_client_api: !!(process.env.TG_API_ID && process.env.TG_API_HASH)
    };
    
    res.json({
      success: true,
      status: status
    });
  } catch (err) {
    logger.error('GET /discovery/status error:', err.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get discovery status',
      message: err.message 
    });
  }
});

// GET /api/discovery/chats - Get discovered chats with pagination
router.get('/chats', authMiddleware, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      sort_by = 'last_discovered', 
      order = 'desc',
      ...filters 
    } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = supabase
      .from('discovered_chats')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .range(offset, offset + parseInt(limit) - 1)
      .order(sort_by, { ascending: order === 'asc' });
    
    // Apply filters
    if (filters.admin_only === 'true') {
      query = query.eq('is_admin', true);
    }
    if (filters.chat_type) {
      query = query.eq('chat_type', filters.chat_type);
    }
    if (filters.not_promoted === 'true') {
      query = query.eq('is_promoted', false);
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      throw error;
    }
    
    res.json({
      success: true,
      chats: data || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / parseInt(limit))
      }
    });
  } catch (err) {
    logger.error('GET /discovery/chats error:', err.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get discovered chats',
      message: err.message 
    });
  }
});

// POST /api/discovery/refresh - Refresh admin status for all discovered chats
router.post('/refresh', authMiddleware, async (req, res) => {
  try {
    logger.info('POST /discovery/refresh - User ID:', req.user.id);
    
    // Re-scan to get updated admin statuses
    const updatedChats = await discoveryService.discoverAllChats(req.user.id);
    
    logger.info(`Admin status refresh complete: ${updatedChats.length} chats checked`);
    res.json({ 
      success: true, 
      message: 'Admin statuses refreshed successfully',
      checked: updatedChats.length,
      chats: updatedChats
    });
  } catch (err) {
    logger.error('POST /discovery/refresh error:', err.message);
    res.status(500).json({ 
      success: false,
      error: 'Failed to refresh admin statuses',
      message: err.message 
    });
  }
});

// POST /api/discovery/:chatId/promote - Promote discovered chat to monitored channel
router.post('/:chatId/promote', authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { channel_name, keywords = [], destinations = [] } = req.body;
    
    logger.info('POST /discovery/promote - User ID:', req.user.id, 'Chat ID:', chatId);

    // Get the discovered chat
    const { data: discoveredChat, error } = await supabase
      .from('discovered_chats')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('chat_id', chatId)
      .single();
    
    if (error || !discoveredChat) {
      return res.status(404).json({ 
        success: false,
        error: 'Discovered chat not found' 
      });
    }
    
    // Check if already promoted
    const { data: existingChannel } = await supabase
      .from('channels')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('channel_url', chatId)
      .single();
    
    if (existingChannel) {
      return res.status(409).json({ 
        success: false,
        error: 'Chat already promoted to channels' 
      });
    }
    
    // Create new channel
    const { data: newChannel, error: channelError } = await supabase
      .from('channels')
      .insert({
        user_id: req.user.id,
        platform: 'telegram',
        channel_url: chatId,
        channel_name: channel_name || discoveredChat.chat_title,
        monitoring_method: discoveredChat.is_admin ? 'bot_api' : 'client_api',
        admin_status: discoveredChat.is_admin,
        discovery_source: 'auto_discovered',
        is_active: true
      })
      .select('*')
      .single();
    
    if (channelError) {
      throw channelError;
    }
    
    // Mark as promoted in discovered_chats
    await discoveryService.markChatAsPromoted(req.user.id, chatId);
    
    // Start monitoring the new channel if possible
    try {
      if (monitoringManager && typeof monitoringManager.startMonitoringChannel === 'function') {
        await monitoringManager.startMonitoringChannel(newChannel);
      }
    } catch (monitoringError) {
      logger.warn('Failed to start monitoring for promoted channel:', monitoringError.message);
    }
    
    logger.info('Successfully promoted chat to channel:', newChannel.id);
    res.status(201).json({
      success: true,
      message: 'Chat promoted to monitored channel successfully',
      channel: newChannel
    });
  } catch (err) {
    logger.error('POST /discovery/promote error:', err.message);
    res.status(500).json({ 
      success: false,
      error: 'Failed to promote chat to monitored channel',
      message: err.message 
    });
  }
});

// POST /api/discovery/bulk-promote - Promote multiple chats to channels
router.post('/bulk-promote', authMiddleware, async (req, res) => {
  try {
    const { chat_ids, auto_start_monitoring = true } = req.body;
    
    if (!Array.isArray(chat_ids) || chat_ids.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'chat_ids must be a non-empty array' 
      });
    }
    
    logger.info(`POST /discovery/bulk-promote - User ID: ${req.user.id}, Promoting ${chat_ids.length} chats`);
    
    const results = [];
    const errors = [];
    
    for (const chatId of chat_ids) {
      try {
        // Get discovered chat
        const { data: discoveredChat } = await supabase
          .from('discovered_chats')
          .select('*')
          .eq('user_id', req.user.id)
          .eq('chat_id', chatId)
          .single();
        
        if (!discoveredChat) {
          errors.push({ chat_id: chatId, error: 'Chat not found' });
          continue;
        }
        
        // Create channel
        const { data: newChannel, error } = await supabase
          .from('channels')
          .insert({
            user_id: req.user.id,
            platform: 'telegram',
            channel_url: chatId,
            channel_name: discoveredChat.chat_title,
            monitoring_method: discoveredChat.is_admin ? 'bot_api' : 'client_api',
            admin_status: discoveredChat.is_admin,
            discovery_source: 'auto_discovered',
            is_active: auto_start_monitoring
          })
          .select('*')
          .single();
        
        if (error) {
          errors.push({ chat_id: chatId, error: error.message });
          continue;
        }
        
        // Mark as promoted
        await discoveryService.markChatAsPromoted(req.user.id, chatId);
        
        results.push({
          chat_id: chatId,
          channel: newChannel,
          promoted: true
        });
      } catch (err) {
        errors.push({ chat_id: chatId, error: err.message });
      }
    }
    
    logger.info(`Bulk promotion complete: ${results.length} successful, ${errors.length} errors`);
    
    res.json({
      success: true,
      message: `Promoted ${results.length} of ${chat_ids.length} chats`,
      results: results,
      errors: errors,
      summary: {
        total_requested: chat_ids.length,
        successful: results.length,
        failed: errors.length
      }
    });
  } catch (err) {
    logger.error('POST /discovery/bulk-promote error:', err.message);
    res.status(500).json({ 
      success: false,
      error: 'Failed to bulk promote chats',
      message: err.message 
    });
  }
});

// DELETE /api/discovery/:chatId - Remove a discovered chat
router.delete('/:chatId', authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.params;
    
    logger.info('DELETE /discovery - Chat ID:', chatId);

    const { data, error } = await supabase
      .from('discovered_chats')
      .delete()
      .eq('user_id', req.user.id)
      .eq('chat_id', chatId)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({ 
        success: false,
        error: 'Discovered chat not found' 
      });
    }

    logger.info('Successfully deleted discovered chat:', chatId);
    res.json({ 
      success: true,
      message: 'Discovered chat removed successfully',
      removed_chat: data 
    });
  } catch (err) {
    logger.error('DELETE /discovery error:', err.message);
    res.status(500).json({ 
      success: false,
      error: 'Failed to remove discovered chat',
      message: err.message 
    });
  }
});

module.exports = router;