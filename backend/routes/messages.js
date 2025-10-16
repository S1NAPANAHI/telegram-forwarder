const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const supabase = require('../database/supabase');

// ... existing routes ...

// Extra debug logging for feed endpoint
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

module.exports = router;