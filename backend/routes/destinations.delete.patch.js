const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const supabase = require('../database/supabase');

// DELETE /api/destinations/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;

    // Ensure ownership
    const { data: dest, error: fetchErr } = await supabase
      .from('destinations')
      .select('id,user_id')
      .eq('id', id)
      .single();

    if (fetchErr) return res.status(404).json({ error: 'Destination not found' });
    if (!dest || dest.user_id !== userId) return res.status(403).json({ error: 'Access denied' });

    const { error: delErr } = await supabase
      .from('destinations')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (delErr) return res.status(500).json({ error: delErr.message });
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;