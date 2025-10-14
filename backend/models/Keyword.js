const mongoose = require('mongoose');

const KeywordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  keyword: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  caseSensitive: {
    type: Boolean,
    default: false
  },
  exactMatch: {
    type: Boolean,
    default: false
  },
  matchCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for user keywords
KeywordSchema.index({ userId: 1, keyword: 1 }, { unique: true });
KeywordSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('Keyword', KeywordSchema);