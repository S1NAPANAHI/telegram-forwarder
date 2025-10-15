const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
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
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('GET /keywords - User ID:', req.user.id);
    const activeOnly = req.query.active_only === 'true';
    let query = supabase
      .from('keywords')
      .select('*')
      .eq('user_id', req.user.id)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (activeOnly) query = query.eq('is_active', true);

    const { data, error } = await query;
    if (error) {
      console.error('GET /keywords DB error:', error.message);
      throw new Error(error.message);
    }

    console.log(`GET /keywords - Found ${(data || []).length} keywords for user`);
    res.json(data || []);
  } catch (err) {
    console.error('Get keywords error:', err.message);
    res.status(500).json({ error: 'Failed to fetch keywords' });
  }
});

// POST /api/keywords
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('POST /keywords - User ID:', req.user.id);
    console.log('POST /keywords - Request body:', req.body);
    
    const { keyword, description, match_mode = 'contains', case_sensitive = false, priority = 0, is_active = true } = req.body;

    if (!keyword || !String(keyword).trim()) {
      console.log('POST /keywords - Missing keyword in request');
      return res.status(400).json({ error: 'Keyword is required' });
    }

    if (!['exact', 'contains', 'regex'].includes(match_mode)) {
      console.log('POST /keywords - Invalid match_mode:', match_mode);
      return res.status(400).json({ error: 'Invalid match_mode. Use exact|contains|regex' });
    }

    // Validate user_id exists before insert
    if (!req.user.id) {
      console.error('POST /keywords - Missing user ID in request object');
      return res.status(400).json({ error: 'User authentication required' });
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

    console.log('POST /keywords - Inserting payload:', payload);

    const { data, error } = await supabase
      .from('keywords')
      .insert([payload])
      .select('*')
      .single();

    if (error) {
      console.error('POST /keywords DB error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      // Provide more specific error messages
      if (error.code === '23503') {
        return res.status(400).json({ 
          error: 'User account not properly set up. Please try logging out and back in.' 
        });
      }
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Keyword already exists for this user' });
      }
      
      throw new Error(error.message);
    }

    console.log('POST /keywords - Successfully created:', data.id);
    res.status(201).json(data);
  } catch (err) {
    console.error('Create keyword error:', {
      message: err.message,
      stack: err.stack?.split('\n')[0] // First line of stack for context
    });
    res.status(500).json({ error: 'Failed to create keyword' });
  }
});

// PUT /api/keywords/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('PUT /keywords - User ID:', req.user.id, 'Keyword ID:', req.params.id);
    const { id } = req.params;
    const update = buildUpdate(req.body);

    const { data, error } = await supabase
      .from('keywords')
      .update(update)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select('*')
      .single();

    if (error) {
      console.error('PUT /keywords DB error:', error.message);
      throw new Error(error.message);
    }
    if (!data) {
      console.log('PUT /keywords - Keyword not found:', id);
      return res.status(404).json({ error: 'Keyword not found' });
    }

    console.log('PUT /keywords - Successfully updated:', data.id);
    res.json(data);
  } catch (err) {
    console.error('Update keyword error:', err.message);
    res.status(500).json({ error: 'Failed to update keyword' });
  }
});

// DELETE /api/keywords/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('DELETE /keywords - User ID:', req.user.id, 'Keyword ID:', req.params.id);
    const { id } = req.params;

    const { data, error } = await supabase
      .from('keywords')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select('*')
      .single();

    if (error) {
      console.error('DELETE /keywords DB error:', error.message);
      throw new Error(error.message);
    }
    if (!data) {
      console.log('DELETE /keywords - Keyword not found:', id);
      return res.status(404).json({ error: 'Keyword not found' });
    }

    console.log('DELETE /keywords - Successfully deleted:', data.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete keyword error:', err.message);
    res.status(500).json({ error: 'Failed to delete keyword' });
  }
});

module.exports = router;