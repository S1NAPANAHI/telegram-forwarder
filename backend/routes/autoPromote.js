const express = require('express');
const router = express.Router();
const AutoPromotionService = require('../services/AutoPromotionService');

// Manual trigger for auto-promotion
router.post('/auto-promote', async (req, res) => {
  try {
    const result = await AutoPromotionService.triggerManualPromotion();
    res.json({
      success: true,
      message: 'Auto-promotion triggered successfully',
      data: result
    });
  } catch (error) {
    console.error('Auto-promotion API error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Auto-promotion failed',
      message: error.message
    });
  }
});

// Get auto-promotion service status
router.get('/auto-promote/status', (req, res) => {
  try {
    const status = AutoPromotionService.getStatus();
    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Auto-promotion status error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Could not get status',
      message: error.message
    });
  }
});

// Legacy endpoint - promote specific chat (kept for compatibility)
router.post('/promote/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    
    // Get the discovered chat
    const supabase = require('../database/supabase');
    const { data: discoveredChat, error } = await supabase
      .from('discovered_chats')
      .select('*')
      .eq('chat_id', chatId)
      .eq('is_admin', true)
      .single();

    if (error || !discoveredChat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found or bot is not admin'
      });
    }

    // Use AutoPromotionService to promote
    const success = await AutoPromotionService.promoteChat(discoveredChat);
    
    if (success) {
      // Ensure destination exists
      await AutoPromotionService.ensureUserHasDestination(discoveredChat.user_id);
      
      // Notify monitoring manager
      await AutoPromotionService.notifyMonitoringManager();
      
      res.json({
        success: true,
        message: `Chat ${chatId} promoted successfully`,
        chatId
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Failed to promote chat',
        chatId
      });
    }
  } catch (error) {
    console.error(`Error promoting chat ${req.params.chatId}:`, error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;