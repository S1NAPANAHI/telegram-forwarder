const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const supabase = require('../database/supabase');

// Utility: sanitize partial update payload
function buildUpdate(body) {
  const update = {};
  if (body.keyword !== undefined) update.keyword = String(body.keyword).trim();
  if (body.description !== undefined) update.description = body.description?.toString().trim() || null;
  if (body.match_mode !== undefined) update.match_mode = String(body.match_mode);
  if (body.case_sensitive !== undefined) update.case_sensitive = !!body.case_sensitive;
  if (body.priority !== undefined) update.priority = Number(body.priority) || 0;
  if (body.is_active !== undefined) update.is_active = !!body.is_active;
  update.updated_at = new Date().toISOString();
  return update;
}

// GET /api/keywords?active_only=true|false
router.get('/', auth, async (req, res) => {
  try {
    const activeOnly = req.query.active_only === 'true';
    let query = supabase
      .from('keywords')
      .select('*')
      .eq('user_id', req.user.id)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (activeOnly) query = query.eq('is_active', true);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    res.json(data || []);
  } catch (err) {
    console.error('Get keywords error:', err);
    res.status(500).json({ error: 'Failed to fetch keywords' });
  }
});

// POST /api/keywords
router.post('/', auth, async (req, res) => {
  try {
    const { keyword, description, match_mode = 'contains', case_sensitive = false, priority = 0, is_active = true } = req.body;

    if (!keyword || !String(keyword).trim()) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    if (!['exact', 'contains', 'regex'].includes(match_mode)) {
      return res.status(400).json({ error: 'Invalid match_mode. Use exact|contains|regex' });
    }

    const payload = {
      user_id: req.user.id,
      keyword: String(keyword).trim(),
      description: description?.toString().trim() || null,
      match_mode,
      case_sensitive: !!case_sensitive,
      priority: Number(priority) || 0,
      is_active: !!is_active
    };

    const { data, error } = await supabase
      .from('keywords')
      .insert([payload])
      .select()
      .single();

    if (error) throw new Error(error.message);

    res.status(201).json(data);
  } catch (err) {
    console.error('Create keyword error:', err);
    res.status(500).json({ error: 'Failed to create keyword' });
  }
});

// PUT /api/keywords/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const update = buildUpdate(req.body);

    const { data, error } = await supabase
      .from('keywords')
      .update(update)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!data) return res.status(404).json({ error: 'Keyword not found' });

    res.json(data);
  } catch (err) {
    console.error('Update keyword error:', err);
    res.status(500).json({ error: 'Failed to update keyword' });
  }
});

// DELETE /api/keywords/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('keywords')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!data) return res.status(404).json({ error: 'Keyword not found' });

    res.json({ ok: true });
  } catch (err) {
    console.error('Delete keyword error:', err);
    res.status(500).json({ error: 'Failed to delete keyword' });
  }
});

module.exports = router;