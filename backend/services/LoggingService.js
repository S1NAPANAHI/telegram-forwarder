const supabase = require('../database/supabase');

class LoggingService {
    async logMessage(logData) {
        const { data, error } = await supabase
            .from('message_logs')
            .insert([{
                user_id: logData.userId,
                keyword_id: logData.keywordId,
                channel_id: logData.channelId,
                original_message_id: logData.originalMessageId,
                original_message_text: logData.originalMessageText,
                matched_text: logData.matchedText,
                status: logData.status,
                processing_time_ms: logData.processingTime
            }])
            .select();

        if (error) {
            throw new Error(error.message);
        }

        return data[0];
    }

    async getLogsForUser(userId, limit = 10, offset = 0) {
        const { data, error } = await supabase
            .from('message_logs')
            .select(`
                *,
                keyword:keywords(keyword),
                channel:channels(channel_name)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    async getLogsCountForUser(userId) {
        const { count, error } = await supabase
            .from('message_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (error) {
            throw new Error(error.message);
        }

        return count;
    }

    async getForwardedMessagesToday(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { count, error } = await supabase
            .from('message_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('created_at', today.toISOString());

        if (error) {
            throw new Error(error.message);
        }

        return count;
    }

    async getForwardingActivityLast7Days(userId) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
            .from('message_logs')
            .select('created_at')
            .eq('user_id', userId)
            .gte('created_at', sevenDaysAgo.toISOString())
            .order('created_at', { ascending: true });

        if (error) {
            throw new Error(error.message);
        }

        // Aggregate data by day
        const activityByDay = {};
        data.forEach(log => {
            const date = new Date(log.created_at).toISOString().split('T')[0];
            activityByDay[date] = (activityByDay[date] || 0) + 1;
        });

        return activityByDay;
    }
}

module.exports = new LoggingService();