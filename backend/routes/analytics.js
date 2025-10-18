const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const LoggingService = require('../services/LoggingService');
const ChannelService = require('../services/ChannelService');
const DestinationService = require('../services/DestinationService');
const KeywordService = require('../services/KeywordService');
const supabase = require('../database/supabase');

const loggingService = new LoggingService();
const channelService = new ChannelService();
const destinationService = new DestinationService();
const keywordService = new KeywordService();



// GET /api/analytics/stats - Get comprehensive analytics stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`[Analytics /stats] Fetching stats for user: ${userId}`);

    // Get counts in parallel
    const [ 
      totalMessages,
      todayMessages,
      channels,
      destinations,
      keywords,
      successStats
    ] = await Promise.all([
      loggingService.getLogsCountForUser(userId),
      loggingService.getForwardedMessagesToday(userId),
      channelService.getUserChannels(userId, false), // Get all channels
      destinationService.getUserDestinations(userId, false), // Get all destinations
      keywordService.getUserKeywords(userId, false), // Get all keywords
      getSuccessStats(userId)
    ]);

    console.log(`[Analytics /stats] Data fetched:`, {
      totalMessages,
      todayMessages,
      channels: Array.isArray(channels) ? `${channels.length} channels` : `channels is not an array: ${typeof channels}`,
      destinations: Array.isArray(destinations) ? `${destinations.length} destinations` : `destinations is not an array: ${typeof destinations}`,
      keywords: Array.isArray(keywords) ? `${keywords.length} keywords` : `keywords is not an array: ${typeof keywords}`,
      successStats
    });

    const activeChannels = channels.filter(c => c.is_active).length;
    const activeDestinations = destinations.filter(d => d.is_active).length;
    const activeKeywords = keywords.filter(k => k.is_active).length;

    const stats = {
      totalMessages: totalMessages || 0,
      todayMessages: todayMessages || 0,
      totalChannels: channels.length,
      activeChannels,
      totalDestinations: destinations.length,
      activeDestinations,
      totalKeywords: keywords.length,
      activeKeywords,
      successRate: successStats.successRate,
      averageProcessingTime: successStats.averageProcessingTime
    };

    res.json(stats);
  } catch (error) {
    console.error('Analytics stats error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics stats' });
  }
});

// GET /api/analytics/activity - Get weekly activity data
router.get('/activity', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const activity = await loggingService.getForwardingActivityLast7Days(userId);
    
    // Ensure we have data for all 7 days
    const last7Days = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last7Days[dateStr] = activity[dateStr] || 0;
    }

    res.json({ activity: last7Days });
  } catch (error) {
    console.error('Analytics activity error:', error);
    res.status(500).json({ error: 'Failed to fetch activity data' });
  }
});

// GET /api/analytics/performance - Get detailed performance metrics
router.get('/performance', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get performance metrics from the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { data: recentLogs, error } = await supabase
      .from('message_logs')
      .select('processing_time_ms, status')
      .eq('user_id', userId)
      .gte('created_at', oneDayAgo.toISOString());

    if (error) {
      throw new Error(error.message);
    }

    const totalLogs = recentLogs.length;
    const successfulLogs = recentLogs.filter(log => log.status === 'success').length;
    const failedLogs = recentLogs.filter(log => log.status === 'error').length;
    const pendingLogs = recentLogs.filter(log => log.status === 'pending').length;
    
    const processingTimes = recentLogs
      .filter(log => log.processing_time_ms && log.processing_time_ms > 0)
      .map(log => log.processing_time_ms);
    
    const averageProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length 
      : 0;
    
    const minProcessingTime = processingTimes.length > 0 ? Math.min(...processingTimes) : 0;
    const maxProcessingTime = processingTimes.length > 0 ? Math.max(...processingTimes) : 0;

    const performance = {
      totalLogs,
      successfulLogs,
      failedLogs,
      pendingLogs,
      successRate: totalLogs > 0 ? (successfulLogs / totalLogs) * 100 : 0,
      averageProcessingTime: Math.round(averageProcessingTime),
      minProcessingTime: Math.round(minProcessingTime),
      maxProcessingTime: Math.round(maxProcessingTime),
      throughputPerHour: Math.round(totalLogs / 24) // messages per hour
    };

    res.json(performance);
  } catch (error) {
    console.error('Analytics performance error:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
});

// GET /api/analytics/channels - Get channel-wise analytics
router.get('/channels', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data: channelStats, error } = await supabase
      .from('message_logs')
      .select(`
        channel_id,
        status,
        channels!inner(channel_name, is_active)
      `)
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }

    // Aggregate stats by channel
    const channelMap = new Map();
    
    channelStats.forEach(log => {
      const channelId = log.channel_id;
      const channelName = log.channels?.channel_name || 'Unknown';
      const isActive = log.channels?.is_active || false;
      
      if (!channelMap.has(channelId)) {
        channelMap.set(channelId, {
          channelId,
          channelName,
          isActive,
          totalMessages: 0,
          successfulMessages: 0,
          failedMessages: 0,
          successRate: 0
        });
      }
      
      const stats = channelMap.get(channelId);
      stats.totalMessages++;
      
      if (log.status === 'success') {
        stats.successfulMessages++;
      } else if (log.status === 'error') {
        stats.failedMessages++;
      }
    });

    // Calculate success rates
    const channelAnalytics = Array.from(channelMap.values()).map(stats => {
      stats.successRate = stats.totalMessages > 0 
        ? (stats.successfulMessages / stats.totalMessages) * 100 
        : 0;
      return stats;
    });

    // Sort by total messages descending
    channelAnalytics.sort((a, b) => b.totalMessages - a.totalMessages);

    res.json({ channels: channelAnalytics });
  } catch (error) {
    console.error('Analytics channels error:', error);
    res.status(500).json({ error: 'Failed to fetch channel analytics' });
  }
});

// Helper function to get success statistics
async function getSuccessStats(userId) {
  try {
    const { data: logs, error } = await supabase
      .from('message_logs')
      .select('status, processing_time_ms')
      .eq('user_id', userId)
      .limit(1000) // Last 1000 logs for calculation
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    if (logs.length === 0) {
      return { successRate: 0, averageProcessingTime: 0 };
    }

    const successfulLogs = logs.filter(log => log.status === 'success');
    const successRate = (successfulLogs.length / logs.length) * 100;
    
    const validProcessingTimes = logs
      .filter(log => log.processing_time_ms && log.processing_time_ms > 0)
      .map(log => log.processing_time_ms);
    
    const averageProcessingTime = validProcessingTimes.length > 0
      ? validProcessingTimes.reduce((a, b) => a + b, 0) / validProcessingTimes.length
      : 0;

    return {
      successRate: Math.round(successRate * 10) / 10, // Round to 1 decimal
      averageProcessingTime: Math.round(averageProcessingTime)
    };
  } catch (error) {
    console.error('Error calculating success stats:', error);
    return { successRate: 0, averageProcessingTime: 0 };
  }
}

module.exports = router;