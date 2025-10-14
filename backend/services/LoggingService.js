const mongoose = require('mongoose');
const MessageLog = require('../models/MessageLog');

class LoggingService {
    async logMessageProcessing(messageData) {
        const {
            userId,
            keywordId,
            channelId,
            originalMessage,
            matchedText,
            forwardedTo = [],
            status = 'processed'
        } = messageData;

        const logEntry = new MessageLog({
            userId,
            keywordId,
            channelId,
            originalMessage,
            matchedText,
            forwardedTo,
            status,
            processingTime: messageData.processingTime || 0
        });

        return await logEntry.save();
    }

    async checkDuplicate(userId, messageId, platform, timeWindow = 3600000) { // 1 hour
        const timeThreshold = new Date(Date.now() - timeWindow);
        
        const duplicate = await MessageLog.findOne({
            userId,
            'originalMessage.messageId': messageId,
            'originalMessage.platform': platform,
            createdAt: { $gte: timeThreshold }
        });

        return !!duplicate;
    }

    async getUserStats(userId, days = 7) {
        const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        
        const stats = await MessageLog.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    createdAt: { $gte: dateThreshold }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const keywordStats = await MessageLog.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    createdAt: { $gte: dateThreshold }
                }
            },
            {
                $group: {
                    _id: '$keywordId',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'keywords',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'keyword'
                }
            }
        ]);

        return {
            statusCounts: stats,
            keywordCounts: keywordStats
        };
    }

    async getUserLogs(userId) {
        const logs = await MessageLog.find({ userId })
            .sort({ createdAt: -1 }) // Sort by newest first (createdAt is the new timestamp field)
            .populate('keywordId', 'keyword') // Populate keyword details
            .populate('channelId', 'channelName platform') // Populate channel details
            .populate('forwardedTo.destinationId', 'name platform'); // Populate destination details
        return logs;
    }

    async getLogById(userId, logId) {
        const log = await MessageLog.findOne({ _id: logId, userId })
            .populate('keywordId', 'keyword')
            .populate('channelId', 'channelName platform')
            .populate('forwardedTo.destinationId', 'name platform');
        return log;
    }

    async updateLogStatus(logId, status) {
        return await MessageLog.findByIdAndUpdate(logId, { status }, { new: true });
    }

    async updateLogEntry(logId, updateData) {
        return await MessageLog.findByIdAndUpdate(logId, updateData, { new: true });
    }
}

module.exports = new LoggingService();