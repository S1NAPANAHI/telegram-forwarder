const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const supabase = require('../database/supabase');
const MessageQueueService = require('../services/MessageQueueService');

// @route   GET /api/messages/feed
// @desc    Get message feed for user
// @access  Private
router.get('/feed', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('message_feed')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching message feed:', error.message);
    res.status(500).json({ error: 'Failed to fetch message feed' });
  }
});

// @route   GET /api/messages/queue
// @desc    Get message queue for user
// @access  Private
router.get('/queue', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('message_queue')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching message queue:', error.message);
    res.status(500).json({ error: 'Failed to fetch message queue' });
  }
});

// @route   DELETE /api/messages/feed
// @desc    Clear message feed for user
// @access  Private
router.delete('/feed', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { error } = await supabase
      .from('message_feed')
      .delete()
      .eq('user_id', userId);
    
    if (error) throw error;
    
    res.json({ success: true, message: 'Message feed cleared successfully' });
  } catch (error) {
    console.error('Error clearing message feed:', error.message);
    res.status(500).json({ error: 'Failed to clear message feed' });
  }
});

// @route   POST /api/messages/retry/:messageId
// @desc    Retry failed message delivery
// @access  Private
router.post('/retry/:messageId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const messageId = req.params.messageId;
    
    // Get the message
    const { data: message, error: fetchError } = await supabase
      .from('message_queue')
      .select('*')
      .eq('id', messageId)
      .eq('user_id', userId)
      .single();
    
    if (fetchError) throw fetchError;
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // Reset status to pending for retry
    const { error: updateError } = await supabase
      .from('message_queue')
      .update({
        status: 'pending',
        failure_reason: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId);
    
    if (updateError) throw updateError;
    
    // Trigger retry logic here if needed
    // For now, just mark as pending and let the pipeline pick it up
    
    res.json({ success: true, message: 'Message queued for retry' });
  } catch (error) {
    console.error('Error retrying message:', error.message);
    res.status(500).json({ error: 'Failed to retry message' });
  }
});

// @route   GET /api/messages/stats
// @desc    Get message statistics
// @access  Private
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get queue stats
    const { data: queueStats } = await supabase
      .rpc('get_message_queue_stats', { p_user_id: userId });
    
    // Get feed count
    const { count: feedCount } = await supabase
      .from('message_feed')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    const stats = {
      queue: queueStats?.[0] || { total: 0, pending: 0, delivered: 0, failed: 0 },
      feed: { total: feedCount || 0 }
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching message stats:', error.message);
    res.status(500).json({ error: 'Failed to fetch message statistics' });
  }
});

module.exports = router;