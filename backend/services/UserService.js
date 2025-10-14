const User = require('../models/User');
const Keyword = require('../models/Keyword');
const Channel = require('../models/Channel');

class UserService {
    async findOrCreateUser(telegramUser) {
        try {
            let user = await User.findOne({ telegramId: telegramUser.id.toString() });
            
            if (!user) {
                user = new User({
                    telegramId: telegramUser.id.toString(),
                    username: telegramUser.username,
                    firstName: telegramUser.first_name,
                    lastName: telegramUser.last_name,
                    language: telegramUser.language_code || 'fa'
                });
                await user.save();
            } else {
                // Update last active
                user.lastActive = new Date();
                await user.save();
            }
            
            return user;
        } catch (error) {
            console.error('Error in findOrCreateUser:', error);
            throw error;
        }
    }

    async getUserSubscription(userId) {
        const user = await User.findById(userId);
        return user.subscription;
    }

    async canAddKeyword(userId) {
        const user = await User.findById(userId);
        const keywordCount = await Keyword.countDocuments({ userId, isActive: true });
        
        return keywordCount < user.subscription.keywordsLimit;
    }

    async canAddChannel(userId) {
        const user = await User.findById(userId);
        const channelCount = await Channel.countDocuments({ userId, isActive: true });
        
        return channelCount < user.subscription.channelsLimit;
    }

    async updateUserPlan(userId, plan) {
        const plans = {
            free: { keywordsLimit: 10, channelsLimit: 5 },
            premium: { keywordsLimit: 100, channelsLimit: 20 },
            enterprise: { keywordsLimit: 1000, channelsLimit: 100 }
        };

        const update = {
            'subscription.plan': plan,
            'subscription.keywordsLimit': plans[plan].keywordsLimit,
            'subscription.channelsLimit': plans[plan].channelsLimit,
            'subscription.expiresAt': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        };

        return await User.findByIdAndUpdate(userId, update, { new: true });
    }

    async updateLastActive(userId) {
        return await User.findByIdAndUpdate(userId, { lastActive: new Date() }, { new: true });
    }
}

module.exports = new UserService();