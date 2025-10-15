const express = require('express');
const router = express.Router();
const AuthMiddleware = require('../middleware/authMiddleware');
const supabase = require('../database/supabase');

function buildUpdate(body){
  const u = {};
  if (body.platform !== undefined) u.platform = String(body.platform);
  if (body.chat_type !== undefined) u.chat_type = String(body.chat_type);
  if (body.chat_id !== undefined) u.chat_id = String(body.chat_id).trim();
  if (body.channel_name !== undefined) u.channel_name = body.channel_name?.toString().trim() || null;
  if (body.username !== undefined) u.username = body.username?.toString().trim() || null;
  if (body.description !== undefined) u.description = body.description?.toString().trim() || null;
  if (body.is_active !== undefined) u.is_active = !!body.is_active;
  if (body.forward_enabled !== undefined) u.forward_enabled = !!body.forward_enabled;
  if (body.allow_media !== undefined) u.allow_media = !!body.allow_media;
  if (body.allow_links !== undefined) u.allow_links = !!body.allow_links;
  if (body.priority !== undefined) u.priority = Number(body.priority) || 0;
  if (body.last_seen_at !== undefined) u.last_seen_at = body.last_seen_at ? new Date(body.last_seen_at).toISOString() : null;
  u.updated_at = new Date().toISOString();
  return u;
}

// GET /api/channels?active_only=true|false
router.get('/', AuthMiddleware.authenticate, async (req, res) => {
  try {
    const activeOnly = req.query.active_only === 'true';
    let query = supabase
      .from('channels')
      .select('*')
      .eq('user_id', req.user.id)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (activeOnly) query = query.eq('is_active', true);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    res.json(data || []);
  } catch (err) {
    console.error('Get channels error:', err);
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
});

// POST /api/channels
router.post('/', AuthMiddleware.authenticate, async (req, res) => {
  try {
    const { platform = 'telegram', chat_type = 'channel', chat_id, channel_name, username, description, is_active = true, forward_enabled = true, allow_media = true, allow_links = true, priority = 0 } = req.body;

    if (!chat_id || !String(chat_id).trim()) {
      return res.status(400).json({ error: 'chat_id is required' });
    }

    const payload = {
      user_id: req.user.id,
      platform: String(platform),
      chat_type: String(chat_type),
      chat_id: String(chat_id).trim(),
      channel_name: channel_name?.toString().trim() || null,
      username: username?.toString().trim() || null,
      description: description?.toString().trim() || null,
      is_active: !!is_active,
      forward_enabled: !!forward_enabled,
      allow_media: !!allow_media,
      allow_links: !!allow_links,
      priority: Number(priority) || 0
    };

    const { data, error } = await supabase
      .from('channels')
      .insert([payload])
      .select()
      .single();

    if (error) throw new Error(error.message);

    res.status(201).json(data);
  } catch (err) {
    console.error('Create channel error:', err);
    res.status(500).json({ error: 'Failed to create channel' });
  }
});

// PUT /api/channels/:id
router.put('/:id', AuthMiddleware.authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const update = buildUpdate(req.body);

    const { data, error } = await supabase
      .from('channels')
      .update(update)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!data) return res.status(404).json({ error: 'Channel not found' });

    res.json(data);
  } catch (err) {
    console.error('Update channel error:', err);
    res.status(500).json({ error: 'Failed to update channel' });
  }
});

// DELETE /api/channels/:id
router.delete('/:id', AuthMiddleware.authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('channels')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!data) return res.status(404).json({ error: 'Channel not found' });

    res.json({ ok: true });
  } catch (err) {
    console.error('Delete channel error:', err);
    res.status(500).json({ error: 'Failed to delete channel' });
  }
});

module.exports = router;
