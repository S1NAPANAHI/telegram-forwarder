const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // Web authentication fields
  email: {
    type: String,
    required: false, // Make optional as bot users might not have email
    unique: true,
    sparse: true // Allow multiple nulls for unique index
  },
  password: {
    type: String,
    required: false // Make optional
  },
  // Bot-specific fields
  telegramId: {
    type: String,
    required: false, // Make optional as web users might not have telegramId
    unique: true,
    sparse: true // Allow multiple nulls for unique index
  },
  username: String,
  firstName: String,
  lastName: String,
  language: {
    type: String,
    default: 'fa'
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'premium', 'enterprise'],
      default: 'free'
    },
    keywordsLimit: {
      type: Number,
      default: 10
    },
    channelsLimit: { // Added from plan
      type: Number,
      default: 5
    },
    expiresAt: {
      type: Date
    }
  },
  isActive: { // Added from plan
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: { // Keep for web users
    type: Date
  },
  lastActive: { // Added from plan, for bot users
    type: Date,
    default: Date.now
  }
});

// Indexes for faster queries
UserSchema.index({ isActive: 1 }); // Added from plan

module.exports = mongoose.model('User', UserSchema);