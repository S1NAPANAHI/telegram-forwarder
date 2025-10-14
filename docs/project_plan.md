# Project Plan: Telegram Keyword Bot

# 🚀 Comprehensive Project Development Guide

I'll break down every component in extreme detail with technical specifications and implementation steps.

## 📋 **Phase 1: Core Infrastructure (Weeks 1-2)**

### **Step 1.1: Project Setup & Architecture**

```
project-root/
├── frontend/          # React/Next.js application
├── backend/           # Node.js/Express API
├── bots/              # Telegram & Eitaa bot handlers
├── database/          # DB schemas & migrations
├── scraper/           # News website scrapers
├── ai-services/       # AI filtering modules
└── deployment/        # Docker & deployment configs
```

**Detailed Setup:**
```bash
# Initialize project
mkdir news-monitor-bot
cd news-monitor-bot

# Frontend
npx create-next-app @Webcite-for-new-authors-main\apps\frontend\dist\src\components\home\LatestPosts.d.ts frontend --typescript --tailwind --eslint
cd frontend
npm install axios react-query @headlessui/react @heroicons/react

# Backend
mkdir backend
cd backend
npm init -y
npm install express cors helmet morgan dotenv
npm install mongoose jsonwebtoken bcryptjs
npm install node-cron telegram-bot-api
npm install puppeteer cheerio
npm install express-rate-limit
```

### **Step 1.2: Database Design**

The project uses MongoDB with Mongoose for its database. A detailed breakdown of the database schema, including all collections (models), their fields, and indexes, can be found in the dedicated [Database Schema Documentation](database_schema.md).

The database connection is handled by `backend/database/connection.js`.
```

### **Step 1.3: Backend API Development**

**Express Server Structure:**
```javascript
// server.js
const express = require('express');
const mongoose = require('mongoose'); // Keep mongoose for connection.once
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const monitoringManager = require('./services/monitoringManager');
const connectDB = require('./database/connection'); // Import connectDB

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/keywords', require('./routes/keywords'));
app.use('/api/channels', require('./routes/channels'));
app.use('/api/destinations', require('./routes/destinations'));
app.use('/api/monitoring', require('./routes/monitoring'));
app.use('/api/logs', require('./routes/logs'));

// Connect to database
connectDB(); // Call the new connection function

