const TelegramBot = require('node-telegram-bot-api');
const supabase = require('../database/supabase');
const DuplicateDetector = require('./duplicateDetector');

const telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

async function forwardMessage(message, destination, keywordObj) {
  try {
    let forwardedMessageId;
    let messageContent = '';

    if (message.text || message.caption) {
      messageContent = message.text || message.caption;
    } else if (message.title && message.link) {
      messageContent = `*${message.title}*\n\n${message.content || ''}\n\nRead more: ${message.link}`;
    } else {
      console.warn('Unknown message format for forwarding:', { chat: message.chat?.id, message_id: message.message_id });
      return;
    }

    const fullMessage = keywordObj?.keyword
      ? `*Keyword Match: ${keywordObj.keyword}*\n\n${messageContent}`
      : messageContent;

    if (destination.platform === 'telegram') {
      console.log('Forwarding to Telegram:', { to: destination.chat_id, from: message.chat?.id, msg: message.message_id });
      forwardedMessageId = await telegramBot.sendMessage(destination.chat_id, fullMessage, { parse_mode: 'Markdown' });
    } else if (destination.platform === 'eitaa') {
      console.log(`Forwarding to Eitaa destination ${destination.name} (chat ID: ${destination.chat_id})`);
      forwardedMessageId = 'eitaa_mock_message_id';
    } else {
      console.warn(`Unsupported platform for forwarding: ${destination.platform}`);
      return;
    }

    if (message.logId) {
      const { error } = await supabase
        .from('message_logs')
        .update({ status: 'success' })
        .eq('id', message.logId);
      if (error) console.warn('Failed to update message log:', error.message);
    }

    console.log(`Message forwarded successfully to ${destination.name} (${destination.platform})`);
  } catch (error) {
    console.error(`Error forwarding message to ${destination.name} (${destination.platform}):`, error?.message || error);
    if (message.logId) {
      await supabase
        .from('message_logs')
        .update({ status: 'failed' })
        .eq('id', message.logId);
    }
  }
}

async function checkDuplicate(userId, keywordId, messageText) {
  const duplicateDetector = new DuplicateDetector();
  return await duplicateDetector.isDuplicate(userId, messageText, keywordId);
}

module.exports = {
  forwardMessage,
  checkDuplicate
};