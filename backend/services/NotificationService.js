const winston = require('winston');
const MessageQueueService = require('./MessageQueueService');
const supabase = require('../database/supabase');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'notification-service' },
  transports: [new winston.transports.Console({ format: winston.format.simple() })]
});

class NotificationService {
  constructor(telegramBot) {
    this.bot = telegramBot; // Telegraf/grammY bot instance
  }

  async notifyAll({ queueRecord, user }) {
    // Fan-out to all enabled channels
    const tasks = [];
    tasks.push(this.notifyTelegramDM(queueRecord, user).catch(e => logger.warn('Telegram DM failed:', e.message)));
    tasks.push(this.notifyWebFeed(queueRecord, user).catch(e => logger.warn('Web feed notify failed:', e.message)));
    tasks.push(this.notifyEmailDigest(queueRecord, user).catch(e => logger.warn('Email notify failed:', e.message)));

    await Promise.allSettled(tasks);
  }

  async notifyTelegramDM(queueRecord, user) {
    if (!this.bot || !user?.telegram_id) {
      logger.warn('Skipping Telegram DM: missing bot or user.telegram_id');
      return;
    }
    const text = this.formatMessage(queueRecord);
    await this.bot.telegram.sendMessage(user.telegram_id, text, { disable_web_page_preview: true });
  }

  async notifyWebFeed(queueRecord, user) {
    // Insert into a small real-time feed table for frontend polling/streaming
    const payload = {
      user_id: queueRecord.user_id,
      queue_id: queueRecord.id,
      title: 'Matched message',
      content: queueRecord.message_text?.slice(0, 500) || '',
      data: queueRecord.message_data || null,
      created_at: new Date().toISOString()
    };
    await supabase.from('message_feed').insert([payload]);
  }

  async notifyEmailDigest(queueRecord, user) {
    // Optional: push to email queue table (processed by a worker/cron)
    const payload = {
      user_id: queueRecord.user_id,
      queue_id: queueRecord.id,
      to_address: user?.email || null,
      subject: 'New matched message',
      body_text: this.formatMessage(queueRecord),
      status: 'queued',
      created_at: new Date().toISOString()
    };
    await supabase.from('email_queue').insert([payload]);
  }

  formatMessage(q) {
    const lines = [];
    lines.push(`Source: ${q.original_chat_id || 'unknown'}`);
    if (q.matched_keywords) lines.push(`Matched: ${JSON.stringify(q.matched_keywords)}`);
    lines.push('');
    lines.push(q.message_text || '[no text]');
    return lines.join('\n');
  }
}

module.exports = NotificationService;
