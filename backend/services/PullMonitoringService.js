// PullMonitoringService.js - Phase 2.3: Pull-based Monitoring
// Periodic polling and scraping for channels before full Telegram API implementation

const { supabase } = require('../database/supabase');
const logger = require('../utils/logger');
const axios = require('axios');
const cheerio = require('cheerio');

class PullMonitoringService {
    constructor() {
        this.activePollers = new Map(); // channel_id -> interval
        this.defaultInterval = 30000; // 30 seconds
        this.maxRetries = 3;
    }

    /**
     * Start pull-based monitoring for a channel
     * @param {Object} channel - Channel configuration
     */
    async startPolling(channel) {
        try {
            if (this.activePollers.has(channel.id)) {
                logger.warn(`Polling already active for channel ${channel.id}`);
                return;
            }

            const interval = channel.check_interval || this.defaultInterval;
            
            logger.info(`Starting pull monitoring for channel: ${channel.channel_name} (${channel.id})`);

            // Choose appropriate polling method based on platform
            let pollingMethod;
            switch (channel.platform) {
                case 'telegram':
                    pollingMethod = () => this.pollTelegramChannel(channel);
                    break;
                case 'website':
                    pollingMethod = () => this.pollWebsite(channel);
                    break;
                case 'rss':
                    pollingMethod = () => this.pollRSSFeed(channel);
                    break;
                default:
                    logger.warn(`Unsupported platform for pull monitoring: ${channel.platform}`);
                    return;
            }

            // Start polling interval
            const intervalId = setInterval(async () => {
                try {
                    await pollingMethod();
                } catch (error) {
                    logger.error(`Polling error for channel ${channel.id}:`, error.message);
                }
            }, interval);

            this.activePollers.set(channel.id, intervalId);
            
            // Run initial poll
            await pollingMethod();
            
        } catch (error) {
            logger.error(`Error starting polling for channel ${channel.id}:`, error);
            throw error;
        }
    }

    /**
     * Stop polling for a channel
     * @param {string} channelId - Channel ID
     */
    stopPolling(channelId) {
        const intervalId = this.activePollers.get(channelId);
        if (intervalId) {
            clearInterval(intervalId);
            this.activePollers.delete(channelId);
            logger.info(`Stopped polling for channel ${channelId}`);
        }
    }

    /**
     * Poll a Telegram channel using web scraping (for public channels)
     * @param {Object} channel - Channel configuration
     */
    async pollTelegramChannel(channel) {
        try {
            const channelUrl = this.extractTelegramChannelUrl(channel.channel_url);
            if (!channelUrl) {
                throw new Error(`Invalid Telegram channel URL: ${channel.channel_url}`);
            }

            // For public channels, we can scrape t.me pages
            if (channelUrl.startsWith('@') || channelUrl.includes('t.me/')) {
                return await this.scrapeTelegramPublicChannel(channel, channelUrl);
            }
            
            // For private channels or those requiring authentication,
            // we need to fall back to other methods or wait for Client API
            logger.warn(`Cannot poll private Telegram channel: ${channelUrl}`);
            
        } catch (error) {
            logger.error(`Error polling Telegram channel ${channel.id}:`, error.message);
        }
    }

