const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const DestinationService = require('../services/DestinationService');

// @route   POST /api/destinations
// @desc    Add a new destination
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { type, platform, chatId, name } = req.body;

    const newDestination = await DestinationService.addDestination(req.user.id, {
      type,
      platform,
      chat_id: chatId,
      name
    });

    res.json(newDestination);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/destinations
// @desc    Get all destinations for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const destinations = await DestinationService.getUserDestinations(req.user.id);
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   DELETE /api/destinations/:id
// @desc    Delete a destination
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const destination = await DestinationService.deleteDestination(req.user.id, req.params.id);

    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    res.json({ message: 'Destination deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;