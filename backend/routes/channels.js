const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const supabase = require('../database/supabase');

// Helper function to resolve channel username/URL to info
async function resolveChannelInfo(input) {
  let channelUrl = input.trim();
  let channelName = null;
  let platformSpecificId = null;
  
  // Handle different input formats
  if (channelUrl.startsWith('@')) {
    // @username format
    channelUrl = `https://t.me/${channelUrl.slice(1)}`;
    channelName = channelUrl.slice(1); // Remove @
    platformSpecificId = channelUrl;
  } else if (channelUrl.startsWith('https://t.me/')) {
    // Full URL format
    const username = channelUrl.split('/').pop();
    channelName = username;
    platformSpecificId = channelUrl;
  } else if (channelUrl.startsWith('-100') || /^-?\d+$/.test(channelUrl)) {
    // Numeric channel ID
    platformSpecificId = channelUrl;
    channelUrl = `https://t.me/c/${channelUrl.replace('-100', '')}`;
    channelName = `Channel ${channelUrl}`;
  } else {
    // Plain username without @
    channelUrl = `https://t.me/${channelUrl}`;
    channelName = channelUrl;
    platformSpecificId = channelUrl;
  }
  
  return { channelUrl, channelName, platformSpecificId };
}

// GET /api/channels - Get all channels for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('GET /channels - User ID:', req.user.id);
    
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('GET /channels DB error:', error.message);
      return res.status(500).json({ error: 'Failed to fetch channels' });
    }

    console.log(`GET /channels - Found ${(data || []).length} channels`);
    res.json(data || []);
  } catch (err) {
    console.error('GET /channels error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/channels - Create a new channel
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('POST /channels - User ID:', req.user.id);
    console.log('POST /channels - Request body:', req.body);
    
    const { channel_url, channel_id, channel_name, platform = 'telegram', is_active = true } = req.body;

    // Accept either channel_url or channel_id for backward compatibility
    const input = channel_url || channel_id;
    
    if (!input || !String(input).trim()) {
      console.log('POST /channels - Missing channel identifier');
      return res.status(400).json({ error: 'Channel URL or ID is required' });
    }

    // Resolve channel info from input
    const { channelUrl, channelName, platformSpecificId } = await resolveChannelInfo(input);
    
    // Use provided channel_name or resolved name
    const finalChannelName = channel_name ? String(channel_name).trim() : channelName;
    
    if (!finalChannelName) {
      return res.status(400).json({ error: 'Channel name is required' });
    }

    console.log('POST /channels - Resolved:', { channelUrl, finalChannelName, platform });

    // Check if channel already exists for this user (by URL)
    const { data: existing, error: existingError } = await supabase
      .from('channels')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('channel_url', channelUrl)
      .maybeSingle();

    if (existingError && existingError.code !== 'PGRST116') {
      console.warn('POST /channels - Duplicate check warning:', existingError.message);
    }

    if (existing) {
      console.log('POST /channels - Channel already exists');
      return res.status(409).json({ error: 'Channel already exists' });
    }

    // Create new channel with correct schema fields
    const newChannel = {
      user_id: req.user.id,
      platform: String(platform),
      channel_url: channelUrl,
      channel_name: finalChannelName,
      is_active: !!is_active
    };

    console.log('POST /channels - Inserting:', newChannel);

    const { data, error } = await supabase
      .from('channels')
      .insert([newChannel])
      .select('*')
      .single();

    if (error) {
      console.error('POST /channels DB error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Channel already exists' });
      }
      if (error.code === '23503') {
        return res.status(400).json({ error: 'Invalid user reference' });
      }
      
      return res.status(500).json({ error: 'Failed to create channel' });
    }

    console.log('POST /channels - Successfully created:', data.id);
    res.status(201).json(data);
  } catch (err) {
    console.error('POST /channels error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/channels/:id - Update a channel
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('PUT /channels - User ID:', req.user.id, 'Channel ID:', req.params.id);
    const { id } = req.params;
    const updates = {};

    if (req.body.channel_name !== undefined) {
      updates.channel_name = req.body.channel_name ? String(req.body.channel_name).trim() : null;
    }
    if (req.body.channel_url !== undefined) {
      updates.channel_url = req.body.channel_url ? String(req.body.channel_url).trim() : null;
    }
    if (req.body.platform !== undefined) {
      updates.platform = String(req.body.platform);
    }
    if (req.body.is_active !== undefined) {
      updates.is_active = !!req.body.is_active;
    }

    // Add check_interval and last_checked if provided
    if (req.body.check_interval !== undefined) {
      updates.check_interval = Math.max(parseInt(req.body.check_interval) || 30000, 5000);
    }
    if (req.body.last_checked !== undefined) {
      updates.last_checked = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('channels')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select('*')
      .single();

    if (error) {
      console.error('PUT /channels DB error:', error.message);
      return res.status(500).json({ error: 'Failed to update channel' });
    }

    if (!data) {
      console.log('PUT /channels - Channel not found:', id);
      return res.status(404).json({ error: 'Channel not found' });
    }

    console.log('PUT /channels - Successfully updated:', data.id);
    res.json(data);
  } catch (err) {
    console.error('PUT /channels error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/channels/:id - Delete a channel
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('DELETE /channels - User ID:', req.user.id, 'Channel ID:', req.params.id);
    const { id } = req.params;

    const { data, error } = await supabase
      .from('channels')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select('*')
      .single();

    if (error) {
      console.error('DELETE /channels DB error:', error.message);
      return res.status(500).json({ error: 'Failed to delete channel' });
    }

    if (!data) {
      console.log('DELETE /channels - Channel not found:', id);
      return res.status(404).json({ error: 'Channel not found' });
    }

    console.log('DELETE /channels - Successfully deleted:', data.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /channels error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;