const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const DestinationService = require('../services/DestinationService');

// @route   POST /api/destinations
// @desc    Add a new destination
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, chat_id, description, is_active = true, type = 'telegram', platform = 'telegram' } = req.body;

    if (!name || !chat_id) {
      return res.status(400).json({ error: 'Name and chat_id are required' });
    }

    const newDestination = await DestinationService.addDestination(req.user.id, {
      name: name.trim(),
      chat_id: chat_id.trim(),
      description: description?.trim() || null,
      is_active: Boolean(is_active),
      type,
      platform
    });

    res.status(201).json(newDestination);
  } catch (error) {
    console.error('Create destination error:', error);
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/destinations
// @desc    Get all destinations for user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { active_only } = req.query;
    const activeOnly = active_only === 'true';
    
    const destinations = await DestinationService.getUserDestinations(req.user.id, activeOnly);
    res.json(destinations);
  } catch (error) {
    console.error('Get destinations error:', error);
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/destinations/:id
// @desc    Update a destination
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, chat_id, description, is_active, type, platform } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Destination ID is required' });
    }

    // First check if the destination exists and belongs to the user
    const existingDestinations = await DestinationService.getUserDestinations(req.user.id, false);
    const existingDestination = existingDestinations.find(d => d.id === id);

    if (!existingDestination) {
      return res.status(404).json({ error: 'Destination not found or access denied' });
    }

    // Update the destination using Supabase directly since DestinationService doesn't have update method
    const supabase = require('../database/supabase');
    
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (chat_id !== undefined) updateData.chat_id = chat_id.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (is_active !== undefined) updateData.is_active = Boolean(is_active);
    if (type !== undefined) updateData.type = type;
    if (platform !== undefined) updateData.platform = platform;
    
    // Add updated timestamp
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('destinations')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return res.status(404).json({ error: 'Destination not found or access denied' });
    }

    res.json(data);
  } catch (error) {
    console.error('Update destination error:', error);
    res.status(500).json({ error: error.message });
  }
});

// @route   DELETE /api/destinations/:id
// @desc    Delete a destination
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const destination = await DestinationService.deleteDestination(req.user.id, req.params.id);

    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    res.json({ message: 'Destination deleted successfully' });
  } catch (error) {
    console.error('Delete destination error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;