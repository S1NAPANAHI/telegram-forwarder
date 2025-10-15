const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const supabase = require('../database/supabase');
const monitoringManager = require('../services/monitoringManager');

// GET /api/discovery - Get all discovered chats
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('GET /discovery - User ID:', req.user.id);
    
    const { admin_only, member_only, type } = req.query;
    
    let query = supabase
      .from('discovered_chats')
      .select('*')
      .order('last_seen_at', { ascending: false });

    if (admin_only === 'true') {
      query = query.eq('is_bot_admin', true);
    }
    if (member_only === 'true') {
      query = query.eq('is_bot_member', true);
    }
    if (type && ['group', 'supergroup', 'channel', 'private'].includes(type)) {
      query = query.eq('chat_type', type);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('GET /discovery DB error:', error.message);
      return res.status(500).json({ error: 'Failed to fetch discovered chats' });
    }

    console.log(`GET /discovery - Found ${(data || []).length} chats`);
    res.json(data || []);
  } catch (err) {
    console.error('GET /discovery error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/discovery/refresh - Refresh admin status for all discovered chats
router.post('/refresh', authMiddleware, async (req, res) => {
  try {
    console.log('POST /discovery/refresh - User ID:', req.user.id);
    
    // Get the bot instance from monitoring manager
    const telegramMonitor = monitoringManager.telegramMonitor;
    if (!telegramMonitor) {
      return res.status(503).json({ error: 'Telegram monitor not available' });
    }

    const chatDiscovery = telegramMonitor.getChatDiscovery();
    const results = await chatDiscovery.refreshAllAdminStatuses();
    
    console.log(`Admin status refresh complete: ${results.length} chats checked`);
    res.json({ 
      success: true, 
      checked: results.length,
      results: results
    });
  } catch (err) {
    console.error('POST /discovery/refresh error:', err.message);
    res.status(500).json({ error: 'Failed to refresh admin statuses' });
  }
});

// POST /api/discovery/:chatId/promote - Promote discovered chat to monitored channel
router.post('/:chatId/promote', authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { channel_name } = req.body;
    
    console.log('POST /discovery/promote - User ID:', req.user.id, 'Chat ID:', chatId);

    // Get the bot instance from monitoring manager
    const telegramMonitor = monitoringManager.telegramMonitor;
    if (!telegramMonitor) {
      return res.status(503).json({ error: 'Telegram monitor not available' });
    }

    const chatDiscovery = telegramMonitor.getChatDiscovery();
    const newChannel = await chatDiscovery.promoteToMonitoredChannel(
      req.user.id, 
      chatId, 
      channel_name
    );
    
    // Start monitoring the new channel
    await monitoringManager.startMonitoringChannel(newChannel);
    
    console.log('Successfully promoted and started monitoring:', newChannel.id);
    res.status(201).json(newChannel);
  } catch (err) {
    console.error('POST /discovery/promote error:', err.message);
    
    if (err.message.includes('already exists')) {
      return res.status(409).json({ error: err.message });
    }
    if (err.message.includes('not found')) {
      return res.status(404).json({ error: err.message });
    }
    
    res.status(500).json({ error: 'Failed to promote chat to monitored channel' });
  }
});

// DELETE /api/discovery/:chatId - Remove a discovered chat
router.delete('/:chatId', authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.params;
    
    console.log('DELETE /discovery - Chat ID:', chatId);

    const { data, error } = await supabase
      .from('discovered_chats')
      .delete()
      .eq('chat_id', chatId)
      .select('*')
      .single();

    if (error) {
      console.error('DELETE /discovery DB error:', error.message);
      return res.status(500).json({ error: 'Failed to delete discovered chat' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Discovered chat not found' });
    }

    console.log('Successfully deleted discovered chat:', chatId);
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /discovery error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;