const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const supabase = require('../database/supabase');

// GET /api/logs?limit=&offset=&level=
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = Math.min(Math.max(parseInt(req.query.limit || '50', 10), 1), 200);
    const offset = Math.max(parseInt(req.query.offset || '0', 10), 0);
    const level = req.query.level; // info|warning|error|debug (if you store one)

    console.log('GET /logs - user:', userId, 'limit:', limit, 'offset:', offset, 'level:', level);

    let query = supabase
      .from('message_logs')
      .select('id, user_id, keyword_id, channel_id, original_message_id, original_message_text, matched_text, status, processing_time_ms, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // If you keep a "level" field, add this mapping as needed.
    if (level && ['info', 'warning', 'error', 'debug'].includes(level)) {
      // If you use a separate level column, change this to .eq('level', level)
      query = query.eq('status', level);
    }

    const { data, error } = await query;

    if (error) {
      console.error('GET /logs DB error:', { message: error.message, code: error.code, details: error.details });
      return res.status(500).json({ error: 'Failed to fetch logs' });
    }

    return res.json(data || []);
  } catch (err) {
    console.error('GET /logs error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

module.exports = router;
