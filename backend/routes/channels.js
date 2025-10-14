const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ChannelService = require('../services/ChannelService');

// @route   POST /api/channels
// @desc    Add a new channel
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { platform, channelUrl, channelName, credentials } = req.body;

    const newChannel = await ChannelService.addChannel(req.user.id, {
      platform,
      channel_url: channelUrl,
      channel_name: channelName,
      credentials
    });

    res.json(newChannel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/channels
// @desc    Get all channels for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const channels = await ChannelService.getUserChannels(req.user.id);
    res.json(channels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   DELETE /api/channels/:id
// @desc    Delete a channel
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const channel = await ChannelService.deleteChannel(req.user.id, req.params.id);

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    res.json({ message: 'Channel deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;