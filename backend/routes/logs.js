const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const LoggingService = require('../services/LoggingService');

// GET /api/logs - Get all logs for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const logs = await LoggingService.getLogsForUser(req.user.id);
    res.json(logs || []);
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// GET /api/logs/:id - Get a single log entry by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const log = await LoggingService.getLogsForUser(req.user.id, req.params.id);
    if (!log || log.length === 0) {
      return res.status(404).json({ error: 'Log entry not found' });
    }
    res.json(log[0]);
  } catch (error) {
    console.error('Get log by id error:', error);
    res.status(500).json({ error: 'Failed to fetch log entry' });
  }n});

module.exports = router;