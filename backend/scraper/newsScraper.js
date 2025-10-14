const axios = require('axios');
const cheerio = require('cheerio');
const KeywordService = require('../services/KeywordService');
const LoggingService = require('../services/LoggingService');
const ChannelService = require('../services/ChannelService');
const { forwardMessage, checkDuplicate } = require('../services/forwardingService');

class NewsScraper {
  constructor() {
    this.scrapers = {
      'irna.ir': this.scrapeIRNA,
      'isna.ir': this.scrapeISNA,
      'mehrnews.com': this.scrapeMehr,
    };
  }

  extractDomain(url) {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace(/^www\./, '');
    } catch (error) {
      console.error(`Error extracting domain from URL ${url}:`, error);
      return null;
    }
  }

  async monitorNewsWebsite(channel) {
    const domain = this.extractDomain(channel.channel_url);
    const scraper = this.scrapers[domain];
    
    if (!scraper) {
      console.warn(`No scraper available for domain: ${domain}`);
      return;
    }

    try {
      const articles = await scraper(channel.channel_url);
      await this.processNewArticles(articles, channel);
    } catch (error) {
      console.error(`Error scraping ${channel.channel_url}:`, error);
    }
  }

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

  async scrapeMehr(url) {
    console.log(`Scraping Mehrnews.com is not yet implemented. URL: ${url}`);
    return [];
  }

  async processNewArticles(articles, channel) {
    const lastChecked = channel.last_checked || new Date(0);
    let newLastChecked = lastChecked;

    for (const article of articles) {
      if (new Date(article.timestamp) > new Date(lastChecked)) {
        await this.checkArticleForKeywords(article, channel);
        if (new Date(article.timestamp) > new Date(newLastChecked)) {
          newLastChecked = new Date(article.timestamp);
        }
      }
    }

    await ChannelService.updateLastChecked(channel.id);
  }

  async checkArticleForKeywords(article, channel) {
    let logEntry;
    try {
      const keywords = await KeywordService.getUserKeywords(channel.user_id);

      const fullText = `${article.title} ${article.content}`;
      
      for (const keywordObj of keywords) {
        if (this.isKeywordMatch(fullText, keywordObj)) {
          const isDuplicate = await checkDuplicate(
            channel.user_id,
            keywordObj.id,
            article.link
          );
          if (!isDuplicate) {
            logEntry = await LoggingService.logMessage({
              userId: channel.user_id,
              keywordId: keywordObj.id,
              channelId: channel.id,
              originalMessageId: article.link,
              originalMessageText: fullText,
              matchedText: fullText,
              status: 'pending'
            });
            await forwardMessage({ ...article, logId: logEntry.id }, { ...channel, chat_id: channel.channel_url }, keywordObj);
          }
          break;
        }
      }
    } catch (error) {
      if (logEntry) {
        await LoggingService.updateLogStatus(logEntry.id, 'failed');
      }
      console.error('Error processing scraped article:', error);
    }
  }

  isKeywordMatch(text, keywordObj) {
    let searchText = text;
    let searchKeyword = keywordObj.keyword;

    if (!keywordObj.case_sensitive) {
      searchText = searchText.toLowerCase();
      searchKeyword = searchKeyword.toLowerCase();
    }

    if (keywordObj.exact_match) {
      return searchText === searchKeyword;
    } else {
      return searchText.includes(searchKeyword);
    }
  }
}

module.exports = NewsScraper;