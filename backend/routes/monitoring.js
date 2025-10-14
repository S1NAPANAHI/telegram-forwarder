const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ChannelService = require('../services/ChannelService');
const monitoringManager = require('../services/monitoringManager'); // Import the manager

// @route   POST /api/monitoring/start/:channelId
// @desc    Start monitoring a specific channel
// @access  Private
router.post('/start/:channelId', auth, async (req, res) => {
  try {
    const channel = await ChannelService.getChannelById(req.user.id, req.params.channelId);
    if (!channel) {
      return res.status(404).json({ msg: 'Channel not found or not authorized' });
    }
    await monitoringManager.startMonitoringChannel(channel);
    res.json({ msg: `Monitoring started for channel ${channel.channelName}` });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/monitoring/stop/:channelId
// @desc    Stop monitoring a specific channel
// @access  Private
router.post('/stop/:channelId', auth, async (req, res) => {
  try {
    const channel = await ChannelService.getChannelById(req.user.id, req.params.channelId);
    if (!channel) {
      return res.status(404).json({ msg: 'Channel not found or not authorized' });
    }
    await monitoringManager.stopMonitoringChannel(req.params.channelId);
    res.json({ msg: `Monitoring stopped for channel ${channel.channelName}` });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/monitoring/status
// @desc    Get status of all monitored channels for the user
// @access  Private
router.get('/status', auth, async (req, res) => {
  try {
    const status = monitoringManager.getMonitoringStatus(req.user.id);
    res.json(status);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;