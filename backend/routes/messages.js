const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const supabase = require('../database/supabase');
const MessageQueueService = require('../services/MessageQueueService');
const ForwardingEnhancer = require('../services/ForwardingEnhancer');

/**
 * GET /api/messages/feed
 * Get real-time message feed for the authenticated user
 */
router.get('/feed', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`[messages/feed] Fetching feed for user ${userId}`);

    const { data: messages, error } = await supabase
      .from('message_feed')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('[messages/feed] Supabase error:', error.message, error.details || '', error.hint || '');
      return res.status(500).json({ 
        error: 'Failed to fetch message feed', 
        details: error.message 
      });
    }

    console.log(`[messages/feed] Retrieved ${messages?.length || 0} messages`);
    
    // Return array format for frontend compatibility
    res.json(messages || []);
  } catch (error) {
    console.error('Error fetching message feed:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch message feed',
      message: error.message 
    });
  }
});

/**
 * GET /api/messages/queue
 * Get message queue with status information
 */
router.get('/queue', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status = null, limit = 50 } = req.query;
    
    console.log(`[messages/queue] Fetching queue for user ${userId}`);

    let query = supabase
      .from('message_queue')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));
    
    if (status) {
      query = query.eq('status', status);
    }

    const { data: messages, error } = await query;

    if (error) {
      console.error('[messages/queue] Supabase error:', error.message, error.details || '', error.hint || '');
      return res.status(500).json({ 
        error: 'Failed to fetch message queue', 
        details: error.message 
      });
    }

    console.log(`[messages/queue] Retrieved ${messages?.length || 0} messages`);
    
    // Return array format for frontend compatibility
    res.json(messages || []);
  } catch (error) {
    console.error('Error fetching message queue:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch message queue',
      message: error.message 
    });
  }
});

/**
 * GET /api/messages/stats
 * Get message statistics for the authenticated user
 */
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`[messages/stats] Fetching stats for user ${userId}`);

    // Get feed count
    const { count: feedCount, error: feedError } = await supabase
      .from('message_feed')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (feedError) {
      console.error('[messages/stats] Feed count error:', feedError);
    }

    // Get queue stats
    let queueStats = {
      total_messages: 0,
      pending_messages: 0,
      delivered_messages: 0,
      failed_messages: 0
    };
    
    try {
      const { data: statsData, error: queueError } = await supabase
        .rpc('get_message_queue_stats', { p_user_id: userId });
      
      if (!queueError && statsData?.[0]) {
        queueStats = statsData[0];
      }
    } catch (statsError) {
      console.log('[messages/stats] Stats function not available, using basic count');
      // Fallback: basic count
      const { count: totalCount } = await supabase
        .from('message_queue')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      queueStats.total_messages = totalCount || 0;
    }

    const stats = {
      feed_messages: feedCount || 0,
      queue_stats: queueStats,
      last_updated: new Date().toISOString()
    };

    console.log(`[messages/stats] Stats retrieved for user ${userId}`);
    
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Error fetching message statistics:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch message statistics',
      message: error.message 
    });
  }
});

/**
 * DELETE /api/messages/feed
 * Clear the message feed for the authenticated user
 */
router.delete('/feed', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`[messages/feed DELETE] Clearing feed for user ${userId}`);

    const { error } = await supabase
      .from('message_feed')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('[messages/feed DELETE] Supabase error:', error.message);
      return res.status(500).json({ 
        error: 'Failed to clear message feed',
        details: error.message 
      });
    }

    console.log(`[messages/feed DELETE] Feed cleared for user ${userId}`);
    
    res.json({
      success: true,
      message: 'Message feed cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error clearing message feed:', error.message);
    res.status(500).json({ 
      error: 'Failed to clear message feed',
      message: error.message 
    });
  }
});

/**
 * POST /api/messages/retry/:messageId
 * Retry a failed message delivery
 */
router.post('/retry/:messageId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const messageId = req.params.messageId;
    
    console.log(`[messages/retry] Retrying message ${messageId} for user ${userId}`);

    // Verify message belongs to user
    const { data: message, error: fetchError } = await supabase
      .from('message_queue')
      .select('*')
      .eq('id', messageId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('[messages/retry] Fetch error:', fetchError.message);
      return res.status(500).json({ 
        error: 'Database error',
        details: fetchError.message 
      });
    }
    
    if (!message) {
      return res.status(404).json({ 
        error: 'Message not found or access denied' 
      });
    }

    // Simple retry - update status to pending
    const { error: updateError } = await supabase
      .from('message_queue')
      .update({ 
        status: 'pending', 
        failure_reason: null,
        updated_at: new Date().toISOString() 
      })
      .eq('id', messageId);

    if (updateError) {
      console.error('[messages/retry] Update error:', updateError.message);
      return res.status(500).json({ 
        error: 'Failed to update message status',
        details: updateError.message 
      });
    }

    console.log(`[messages/retry] Message ${messageId} marked for retry`);
    
    res.json({
      success: true,
      message: 'Message queued for retry successfully',
      messageId: messageId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error retrying message:', error.message);
    res.status(500).json({ 
      error: 'Failed to retry message',
      message: error.message 
    });
  }
});

/**
 * POST /api/messages/test
 * Create a test message for debugging (development only)
 */
router.post('/test', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { title = 'Test Message', content = 'This is a test message from the API' } = req.body;
    
    console.log(`[messages/test] Creating test message for user ${userId}`);

    // Add test message to feed
    const { data: feedMessage, error: feedError } = await supabase
      .from('message_feed')
      .insert({
        user_id: userId,
        title: title,
        content: content,
        data: {
          test: true,
          created_by: 'test_endpoint',
          timestamp: new Date().toISOString()
        },
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (feedError) {
      throw feedError;
    }

    // Add test message to queue
    const { data: queueMessage, error: queueError } = await supabase
      .from('message_queue')
      .insert({
        user_id: userId,
        message_text: content,
        message_type: 'test',
        status: 'delivered',
        delivered_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (queueError) {
      throw queueError;
    }

    console.log(`[messages/test] Test messages created successfully`);
    
    res.json({
      success: true,
      message: 'Test messages created successfully',
      data: {
        feed_message: feedMessage,
        queue_message: queueMessage
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating test message:', error.message);
    res.status(500).json({ 
      error: 'Failed to create test message',
      message: error.message 
    });
  }
});

module.exports = router;