const natural = require('natural');
const persianPreprocess = require('persian-preprocess');
const Log = require('../models/MessageLog');
const User = require('../models/User');

// این کلاس وظیفه بررسی و تشخیص پیام‌های تکراری را بر عهده دارد
class DuplicateDetector {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    // آستانه شباهت برای تشخیص تکراری بودن
    this.similarityThreshold = 0.8;
  }

  // بررسی اینکه آیا یک پیام تکراری است یا خیر
  async isDuplicate(userId, newMessage, keywordId) {
    // دریافت لاگ‌های اخیر برای این کلمه کلیدی
    const recentLogs = await Log.find({
      userId,
      keywordId,
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24 ساعت گذشته
    }).limit(50);

    // پیش‌پردازش پیام جدید
    const processedNewMessage = this.preprocessText(newMessage);

    for (const log of recentLogs) {
      // محاسبه شباهت بین پیام جدید و پیام‌های قبلی
      const similarity = this.calculateSimilarity(
        processedNewMessage,
        this.preprocessText(log.message)
      );

      // اگر شباهت از آستانه بیشتر بود، پیام تکراری است
      if (similarity >= this.similarityThreshold) {
        return true;
      }
    }

    return false;
  }

  // پیش‌پردازش متن فارسی
  preprocessText(text) {
    if (!text) return '';

    // نرمال‌سازی و حذف کلمات ایست
    const processedText = persianPreprocess(text)
      .normalize()
      .stopword()
      .toString();

    // توکنایز کردن متن پردازش شده
    const tokens = this.tokenizer.tokenize(processedText);

    return tokens.join(' ');
  }

  // محاسبه شباهت بین دو متن
  calculateSimilarity(text1, text2) {
    if (!text1 || !text2) return 0;

    // استفاده از فاصله Jaro-Winkler برای متون فارسی
    return natural.JaroWinklerDistance(text1, text2, {});
  }

  // به‌روزرسانی آستانه شباهت بر اساس بازخورد کاربر
  async updateSimilarityThreshold(userId, feedback) {
    if (feedback === 'too_many_duplicates') {
      this.similarityThreshold = Math.min(0.9, this.similarityThreshold + 0.05);
    } else if (feedback === 'missed_duplicates') {
      this.similarityThreshold = Math.max(0.6, this.similarityThreshold - 0.05);
    }

    // ذخیره تنظیمات کاربر در پایگاه داده
    await User.findByIdAndUpdate(userId, {
      'settings.similarityThreshold': this.similarityThreshold
    });
  }
}

module.exports = DuplicateDetector;