const queuePipeline = require('../pipeline/queuePipeline');
const ChannelService = require('../services/ChannelService');

module.exports = function attachPipeline(bot) {
  const pipeline = queuePipeline(bot, async (userId) => {
    // minimal user lookup; extend as needed
    const { getUserById } = require('../services/UserService');
    return await getUserById(userId);
  });

  return {
    async onMatched(msg, userId, channelId) {
      const channel = await ChannelService.getChannelById(userId, channelId);
      if (!channel) return;
      await pipeline.handleMatchedMessage({ msg, userId, channel });
    }
  };
};
