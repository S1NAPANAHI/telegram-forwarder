const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { supabase } = require('../database/supabase');

// POST /api/admin/migrate-user-content
// Body: { from_user_id: string, to_user_id: string, resources?: { discovered?: boolean, channels?: boolean } }
// Moves ownership of discovered_chats and/or channels from one user to another (idempotent)
router.post('/migrate-user-content', authMiddleware, async (req, res) => {
  try {
    // Optional: authorize only admins, or allow self if to_user_id == req.user.id
    const { from_user_id, to_user_id, resources } = req.body || {};
    if (!from_user_id || !to_user_id) {
      return res.status(400).json({ success: false, error: 'from_user_id and to_user_id are required' });
    }
    if (to_user_id !== req.user.id) {
      // Basic protection: only allow migrating to current user unless you add admin checks
      return res.status(403).json({ success: false, error: 'Forbidden: can only migrate to your own account' });
    }

    const doDiscovered = resources?.discovered !== false; // default true
    const doChannels = resources?.channels !== false; // default true

    const result = { discovered_moved: 0, channels_moved: 0 };

    if (doDiscovered) {
      const { data: discovered } = await supabase
        .from('discovered_chats')
        .select('chat_id')
        .eq('user_id', from_user_id);
      if (discovered && discovered.length > 0) {
        for (const row of discovered) {
          // Upsert into destination user
          await supabase
            .from('discovered_chats')
            .upsert({ user_id: to_user_id, chat_id: row.chat_id }, { onConflict: 'user_id,chat_id' });
          // Optionally delete from source
          await supabase
            .from('discovered_chats')
            .delete()
            .eq('user_id', from_user_id)
            .eq('chat_id', row.chat_id);
          result.discovered_moved += 1;
        }
      }
    }

    if (doChannels) {
      const { data: channels } = await supabase
        .from('channels')
        .select('id')
        .eq('user_id', from_user_id);
      if (channels && channels.length > 0) {
        for (const ch of channels) {
          await supabase
            .from('channels')
            .update({ user_id: to_user_id })
            .eq('id', ch.id);
          result.channels_moved += 1;
        }
      }
    }

    return res.json({ success: true, moved: result });
  } catch (err) {
    console.error('migrate-user-content error:', err?.message || err);
    res.status(500).json({ success: false, error: 'Migration failed' });
  }
});

module.exports = router;
