// این سرویس وظیفه فوروارد کردن پیام‌ها و بررسی تکراری بودن آن‌ها را بر عهده دارد

const TelegramBot = require('node-telegram-bot-api');
const Log = require('../models/MessageLog');
const Destination = require('../models/Destination');
const DuplicateDetector = require('./duplicateDetector');

// یک نمونه از ربات تلگرام برای فوروارد کردن پیام‌ها
const telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

// تابع اصلی برای فوروارد کردن پیام
async function forwardMessage(message, destination, keywordObj) {
  try {
    let forwardedMessageId;
    let messageContent = '';

    // تعیین محتوای پیام بر اساس منبع آن (پیام تلگرام یا مقاله اسکرپ شده)
    if (message.text || message.caption) { // از تلگرام
      messageContent = message.text || message.caption;
    } else if (message.title && message.link) { // از اسکرپر (مقاله)
      messageContent = `*${message.title}*\n\n${message.content || ''}\n\nRead more: ${message.link}`;
    } else {
      console.warn('Unknown message format for forwarding:', message);
      return;
    }

    // اضافه کردن کلمه کلیدی به متن پیام
    const fullMessage = `*Keyword Match: ${keywordObj.keyword}*\n\n${messageContent}`;

    if (destination.platform === 'telegram') {
      // فوروارد به مقصد تلگرامی
      forwardedMessageId = await telegramBot.sendMessage(destination.chatId, fullMessage, { parse_mode: 'Markdown' });
    } else if (destination.platform === 'eitaa') {
      // منطق فوروارد به ایتا (در حال حاضر به صورت جایگزین پیاده‌سازی شده)
      console.log(`Forwarding to Eitaa destination ${destination.name} (chat ID: ${destination.chatId}):\n${fullMessage}`);
      forwardedMessageId = 'eitaa_mock_message_id'; // شناسه ساختگی
    } else {
      console.warn(`Unsupported platform for forwarding: ${destination.platform}`);
      return;
    }

    // ثبت لاگ فوروارد موفق
    await Log.findByIdAndUpdate(
      message.logId, // فرض می‌شود که شیء پیام دارای شناسه لاگ است
      { $push: { forwardedTo: destination._id }, status: 'success' },
      { new: true }
    );

    console.log(`Message forwarded successfully to ${destination.name} (${destination.platform})`);
  } catch (error) {
    console.error(`Error forwarding message to ${destination.name} (${destination.platform}):`, error);
    // در صورت بروز خطا، وضعیت لاگ را به 'failed' تغییر بده
    if (message.logId) {
      await Log.findByIdAndUpdate(message.logId, { status: 'failed' });
    }
  }
}

// تابع برای بررسی تکراری بودن پیام
async function checkDuplicate(userId, keywordId, messageText) {
  const duplicateDetector = new DuplicateDetector();
  return await duplicateDetector.isDuplicate(userId, messageText, keywordId);
}

module.exports = {
  forwardMessage,
  checkDuplicate
};
