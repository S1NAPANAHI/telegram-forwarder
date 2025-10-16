const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { supabase } = require('../database/supabase');

// Ensure user settings column exists (auto_promote_admin)
async function ensureSettingsColumns() {
  try {
    await supabase.rpc('exec_sql', { sql: "ALTER TABLE users ADD COLUMN IF NOT EXISTS auto_promote_admin BOOLEAN DEFAULT true;" });
  } catch {}
}

// GET /api/settings - get current user settings
router.get('/', authMiddleware, async (req, res) => {
  try {
    await ensureSettingsColumns();
    const { data, error } = await supabase
      .from('users')
      .select('auto_promote_admin')
      .eq('id', req.user.id)
      .single();
    if (error) throw error;
    res.json({ success: true, settings: { auto_promote_admin: data?.auto_promote_admin ?? true } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to get settings' });
  }
});

// PUT /api/settings - update settings
router.put('/', authMiddleware, async (req, res) => {
  try {
    await ensureSettingsColumns();
    const updates = {};
    if (typeof req.body.auto_promote_admin === 'boolean') {
      updates.auto_promote_admin = req.body.auto_promote_admin;
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, error: 'No settings to update' });
    }
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select('auto_promote_admin')
      .single();
    if (error) throw error;
    res.json({ success: true, settings: { auto_promote_admin: data.auto_promote_admin } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update settings' });
  }
});

module.exports = router;
