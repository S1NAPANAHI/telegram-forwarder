const Destination = require('../models/Destination');

class DestinationService {
    async addDestination(userId, destinationData) {
        const destination = new Destination({
            userId,
            ...destinationData
        });
        return await destination.save();
    }

    async getUserDestinations(userId, activeOnly = true) {
        const query = { userId };
        if (activeOnly) {
            query.isActive = true;
        }
        return await Destination.find(query).sort({ createdAt: -1 });
    }

    async deleteDestination(userId, destinationId) {
        const destination = await Destination.findOneAndDelete({
            _id: destinationId,
            userId: userId
        });
        return destination;
    }
}

module.exports = new DestinationService();