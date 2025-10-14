const User = require('../models/User');
const Channel = require('../models/Channel');
const UserService = require('./UserService');

class ChannelService {
    async addChannel(userId, channelData) {
        const canAdd = await UserService.canAddChannel(userId);
        if (!canAdd) {
            throw new Error('Channel limit reached. Please upgrade your plan.');
        }

        const channel = new Channel({
            userId,
            ...channelData
        });

        return await channel.save();
    }

    async getUserChannels(userId, activeOnly = true) {
        const query = { userId };
        if (activeOnly) {
            query.isActive = true;
        }
        
        return await Channel.find(query).sort({ createdAt: -1 });
    }

    async getActiveChannelsByPlatform(platform) {
        return await Channel.find({
            platform,
            isActive: true
        }).populate('userId', 'telegramId subscription');
    }

    async updateLastChecked(channelId) {
        return await Channel.findByIdAndUpdate(
            channelId,
            { lastChecked: new Date() },
            { new: true }
        );
    }

    async toggleChannel(userId, channelId, isActive) {
        return await Channel.findOneAndUpdate(
            { _id: channelId, userId },
            { isActive },
            { new: true }
        );
    }

    async deleteChannel(userId, channelId) {
        const channel = await Channel.findOneAndDelete({
            _id: channelId,
            userId: userId
        });
        return channel;
    }

    async getChannelById(userId, channelId) {
        const channel = await Channel.findOne({
            _id: channelId,
            userId: userId
        });
        return channel;
    }
}

module.exports = new ChannelService();