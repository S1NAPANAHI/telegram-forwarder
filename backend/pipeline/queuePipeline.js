const MessageQueueService = require('../services/MessageQueueService');
const NotificationService = require('../services/NotificationService');

module.exports = function attachQueuePipeline(bot, getUserByChannel) {
  const notifier = new NotificationService(bot);

  return {
    async handleMatchedMessage({ msg, userId, channel }) {
      // 1) Enqueue to DB
      const queueRecord = await MessageQueueService.enqueue({
        user_id: userId,
        channel_id: channel.id,
        original_chat_id: msg.chat?.id,
        message_text: extractText(msg),
        message_type: detectType(msg),
        matched_keywords: extractMatchedKeywords(msg, channel),
        message_data: msg
      });

      // 2) Fan-out notifications
      const user = await getUserByChannel(userId);
      await notifier.notifyAll({ queueRecord, user });

      // 3) Mark delivered (best-effort)
      await MessageQueueService.markDelivered(queueRecord.id);
    }
  };
};

function extractText(msg) {
  if (!msg) return '';
  if (msg.text) return msg.text;
  if (msg.caption) return msg.caption;
  return '';
}

function detectType(msg) {
  if (!msg) return 'text';
  if (msg.photo) return 'photo';
  if (msg.video) return 'video';
  if (msg.document) return 'document';
  return 'text';
}

function extractMatchedKeywords(msg, channel) {
  // Placeholder: hook into your actual keyword matcher result if available in pipeline context
  return null;
}