// Initialize monitoring manager after DB connection
mongoose.connection.once('open', async () => {
  console.log('MongoDB connected successfully');
  await monitoringManager.initialize();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Detailed Route Examples:**

```javascript
// routes/keywords.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const KeywordService = require('../services/KeywordService');

// Add keyword
router.post('/', auth, async (req, res) => {
  try {
    const { keyword, caseSensitive, exactMatch } = req.body;
    
    const newKeyword = await KeywordService.addKeyword(req.user.id, {
      keyword,
      caseSensitive: caseSensitive || false,
      exactMatch: exactMatch || false
    });

    res.json(newKeyword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all keywords for user
router.get('/', auth, async (req, res) => {
  try {
    const keywords = await KeywordService.getUserKeywords(req.user.id);
    res.json(keywords);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete keyword
router.delete('/:id', auth, async (req, res) => {
  try {
    const keyword = await KeywordService.deleteKeyword(req.user.id, req.params.id);
    
    if (!keyword) {
      return res.status(404).json({ error: 'Keyword not found' });
    }

    res.json({ message: 'Keyword deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
``````

### **Step 1.4: Frontend Development**

**Next.js App Structure:**
```typescript
// pages/dashboard.tsx
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { InformationCircleIcon, ChartBarIcon, ClockIcon, KeyIcon } from '@heroicons/react/24/outline';


interface Keyword {
  _id: string;
  keyword: string;
  isActive: boolean;
  caseSensitive: boolean;
  exactMatch: boolean;
  createdAt: string;
}

interface Log {
    _id: string;
    message: string;
    timestamp: string;
    keywordId: { keyword: string };
    channelId: { channelName: string };
}

interface Channel {
    _id: string;
    channelName: string;
    isActive: boolean;
}

// Stat Card component
const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className="mr-4">{icon}</div>
        <div>
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);

export default function Dashboard() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { locale } = router;

  const [newKeyword, setNewKeyword] = useState('');
  const queryClient = useQueryClient();

  const changeLanguage = (lng: string) => {
    router.push(router.pathname, router.asPath, { locale: lng });
  };

  // Fetch keywords
  const { data: keywords, isLoading: isLoadingKeywords } = useQuery<Keyword[]>({
    queryKey: ['keywords'],
    queryFn: async () => {
      const response = await axios.get('/api/keywords');
      return response.data;
    },
  });

  // Fetch logs
  const { data: logs, isLoading: isLoadingLogs } = useQuery<Log[]>({
    queryKey: ['logs'],
    queryFn: async () => {
        const response = await axios.get('/api/logs');
        return response.data;
    }
  });

  // Fetch channels
  const { data: channels, isLoading: isLoadingChannels } = useQuery<Channel[]>({
    queryKey: ['channels'],
    queryFn: async () => {
        const response = await axios.get('/api/channels');
        return response.data;
    }
  });

  const addKeywordMutation = useMutation({
    mutationFn: (keyword: string) => axios.post('/api/keywords', { keyword }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keywords'] });
      setNewKeyword('');
    },
  });

  const deleteKeywordMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/keywords/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keywords'] });
    },
  });

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKeyword.trim()) {
      addKeywordMutation.mutate(newKeyword.trim());
    }
  };

  const { forwardedToday, chartData } = useMemo(() => {
    if (!logs) return { forwardedToday: 0, chartData: [] };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const forwardedToday = logs.filter(log => new Date(log.timestamp) >= today).length;

    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const chartData = last7Days.map(date => ({
        date,
        count: logs.filter(log => log.timestamp.startsWith(date)).length,
    }));

    return { forwardedToday, chartData };
  }, [logs]);

  const activeChannels = useMemo(() => {
      if(!channels) return 0;
      return channels.filter(c => c.isActive).length;
  }, [channels]);


  const isLoading = isLoadingKeywords || isLoadingLogs || isLoadingChannels;

  if (isLoading) return <div>{t('loadingKeywords')}</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">{t('dashboard')}</h1>
                <div>
                    <button onClick={() => changeLanguage('en')} disabled={locale === 'en'} className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 mr-2">English</button>
                    <button onClick={() => changeLanguage('fa')} disabled={locale === 'fa'} className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50">فارسی</button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard title={t('messagesForwardedToday')} value={forwardedToday} icon={<ChartBarIcon className='h-8 w-8 text-blue-500'/>} />
                <StatCard title={t('totalKeywords')} value={keywords?.length ?? 0} icon={<KeyIcon className='h-8 w-8 text-green-500'/>} />
                <StatCard title={t('activeChannels')} value={activeChannels} icon={<InformationCircleIcon className='h-8 w-8 text-indigo-500'/>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2">
                    {/* Chart */}
                    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                        <h2 className="text-xl font-bold mb-4">{t('forwardingActivityLast7Days')}</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#8884d8" name={t('forwardedMessages')} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Keyword Manager */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4">{t('keywordManager')}</h2>
                        <form onSubmit={handleAddKeyword} className="mb-8">
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    value={newKeyword}
                                    onChange={(e) => setNewKeyword(e.target.value)}
                                    placeholder={t('enterKeyword')}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    type="submit"
                                    disabled={addKeywordMutation.isPending}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {addKeywordMutation.isPending ? t('adding') : t('addKeyword')}
                                </button>
                            </div>
                            {addKeywordMutation.isError && (
                            <p className="text-red-500 mt-2">{t('errorAddingKeyword')}{(addKeywordMutation.error as Error).message}</p>
                            )}
                        </form>

                        <div className="grid gap-4">
                            {keywords?.map((keyword: Keyword) => (
                            <div key={keyword._id} className="p-4 border border-gray-200 rounded-lg flex justify-between items-center">
                                <div>
                                <span className="font-semibold">{keyword.keyword}</span>
                                <div className="text-sm text-gray-500">
                                    {keyword.caseSensitive && `${t('caseSensitive')} • `}
                                    {keyword.exactMatch && `${t('exactMatch')} • `}
                                    {t('added')} {new Date(keyword.createdAt).toLocaleDateString()}
                                </div>
                                </div>
                                <button
                                onClick={() => deleteKeywordMutation.mutate(keyword._id)}
                                disabled={deleteKeywordMutation.isPending}
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                                >
                                {deleteKeywordMutation.isPending ? t('deleting') : t('delete')}
                                </button>
                            </div>
                            ))}
                        </div>
                        {deleteKeywordMutation.isError && (
                            <p className="text-red-500 mt-2">{t('errorDeletingKeyword')}{(deleteKeywordMutation.error as Error).message}</p>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">{t('recentActivity')}</h2>
                    <ul className="space-y-4">
                        {logs?.slice(0, 10).map(log => (
                            <li key={log._id} className="flex items-start">
                                <ClockIcon className="h-5 w-5 text-gray-400 mr-3 mt-1"/>
                                <div>
                                    <p className="font-semibold">{log.keywordId.keyword}</p>
                                    <p className="text-sm text-gray-600 truncate">{log.message}</p>
                                    <p className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString()}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common'])),
  },
});


## 📡 **Phase 2: Monitoring System (Weeks 3-4)**

### **Step 2.1: Telegram Bot Implementation**

```javascript
// bots/telegramBot.js
const TelegramBot = require('node-telegram-bot-api');
const Channel = require('../models/Channel');
const Keyword = require('../models/Keyword');
const Destination = require('../models/Destination');
const { forwardMessage, checkDuplicate } = require('../services/forwardingService');

class TelegramMonitor {
  constructor() {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
      polling: true
    });
    this.monitoredChannels = new Map();
  }

  async initialize() {
    // Load all active channels from database
    const channels = await Channel.find({ 
      platform: 'telegram', 
      isActive: true 
    });
    
    for (const channel of channels) {
      await this.startMonitoringChannel(channel);
    }
  }

  async startMonitoringChannel(channel) {
    try {
      const chatId = await this.resolveChatId(channel.channelUrl);
      
      this.monitoredChannels.set(chatId, {
        channelId: channel._id,
        userId: channel.userId
      });

      // Listen for new messages
      this.bot.on('message', async (msg) => {
        if (msg.chat.id.toString() === chatId) {
          await this.processMessage(msg, channel.userId);
        }
      });

      console.log(`Started monitoring Telegram channel: ${channel.channelUrl}`);
    } catch (error) {
      console.error(`Failed to monitor channel ${channel.channelUrl}:`, error);
    }
  }

  async processMessage(msg, userId) {
    try {
      const messageText = this.extractMessageText(msg);
      if (!messageText) return;

      // Get user's keywords
      const keywords = await Keyword.find({ 
        userId, 
        isActive: true 
      });

      // Check for matches
      for (const keywordObj of keywords) {
        if (this.isKeywordMatch(messageText, keywordObj)) {
          // Check for duplicates
          const isDuplicate = await checkDuplicate(
            userId, 
            keywordObj._id, 
            messageText
          );
          
          if (!isDuplicate) {
            await this.forwardMatchedMessage(msg, userId, keywordObj);
          }
          break; // Stop after first match
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }

  extractMessageText(msg) {
    if (msg.text) return msg.text;
    if (msg.caption) return msg.caption;
    return null;
  }

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

  async forwardMatchedMessage(msg, userId, keywordObj) {
    try {
      const destinations = await Destination.find({ 
        userId, 
        isActive: true 
      });

      for (const destination of destinations) {
        await forwardMessage(msg, destination, keywordObj);
      }

      // Log the action
      await this.logAction(userId, keywordObj._id, msg, 'success');
    } catch (error) {
      await this.logAction(userId, keywordObj._id, msg, 'failed');
      console.error('Error forwarding message:', error);
    }
  }

  async logAction(userId, keywordId, msg, status) {
    const Log = require('../models/Log');
    
    await Log.create({
      userId,
      keywordId,
      channelId: this.getChannelId(msg.chat.id),
      message: this.extractMessageText(msg),
      matchedText: msg.text || msg.caption,
      forwardedTo: [], // Will be populated with destination IDs
      timestamp: new Date(),
      status
    });
  }

  getChannelId(chatId) {
    const channelInfo = this.monitoredChannels.get(chatId.toString());
    return channelInfo ? channelInfo.channelId : null;
  }

  async resolveChatId(channelUrl) {
    // Remove @ if present and get chat info
    const username = channelUrl.replace(' @REACT\portfolio-website\docs\_archive\Help me design a webcite that's is basically my po.md, '');
    try {
      const chat = await this.bot.getChat(` @zoroastervers\.gradle\8.7\dependencies-accessors\605263073e2870a56b82add8ddb33dae75d657ce\classes\org\gradle\accessors\dm\LibrariesForLibs$AndroidPluginAccessors.class{username}`);
      return chat.id.toString();
    } catch (error) {
      throw new Error(`Could not resolve chat ID for ${channelUrl}`);
    }
  }
}

module.exports = TelegramMonitor;
```

### **Step 2.2: Eitaa Integration**

```javascript
// bots/eitaaBot.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const Channel = require('../models/Channel');
const Keyword = require('../models/Keyword');

puppeteer.use(StealthPlugin());

class EitaaMonitor {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isLoggedIn = false;
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
    // Set user agent to mimic real browser
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  }

  async monitorChannel(channel) {
    try {
      if (!this.isLoggedIn) {
        await this.login(channel.credentials);
      }

      const channelUrl = `https://eitaa.com/${channel.channelUrl}`;
      await this.page.goto(channelUrl, { waitUntil: 'networkidle2' });

      // Monitor for new messages
      await this.startMessagePolling(channel);
    } catch (error) {
      console.error(`Error monitoring Eitaa channel ${channel.channelUrl}:`, error);
    }
  }

  async startMessagePolling(channel) {
    let lastMessageId = null;

    setInterval(async () => {
      try {
        const messages = await this.page.evaluate(() => {
          const messageElements = document.querySelectorAll('.message');
          return Array.from(messageElements).map(el => ({
            id: el.getAttribute('data-message-id'),
            text: el.querySelector('.message-text')?.innerText || '',
            timestamp: el.querySelector('.message-time')?.innerText || ''
          }));
        });

        const latestMessage = messages[0];
        if (latestMessage && latestMessage.id !== lastMessageId) {
          lastMessageId = latestMessage.id;
          await this.processNewMessage(latestMessage, channel);
        }
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    }, 5000); // Check every 5 seconds
  }

  async processNewMessage(message, channel) {
    const keywords = await Keyword.find({ 
      userId: channel.userId, 
      isActive: true 
    });

    for (const keywordObj of keywords) {
      if (this.isKeywordMatch(message.text, keywordObj)) {
        await this.forwardMessage(message, channel.userId, keywordObj);
        break;
      }
    }
  }

  async login(credentials) {
    await this.page.goto('https://eitaa.com/login', { waitUntil: 'networkidle2' });
    
    // Fill login form
    await this.page.type('input[name="phone"]', credentials.phone);
    await this.page.click('button[type="submit"]');
    
    // Wait for verification code input
    await this.page.waitForSelector('input[name="code"]', { timeout: 30000 });
    
    // In real implementation, you'd need to handle verification code
    // This is a simplified version
    console.log('Please complete login manually...');
    
    this.isLoggedIn = true;
  }

  isKeywordMatch(text, keywordObj) {
    // Similar implementation to Telegram bot
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

module.exports = EitaaMonitor;
```

### **Step 2.3: News Website Scrapers**

```javascript
// scraper/newsScraper.js
const axios = require('axios');
const cheerio = require('cheerio');
const Channel = require('../models/Channel');
const Keyword = require('../models/Keyword');

class NewsScraper {
  constructor() {
    this.scrapers = {
      'irna.ir': this.scrapeIRNA,
      'isna.ir': this.scrapeISNA,
      'mehrnews.com': this.scrapeMehr,
      // Add more scrapers as needed
    };
  }

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

  async processNewArticles(articles, channel) {
    // Get last checked timestamp to avoid duplicates
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

    // Update last checked timestamp
    await Channel.findByIdAndUpdate(channel._id, {
      lastChecked: newLastChecked
    });
  }

  async checkArticleForKeywords(article, channel) {
    const keywords = await Keyword.find({ 
      userId: channel.userId, 
      isActive: true 
    });

    const fullText = `${article.title} ${article.content}`;
    
    for (const keywordObj of keywords) {
      if (this.isKeywordMatch(fullText, keywordObj)) {
        await this.forwardArticle(article, channel.userId, keywordObj);
        break;
      }
    }
  }

  isKeywordMatch(text, keywordObj) {
    // Same implementation as previous
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
```

## 🤖 **Phase 3: AI Features & Advanced Functionality (Weeks 5-6)**

### **Step 3.1: AI-Powered Smart Filtering**

```javascript
// ai-services/smartFilter.js
const axios = require('axios');

class SmartFilter {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
  }

  async shouldForwardMessage(message, keyword, context) {
    // Rule-based filtering first
    if (this.isSpam(message)) return false;
    if (this.isIrrelevant(message, keyword)) return false;

    // AI-based filtering for ambiguous cases
    if (await this.isFalsePositive(message, keyword, context)) return false;

    return true;
  }

  isSpam(message) {
    const spamIndicators = [
      'www.', 'http://', 'https://', '.com', '.org',
      'کلیک کنید', 'عضویت', 'خرید', 'فروش'
    ];
    
    return spamIndicators.some(indicator => 
      message.toLowerCase().includes(indicator.toLowerCase())
    );
  }

  isIrrelevant(message, keyword) {
    // Check if keyword appears in irrelevant context
    const irrelevantPatterns = {
      'انقلاب': ['انقلاب اسلامی', 'انقلاب صنعتی'],
      'منیریه': ['خیابان منیریه', 'میدان منیریه']
    };

    const patterns = irrelevantPatterns[keyword];
    if (patterns) {
      return patterns.some(pattern => message.includes(pattern));
    }

    return false;
  }

  async isFalsePositive(message, keyword, context) {
    try {
      const prompt = `
        Analyze if this message is actually about "${keyword}" in the context of Iranian news.
        
        Message: "${message}"
        Context: ${context}
        
        Respond with only "YES" or "NO". Respond "YES" if the message is genuinely about ${keyword} in a news context.
        Respond "NO" if it's a false positive, irrelevant, or spam.
      `;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 10,
          temperature: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const answer = response.data.choices[0].message.content.trim();
      return answer === 'NO';
    } catch (error) {
      console.error('AI filtering error:', error);
      return false; // Default to forwarding if AI fails
    }
  }

  async extractKeyInformation(message) {
    try {
      const prompt = `
        Extract key information from this Persian news message in JSON format:
        
        Message: "${message}"
        
        Return JSON with: {
          "locations": string[],
          "entities": string[],
          "event_type": string,
          "urgency": "high" | "medium" | "low"
        }
      `;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 200,
          temperature: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return JSON.parse(response.data.choices[0].message.content.trim());
    } catch (error) {
      console.error('AI extraction error:', error);
      return null;
    }
  }
}

module.exports = SmartFilter;
```

### **Step 3.2: Advanced Duplicate Detection**

```javascript
// services/duplicateDetector.js
const natural = require('natural');
const { WordTokenizer, PorterStemmerFa } = require('natural');
const StopwordFa = require('stopword-fa');

class DuplicateDetector {
  constructor() {
    this.tokenizer = new WordTokenizer();
    this.tfidf = new natural.TfIdf();
    this.similarityThreshold = 0.8;
  }

  async isDuplicate(userId, newMessage, keywordId) {
    // Get recent messages for this keyword
    const Log = require('../models/Log');
    const recentLogs = await Log.find({
      userId,
      keywordId,
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    }).limit(50);

    // Preprocess message
    const processedNewMessage = this.preprocessText(newMessage);

    for (const log of recentLogs) {
      const similarity = this.calculateSimilarity(
        processedNewMessage,
        this.preprocessText(log.message)
      );

      if (similarity >= this.similarityThreshold) {
        return true;
      }
    }

    return false;
  }

  preprocessText(text) {
    if (!text) return '';

    // Tokenize and remove stop words
    let tokens = this.tokenizer.tokenize(text);
    tokens = StopwordFa.removeStopwords(tokens);
    
    // Stem words
    tokens = tokens.map(token => PorterStemmerFa.stem(token));
    
    return tokens.join(' ');
  }

  calculateSimilarity(text1, text2) {
    if (!text1 || !text2) return 0;

    // Use Jaro-Winkler distance for Persian text
    return natural.JaroWinklerDistance(text1, text2, {});
  }

  async updateSimilarityThreshold(userId, feedback) {
    // Adjust threshold based on user feedback
    if (feedback === 'too_many_duplicates') {
      this.similarityThreshold = Math.min(0.9, this.similarityThreshold + 0.05);
    } else if (feedback === 'missed_duplicates') {
      this.similarityThreshold = Math.max(0.6, this.similarityThreshold - 0.05);
    }

    // Save user preference to database
    const User = require('../models/User');
    await User.findByIdAndUpdate(userId, {
      'settings.similarityThreshold': this.similarityThreshold
    });
  }
}

module.exports = DuplicateDetector;
```

## 🚀 **Phase 4: Deployment & Scaling**

### **Step 4.1: Docker Configuration**

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm run install:all

# Copy source code
COPY . .

# Build frontend
RUN cd frontend && npm run build

# Expose ports
EXPOSE 3000 5000

# Start application
CMD ["npm", "run", "start:prod"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - API_URL=http://backend:5000

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/newsmonitor
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongodb
      - redis

  mongodb:
    image: mongo:5
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
      - backend

volumes:
  mongodb_data:
  redis_data:
```

### **Step 4.2: Environment Configuration**

```bash
# .env
# Database
MONGODB_URI=mongodb://localhost:27017/news_monitor
REDIS_URL=redis://localhost:6379

# Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Eitaa (if using unofficial API)
EITAA_PHONE=your_phone_number
EITAA_PASSWORD=your_password

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🔧 **Additional Critical Components**

### **Error Handling & Logging**

```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'news-monitor-bot' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Global error handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', error);
  process.exit(1);
});

module.exports = logger;
```

### **Rate Limiting & Performance**

```javascript
// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    store: new RedisStore({
      client: redisClient,
      prefix: 'rl:'
    }),
    windowMs,
    max,
    message: {
      error: 'Too many requests',
      message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

// Different limiters for different endpoints
const authLimiter = createRateLimiter(15 * 60 * 1000, 5, 'Too many login attempts');
const apiLimiter = createRateLimiter(15 * 60 * 1000, 100, 'Too many API requests');
const keywordLimiter = createRateLimiter(60 * 60 * 1000, 50, 'Too many keyword additions');

module.exports = {
  authLimiter,
  apiLimiter,
  keywordLimiter
};
```