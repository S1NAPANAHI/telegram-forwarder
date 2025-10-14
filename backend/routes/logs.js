const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const LoggingService = require('../services/LoggingService');

// @route   GET /api/logs
// @desc    Get all logs for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const logs = await LoggingService.getLogsForUser(req.user.id);
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
    // Assuming getLogById is implemented in LoggingService to fetch a single log by ID and userId
    const log = await LoggingService.getLogsForUser(req.user.id, req.params.id);

    if (!log || log.length === 0) {
      return res.status(404).json({ msg: 'Log entry not found' });
    }

    res.json(log[0]); // Assuming it returns an array, take the first element
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;