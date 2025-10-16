const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const monitoringManager = require('../services/monitoringManager');
const ChannelService = require('../services/ChannelService');

// @route   POST /api/monitoring/start/:channelId
// @desc    Start monitoring a specific channel
// @access  Private
router.post('/start/:channelId', authMiddleware, async (req, res) => {
  try {
    const channelId = req.params.channelId;
    const channel = await ChannelService.getChannelById(req.user.id, channelId);

    if (!channel) {
      return res.status(404).json({ msg: 'Channel not found' });
    }

    await monitoringManager.startMonitoringChannel(channel);
    await ChannelService.toggleChannel(req.user.id, channelId, true);

    res.json({ msg: `Monitoring started for channel ${channel.channel_name}` });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/monitoring/stop/:channelId
// @desc    Stop monitoring a specific channel
// @access  Private
router.post('/stop/:channelId', authMiddleware, async (req, res) => {
  try {
    const channelId = req.params.channelId;
    const channel = await ChannelService.getChannelById(req.user.id, channelId);

    if (!channel) {
      return res.status(404).json({ msg: 'Channel not found' });
    }

    await monitoringManager.stopMonitoringChannel(channelId);
    await ChannelService.toggleChannel(req.user.id, channelId, false);

    res.json({ msg: `Monitoring stopped for channel ${channel.channel_name}` });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/monitoring/status
// @desc    Get status of all monitored channels for the user
// @access  Private
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const status = monitoringManager.getMonitoringStatus(req.user.id);
    res.json(status);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/monitoring/refresh
// @desc    Refresh monitoring for all channels (reload from database)
// @access  Private
router.post('/refresh', authMiddleware, async (req, res) => {
  try {
    console.log('Refreshing monitoring manager...');
    
    // Stop and restart monitoring for all active channels
    const activeMonitors = Array.from(monitoringManager.activeMonitors.keys());
    for (const channelId of activeMonitors) {
      try {
        await monitoringManager.stopMonitoring(channelId);
      } catch (e) {
        console.warn(`Error stopping channel ${channelId}:`, e.message);
      }
    }
    
    // Reload and restart with fresh data
    await monitoringManager.loadAndStartActiveChannels();
    
    const status = monitoringManager.getMonitoringStatus(req.user.id);
    console.log('Monitoring refresh completed');
    
    res.json({ 
      success: true, 
      message: 'Monitoring refreshed successfully',
      status 
    });
  } catch (error) {
    console.error('Error refreshing monitoring:', error.message);
    res.status(500).json({ error: 'Failed to refresh monitoring' });
  }
});

// @route   POST /api/monitoring/restart
// @desc    Restart entire monitoring manager
// @access  Private
router.post('/restart', authMiddleware, async (req, res) => {
  try {
    console.log('Restarting monitoring manager...');
    
    // Stop all current monitoring
    const activeMonitors = Array.from(monitoringManager.activeMonitors.keys());
    for (const channelId of activeMonitors) {
      try {
        await monitoringManager.stopMonitoring(channelId);
      } catch (e) {
        console.warn(`Error stopping channel ${channelId}:`, e.message);
      }
    }
    
    // Reload and restart
    await monitoringManager.loadAndStartActiveChannels();
    
    const status = monitoringManager.getMonitoringStatus();
    res.json({ 
      success: true, 
      message: 'Monitoring manager restarted successfully',
      status 
    });
  } catch (error) {
    console.error('Error restarting monitoring manager:', error.message);
    res.status(500).json({ error: 'Failed to restart monitoring manager' });
  }
});

module.exports = router;