const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const supabase = require('../database/supabase');

// GET /api/channels - Get all channels for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch channels' });
    }

    res.json(data || []);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/channels - Create a new channel
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { channel_id, channel_name, channel_type = 'channel', is_active = true } = req.body;

    if (!channel_id) {
      return res.status(400).json({ error: 'Channel ID is required' });
    }

    // Check if channel already exists for this user
    const { data: existing, error: existingError } = await supabase
      .from('channels')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('channel_id', channel_id)
      .single();

    if (existing) {
      return res.status(409).json({ error: 'Channel already exists' });
    }

    const newChannel = {
      user_id: req.user.id,
      channel_id: String(channel_id).trim(),
      channel_name: channel_name ? String(channel_name).trim() : null,
      channel_type,
      is_active: !!is_active
    };

    const { data, error } = await supabase
      .from('channels')
      .insert([newChannel])
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return res.status(500).json({ error: 'Failed to create channel' });
    }

    res.status(201).json(data);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/channels/:id - Update a channel
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};

    if (req.body.channel_name !== undefined) {
      updates.channel_name = req.body.channel_name ? String(req.body.channel_name).trim() : null;
    }
    if (req.body.channel_type !== undefined) {
      updates.channel_type = String(req.body.channel_type);
    }
    if (req.body.is_active !== undefined) {
      updates.is_active = !!req.body.is_active;
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('channels')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return res.status(500).json({ error: 'Failed to update channel' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    res.json(data);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/channels/:id - Delete a channel
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('channels')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      console.error('Delete error:', error);
      return res.status(500).json({ error: 'Failed to delete channel' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;