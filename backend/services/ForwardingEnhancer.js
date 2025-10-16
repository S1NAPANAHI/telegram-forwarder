const attachPipeline = require('../pipeline');
const duplicateDetector = require('../services/duplicateDetector');
const KeywordService = require('../services/KeywordService');

module.exports = function enhanceForwarding(bot) {
  const pipeline = attachPipeline(bot);

  return {
    async handleIncomingMessage(msg, userId, channel) {
      // Duplicate guard
      if (await duplicateDetector.isDuplicate(msg)) return;

      // Keyword matching
      const matched = await KeywordService.matchForChannel(userId, channel.id, msg);
      if (!matched?.shouldForward) return;

      // Fan-out via queue pipeline
      await pipeline.onMatched(msg, userId, channel.id);
    }
  };
};
