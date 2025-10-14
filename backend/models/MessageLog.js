const mongoose = require('mongoose');

const messageLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    keywordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Keyword',
        required: true
    },
    channelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Channel'
    },
    originalMessage: {
        messageId: String,
        text: String,
        platform: String,
        channelName: String,
        timestamp: Date
    },
    matchedText: {
        type: String,
        required: true
    },
    forwardedTo: [{
        destinationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Destination'
        },
        status: {
            type: String,
            enum: ['success', 'failed', 'pending']
        },
        error: String,
        timestamp: Date
    }],
    status: {
        type: String,
        enum: ['processed', 'duplicate', 'error', 'filtered'],
        default: 'processed'
    },
    duplicateOf: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MessageLog'
    },
    processingTime: Number, // in milliseconds
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// TTL index for automatic cleanup (keep logs for 30 days)
messageLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });
messageLogSchema.index({ userId: 1, status: 1 });
messageLogSchema.index({ 'originalMessage.messageId': 1, platform: 1 });

module.exports = mongoose.model('MessageLog', messageLogSchema);