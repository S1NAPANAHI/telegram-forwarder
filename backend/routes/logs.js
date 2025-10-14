const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const LoggingService = require('../services/LoggingService');

// @route   GET /api/logs
// @desc    Get all logs for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const logs = await LoggingService.getUserLogs(req.user.id);
    res.json(logs);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/logs/:id
// @desc    Get a single log entry by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const log = await LoggingService.getLogById(req.user.id, req.params.id);

    if (!log) {
      return res.status(404).json({ msg: 'Log entry not found' });
    }

    res.json(log);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;