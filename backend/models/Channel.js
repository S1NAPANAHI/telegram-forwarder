const mongoose = require('mongoose');

const ChannelSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  platform: {
    type: String,
    enum: ['telegram', 'eitaa', 'website'],
    required: true
  },
  channelUrl: {
    type: String,
    required: true
  },
  channelName: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastChecked: {
    type: Date,
    default: Date.now
  },
  credentials: {
    phone: String,
    password: String,
    sessionData: String
  },
  monitoringSettings: {
    checkInterval: {
      type: Number,
      default: 30000 // 30 seconds
    },
    maxMessagesPerCheck: {
      type: Number,
      default: 50
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

ChannelSchema.index({ userId: 1, platform: 1 });
ChannelSchema.index({ isActive: 1, platform: 1 });

module.exports = mongoose.model('Channel', ChannelSchema);