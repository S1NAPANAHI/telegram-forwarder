const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const supabase = require('../database/supabase');
const MessageQueueService = require('../services/MessageQueueService');

// GET /api/messages/feed
router.get('/feed', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('[messages/feed] userId =', userId);

    const { data, error } = await supabase
      .from('message_feed')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('[messages/feed] Supabase error:', error.message, error.details || '', error.hint || '');
      return res.status(500).json({ error: 'Failed to fetch message feed', details: error.message });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching message feed:', error.message);
    res.status(500).json({ error: 'Failed to fetch message feed' });
  }
});

// GET /api/messages/queue
router.get('/queue', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('[messages/queue] userId =', userId);

    const { data, error } = await supabase
      .from('message_queue')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[messages/queue] Supabase error:', error.message, error.details || '', error.hint || '');
      return res.status(500).json({ error: 'Failed to fetch message queue', details: error.message });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching message queue:', error.message);
    res.status(500).json({ error: 'Failed to fetch message queue' });
  }
});

// DELETE /api/messages/feed
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

// POST /api/messages/retry/:messageId
router.post('/retry/:messageId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const messageId = req.params.messageId;

    const { data: message, error: fetchError } = await supabase
      .from('message_queue')
      .select('*')
      .eq('id', messageId)
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;
    if (!message) return res.status(404).json({ error: 'Message not found' });

    const { error: updateError } = await supabase
      .from('message_queue')
      .update({ status: 'pending', failure_reason: null, updated_at: new Date().toISOString() })
      .eq('id', messageId);

    if (updateError) throw updateError;

    res.json({ success: true, message: 'Message queued for retry' });
  } catch (error) {
    console.error('Error retrying message:', error.message);
    res.status(500).json({ error: 'Failed to retry message' });
  }
});

module.exports = router;
