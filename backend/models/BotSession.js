const mongoose = require('mongoose');

const botSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    currentState: {
        type: String,
        enum: [
            'idle',
            'awaiting_keyword',
            'awaiting_channel',
            'awaiting_destination',
            'configuring_settings'
        ],
        default: 'idle'
    },
    context: {
        // Store temporary data for multi-step processes
        action: String,
        tempData: mongoose.Schema.Types.Mixed
    },
    lastInteraction: {
        type: Date,
        default: Date.now
    },
    messageCount: {
        type: Number,
        default: 0
    }
});

// TTL for sessions (expire after 1 hour of inactivity)
botSessionSchema.index({ lastInteraction: 1 }, { expireAfterSeconds: 3600 });
botSessionSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('BotSession', botSessionSchema);