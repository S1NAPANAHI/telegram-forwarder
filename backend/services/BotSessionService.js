const BotSession = require('../models/BotSession');

class BotSessionService {
    async createOrUpdateSession(userId, currentState, context = {}) {
        return await BotSession.findOneAndUpdate(
            { userId },
            { currentState, context, lastInteraction: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
    }

    async getSession(userId) {
        return await BotSession.findOne({ userId });
    }

    async clearSession(userId) {
        return await BotSession.deleteOne({ userId });
    }

    async updateLastInteraction(userId) {
        return await BotSession.updateOne({ userId }, { lastInteraction: new Date() });
    }
}

module.exports = new BotSessionService();