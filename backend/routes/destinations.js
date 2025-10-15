const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const supabase = require('../database/supabase');

// @route   POST /api/destinations
// @desc    Add a new destination (description is optional and ignored if column doesn't exist)
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    let { name, chat_id, description, is_active = true, type = 'telegram', platform = 'telegram' } = req.body || {};

    // Basic validation for required DB-backed fields
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!chat_id || !String(chat_id).trim()) {
      return res.status(400).json({ error: 'chat_id is required' });
    }

    name = String(name).trim();
    chat_id = String(chat_id).trim();
    type = String(type || 'telegram');
    platform = String(platform || 'telegram');
    is_active = !!is_active;

    // Prevent duplicates for the same user/platform/chat_id
    const { data: existing, error: existingError } = await supabase
      .from('destinations')
      .select('id')
      .eq('user_id', userId)
      .eq('platform', platform)
      .eq('chat_id', chat_id)
      .maybeSingle();

    if (existingError) {
      console.warn('POST /destinations duplicate-check warning:', existingError.message);
      // Continue; do not block creation due to read error
    }

    if (existing) {
      return res.status(409).json({ error: 'Destination already exists for this platform and chat_id' });
    }

    // Build insert payload with only DB-supported columns per schema V1
    const payload = {
      user_id: userId,
      type,
      platform,
      chat_id,
      name,
      is_active
    };

    const { data, error } = await supabase
      .from('destinations')
      .insert([payload])
      .select('*')
      .single();

    if (error) {
      console.error('POST /destinations DB error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Destination already exists' });
      }
      return res.status(500).json({ error: 'Failed to create destination' });
    }

    return res.status(201).json(data);
  } catch (err) {
    console.error('Create destination error:', err.message);
    return res.status(500).json({ error: 'Failed to create destination' });
  }
});

// @route   GET /api/destinations
// @desc    Get all destinations for user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const activeOnly = req.query.active_only === 'true';

    let query = supabase
      .from('destinations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (activeOnly) query = query.eq('is_active', true);

    const { data, error } = await query;
    if (error) {
      console.error('GET /destinations DB error:', error.message);
      return res.status(500).json({ error: 'Failed to fetch destinations' });
    }

    return res.json(data || []);
  } catch (error) {
    console.error('Get destinations error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch destinations' });
  }
});

// @route   PUT /api/destinations/:id
// @desc    Update a destination
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, chat_id, is_active, type, platform } = req.body || {};

    const updateData = {};
    if (name !== undefined) updateData.name = String(name).trim();
    if (chat_id !== undefined) updateData.chat_id = String(chat_id).trim();
    if (is_active !== undefined) updateData.is_active = !!is_active;
    if (type !== undefined) updateData.type = String(type);
    if (platform !== undefined) updateData.platform = String(platform);
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('destinations')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) {
      console.error('PUT /destinations DB error:', error.message);
      return res.status(500).json({ error: 'Failed to update destination' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Destination not found or access denied' });
    }

    return res.json(data);
  } catch (error) {
    console.error('Update destination error:', error.message);
    return res.status(500).json({ error: 'Failed to update destination' });
  }
});

// @route   DELETE /api/destinations/:id
// @desc    Delete a destination
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data, error } = await supabase
      .from('destinations')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) {
      console.error('DELETE /destinations DB error:', error.message);
      return res.status(500).json({ error: 'Failed to delete destination' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error('Delete destination error:', error.message);
    return res.status(500).json({ error: 'Failed to delete destination' });
  }
});

module.exports = router;
