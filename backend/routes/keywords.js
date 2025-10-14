const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const KeywordService = require('../services/KeywordService');

// Add keyword
router.post('/', auth, async (req, res) => {
  try {
    const { keyword, caseSensitive, exactMatch } = req.body;
    
    const newKeyword = await KeywordService.addKeyword(req.user.id, {
      keyword,
      caseSensitive: caseSensitive || false,
      exactMatch: exactMatch || false
    });

    res.json(newKeyword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all keywords for user
router.get('/', auth, async (req, res) => {
  try {
    const keywords = await KeywordService.getUserKeywords(req.user.id);
    res.json(keywords);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete keyword
router.delete('/:id', auth, async (req, res) => {
  try {
    const keyword = await KeywordService.deleteKeyword(req.user.id, req.params.id);
    
    if (!keyword) {
      return res.status(404).json({ error: 'Keyword not found' });
    }

    res.json({ message: 'Keyword deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;