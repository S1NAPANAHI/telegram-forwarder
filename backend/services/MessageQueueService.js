const supabase = require('../database/supabase');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'message-queue' },
  transports: [new winston.transports.Console({ format: winston.format.simple() })]
});

class MessageQueueService {
  static async enqueue({ user_id, channel_id, original_chat_id, message_text, message_type, matched_keywords, message_data }) {
    try {
      const payload = {
        user_id,
        channel_id,
        original_chat_id: String(original_chat_id || ''),
        message_text: message_text || '',
        message_type: message_type || 'text',
        matched_keywords: matched_keywords || null,
        message_data: message_data || null,
        status: 'pending'
      };
      const { data, error } = await supabase.from('message_queue').insert([payload]).select('*').single();
      if (error) throw error;
      logger.info(`Queued message ${data.id} for user ${user_id}`);
      return data;
    } catch (error) {
      logger.error('Failed to enqueue message:', error.message);
      throw error;
    }
  }

  static async markDelivered(id) {
    try {
      const { error } = await supabase
        .from('message_queue')
        .update({ status: 'delivered', delivered_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    } catch (error) {
      logger.error(`Failed to mark message ${id} delivered:`, error.message);
    }
  }

  static async markFailed(id, reason = '') {
    try {
      const { error } = await supabase
        .from('message_queue')
        .update({ status: 'failed', failure_reason: reason, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    } catch (error) {
      logger.error(`Failed to mark message ${id} failed:`, error.message);
    }
  }
}

module.exports = MessageQueueService;