    /**
     * Scrape public Telegram channel
     * @param {Object} channel - Channel configuration
     * @param {string} channelUrl - Channel URL
     */
    async scrapeTelegramPublicChannel(channel, channelUrl) {
        try {
            // Convert to web URL format
            let webUrl = channelUrl;
            if (channelUrl.startsWith('@')) {
                webUrl = `https://t.me/s/${channelUrl.substring(1)}`;
            } else if (channelUrl.includes('t.me/') && !channelUrl.includes('/s/')) {
                webUrl = channelUrl.replace('t.me/', 't.me/s/');
            }

            const response = await axios.get(webUrl, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; TelegramForwarderBot/1.0)'
                }
            });

            const $ = cheerio.load(response.data);
            const messages = [];

            // Extract messages from Telegram web preview
            $('.tgme_widget_message').each((index, element) => {
                const messageElement = $(element);
                const messageText = messageElement.find('.tgme_widget_message_text').text().trim();
                const messageDate = messageElement.find('.tgme_widget_message_date time').attr('datetime');
                const messageId = messageElement.attr('data-post');

                if (messageText && messageId) {
                    messages.push({
                        id: messageId,
                        text: messageText,
                        date: messageDate || new Date().toISOString(),
                        platform: 'telegram',
                        source_url: webUrl
                    });
                }
            });

            // Process new messages
            for (const message of messages) {
                await this.processPolledMessage(channel, message);
            }

            logger.debug(`Polled ${messages.length} messages from ${channelUrl}`);
            
        } catch (error) {
            if (error.response?.status === 404) {
                logger.warn(`Telegram channel not found or private: ${channelUrl}`);
            } else {
                throw error;
            }
        }
    }

    /**
     * Poll a website for new content
     * @param {Object} channel - Channel configuration
     */
    async pollWebsite(channel) {
        try {
            const response = await axios.get(channel.channel_url, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; TelegramForwarderBot/1.0)'
                }
            });

            const $ = cheerio.load(response.data);
            
            // Extract content based on common patterns
            // This is a basic implementation - can be enhanced per site
            const articles = [];
            
            // Look for common article selectors
            const selectors = [
                'article',
                '.post',
                '.news-item',
                '.article',
                '[class*="post"]',
                '[class*="article"]'
            ];

            for (const selector of selectors) {
                $(selector).each((index, element) => {
                    if (articles.length >= 10) return false; // Limit to 10 items
                    
                    const articleElement = $(element);
                    const title = articleElement.find('h1, h2, h3, .title, [class*="title"]').first().text().trim();
                    const content = articleElement.text().trim().substring(0, 500);
                    const link = articleElement.find('a').first().attr('href');
                    
                    if (title && content) {
                        articles.push({
                            id: `website_${Date.now()}_${index}`,
                            text: `${title}\n\n${content}`,
                            date: new Date().toISOString(),
                            platform: 'website',
                            source_url: link ? new URL(link, channel.channel_url).href : channel.channel_url
                        });
                    }
                });
                
                if (articles.length > 0) break; // Found articles with this selector
            }

            // Process new content
            for (const article of articles) {
                await this.processPolledMessage(channel, article);
            }

            logger.debug(`Polled ${articles.length} articles from ${channel.channel_url}`);
            
        } catch (error) {
            logger.error(`Error polling website ${channel.channel_url}:`, error.message);
        }
    }

    /**
     * Poll an RSS feed
     * @param {Object} channel - Channel configuration
     */
    async pollRSSFeed(channel) {
        try {
            const response = await axios.get(channel.channel_url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'TelegramForwarderBot/1.0'
                }
            });

            const $ = cheerio.load(response.data, { xmlMode: true });
            const items = [];

            // Parse RSS items
            $('item').each((index, element) => {
                const itemElement = $(element);
                const title = itemElement.find('title').text().trim();
                const description = itemElement.find('description').text().trim();
                const link = itemElement.find('link').text().trim();
                const pubDate = itemElement.find('pubDate').text().trim();
                const guid = itemElement.find('guid').text().trim();

                if (title) {
                    items.push({
                        id: guid || `rss_${Date.now()}_${index}`,
                        text: `${title}${description ? '\n\n' + description : ''}`,
                        date: pubDate || new Date().toISOString(),
                        platform: 'rss',
                        source_url: link || channel.channel_url
                    });
                }
            });

            // Process new items
            for (const item of items) {
                await this.processPolledMessage(channel, item);
            }

            logger.debug(`Polled ${items.length} items from RSS feed ${channel.channel_url}`);
            
        } catch (error) {
            logger.error(`Error polling RSS feed ${channel.channel_url}:`, error.message);
        }
    }

    /**
     * Process a polled message (check for duplicates, keywords, forwarding)
     * @param {Object} channel - Channel configuration
     * @param {Object} message - Polled message
     */
    async processPolledMessage(channel, message) {
        try {
            // Check if message already processed (simple duplicate detection)
            const { data: existing } = await supabase
                .from('message_logs')
                .select('id')
                .eq('channel_id', channel.id)
                .eq('original_message_id', message.id)
                .single();

            if (existing) {
                return; // Already processed
            }

            // Get user's keywords
            const { data: keywords } = await supabase
                .from('keywords')
                .select('*')
                .eq('user_id', channel.user_id)
                .eq('is_active', true);

            // Check if message matches keywords
            let shouldForward = !keywords || keywords.length === 0; // Forward all if no keywords
            
            if (keywords && keywords.length > 0) {
                const messageText = message.text.toLowerCase();
                shouldForward = keywords.some(keyword => {
                    const kw = keyword.keyword.toLowerCase();
                    
                    if (keyword.exact_match) {
                        return messageText === kw;
                    } else {
                        return messageText.includes(kw);
                    }
                });
            }

            if (shouldForward) {
                // Get user's destinations
                const { data: destinations } = await supabase
                    .from('destinations')
                    .select('*')
                    .eq('user_id', channel.user_id)
                    .eq('is_active', true);

                // Forward to destinations (this would need the bot instance)
                // For now, just log that we would forward
                logger.info(`Would forward message from ${channel.channel_name}: ${message.text.substring(0, 100)}...`);
                
                // Log the message
                await supabase
                    .from('message_logs')
                    .insert({
                        user_id: channel.user_id,
                        channel_id: channel.id,
                        original_message_id: message.id,
                        original_message_text: message.text,
                        matched_text: message.text.substring(0, 200),
                        status: 'processed_pull',
                        processing_time_ms: 0
                    });
            }
            
        } catch (error) {
            logger.error(`Error processing polled message:`, error);
        }
    }

    /**
     * Extract proper Telegram channel URL
     * @param {string} url - Input URL
     * @returns {string} - Standardized channel URL
     */
    extractTelegramChannelUrl(url) {
        if (!url) return null;
        
        // Handle different URL formats
        if (url.startsWith('@')) {
            return url;
        }
        
        if (url.includes('t.me/')) {
            const match = url.match(/t\.me\/([^/\s]+)/);
            if (match) {
                return `@${match[1]}`;
            }
        }
        
        // Assume it's a channel username
        if (url.match(/^[a-zA-Z0-9_]+$/)) {
            return `@${url}`;
        }
        
        return url;
    }

    /**
     * Get polling status for all active pollers
     * @returns {Array} - Array of polling statuses
     */
    getPollingStatus() {
        return Array.from(this.activePollers.entries()).map(([channelId, intervalId]) => ({
            channel_id: channelId,
            active: true,
            interval_id: intervalId
        }));
    }

    /**
     * Stop all active polling
     */
    stopAllPolling() {
        for (const [channelId, intervalId] of this.activePollers) {
            clearInterval(intervalId);
        }
        this.activePollers.clear();
        logger.info('Stopped all active polling');
    }
}

module.exports = PullMonitoringService;