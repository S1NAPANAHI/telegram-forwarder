const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const supabase = require('../database/supabase');

// GET /api/logs - Get all logs for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { limit = 100, offset = 0, level } = req.query;
    
    let query = supabase
      .from('logs')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    // Filter by log level if specified
    if (level && ['info', 'warning', 'error', 'debug'].includes(level)) {
      query = query.eq('level', level);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch logs' });
    }

    res.json(data || []);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;