const axios = require('axios');
const cheerio = require('cheerio');
const KeywordService = require('../services/KeywordService');
const LoggingService = require('../services/LoggingService');
const ChannelService = require('../services/ChannelService');
const { forwardMessage } = require('../services/forwardingService');

// این کلاس مسئول اسکرپ کردن وب‌سایت‌های خبری است
class NewsScraper {
  constructor() {
    // یک دیکشنری برای نگهداری توابع اسکرپر برای هر دامنه
    this.scrapers = {
      'irna.ir': this.scrapeIRNA,
      'isna.ir': this.scrapeISNA,
      'mehrnews.com': this.scrapeMehr,
    };
  }

  // استخراج دامنه از URL
  extractDomain(url) {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace(/^www\./, '');
    } catch (error) {
      console.error(`Error extracting domain from URL ${url}:`, error);
      return null;
    }
  }

  // مانیتورینگ یک وب‌سایت خبری
  async monitorNewsWebsite(channel) {
    const domain = this.extractDomain(channel.channelUrl);
    const scraper = this.scrapers[domain];
    
    if (!scraper) {
      console.warn(`No scraper available for domain: ${domain}`);
      return;
    }

    try {
      const articles = await scraper(channel.channelUrl);
      await this.processNewArticles(articles, channel);
    } catch (error) {
      console.error(`Error scraping ${channel.channelUrl}:`, error);
    }
  }

  // اسکرپ کردن خبرگزاری ایرنا
  async scrapeIRNA(url) {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    const articles = [];
    
    $('.news').each((index, element) => {
      const title = $(element).find('.title').text().trim();
      const link = $(element).find('a').attr('href');
      const summary = $(element).find('.summary').text().trim();
      
      if (title && link) {
        articles.push({
          title,
          link: new URL(link, url).href,
          content: summary,
          timestamp: new Date()
        });
      }
    });
    
    return articles;
  }

  // اسکرپ کردن خبرگزاری ایسنا
  async scrapeISNA(url) {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    const articles = [];
    
    $('.news').each((index, element) => {
      const title = $(element).find('.title').text().trim();
      const link = $(element).find('a').attr('href');
      const content = $(element).find('.lead').text().trim();
      
      if (title && link) {
        articles.push({
          title,
          link: new URL(link, url).href,
          content,
          timestamp: new Date()
        });
      }
    });
    
    return articles;
  }

  // اسکرپ کردن خبرگزاری مهر (پیاده‌سازی نشده)
  async scrapeMehr(url) {
    console.log(`Scraping Mehrnews.com is not yet implemented. URL: ${url}`);
    return [];
  }

  // پردازش مقالات جدید
  async processNewArticles(articles, channel) {
    const lastChecked = channel.lastChecked || new Date(0);
    let newLastChecked = lastChecked;

    for (const article of articles) {
      if (new Date(article.timestamp) > lastChecked) {
        await this.checkArticleForKeywords(article, channel);
        if (new Date(article.timestamp) > newLastChecked) {
          newLastChecked = new Date(article.timestamp);
        }
      }
    }

    // به‌روزرسانی زمان آخرین بررسی
    await ChannelService.updateLastChecked(channel._id);
  }

  // بررسی مقالات برای کلمات کلیدی
  async checkArticleForKeywords(article, channel) {
    let logEntry;
    try {
      const keywords = await KeywordService.getUserKeywords(channel.userId);

      const fullText = `${article.title} ${article.content}`;
      
      for (const keywordObj of keywords) {
        if (this.isKeywordMatch(fullText, keywordObj)) {
          const isDuplicate = await LoggingService.checkDuplicate(
            channel.userId,
            article.link, // Use article link as message ID for uniqueness
            'website'
          );
          if (!isDuplicate) {
            logEntry = await LoggingService.logMessageProcessing({
              userId: channel.userId,
              keywordId: keywordObj._id,
              channelId: channel._id,
              originalMessage: {
                messageId: article.link,
                text: fullText,
                platform: 'website',
                channelName: channel.channelName,
                timestamp: article.timestamp
              },
              matchedText: fullText,
              forwardedTo: [],
              status: 'pending'
            });
            await forwardMessage({ ...article, logId: logEntry._id }, { ...channel, chatId: channel.channelUrl }, keywordObj);
          }
          break;
        }
      }
    } catch (error) {
      if (logEntry) {
        await LoggingService.updateLogStatus(logEntry._id, 'failed');
      }
      console.error('Error processing scraped article:', error);
    }
  }

  // بررسی تطابق کلمه کلیدی
  isKeywordMatch(text, keywordObj) {
    let searchText = text;
    let searchKeyword = keywordObj.keyword;

    if (!keywordObj.caseSensitive) {
      searchText = searchText.toLowerCase();
      searchKeyword = searchKeyword.toLowerCase();
    }

    if (keywordObj.exactMatch) {
      return searchText === searchKeyword;
    } else {
      return searchText.includes(searchKeyword);
    }
  }
}

module.exports = NewsScraper;