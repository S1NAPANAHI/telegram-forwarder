const mongoose = require('mongoose');

const DestinationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['private_chat', 'group', 'channel'],
    required: true
  },
  platform: {
    type: String,
    enum: ['telegram', 'eitaa'],
    required: true
  },
  chatId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  forwardSettings: {
    includeMedia: {
      type: Boolean,
      default: true
    },
    includeCaption: {
      type: Boolean,
      default: true
    },
    addPrefix: {
      type: Boolean,
      default: true
    },
    prefixText: {
      type: String,
      default: '🔔 ' // Default prefix
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

DestinationSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('Destination', DestinationSchema);