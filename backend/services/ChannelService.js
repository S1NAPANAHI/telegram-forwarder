const supabase = require('../database/supabase');
const UserService = require('./UserService');

class ChannelService {
    async addChannel(userId, channelData) {
        const canAdd = await UserService.canAddChannel(userId);
        if (!canAdd) {
            throw new Error('Channel limit reached. Please upgrade your plan.');
        }

        const { data, error } = await supabase
            .from('channels')
            .insert([{ user_id: userId, ...channelData }])
            .select();

        if (error) {
            throw new Error(error.message);
        }

        return data[0];
    }

    async getUserChannels(userId, activeOnly = true) {
        let query = supabase.from('channels').select('*').eq('user_id', userId);

        if (activeOnly) {
            query = query.eq('is_active', true);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    async getActiveChannelsByPlatform(platform) {
        const { data, error } = await supabase
            .from('channels')
            .select(`
                *,
                user:users ( telegram_id, subscription_plan, keywords_limit, channels_limit )
            `)
            .eq('platform', platform)
            .eq('is_active', true);

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    async updateLastChecked(channelId) {
        const { data, error } = await supabase
            .from('channels')
            .update({ last_checked: new Date() })
            .eq('id', channelId)
            .select();

        if (error) {
            throw new Error(error.message);
        }

        return data[0];
    }

    async toggleChannel(userId, channelId, isActive) {
        const { data, error } = await supabase
            .from('channels')
            .update({ is_active: isActive })
            .eq('id', channelId)
            .eq('user_id', userId)
            .select();

        if (error) {
            throw new Error(error.message);
        }

        return data[0];
    }

    async deleteChannel(userId, channelId) {
        const { data, error } = await supabase
            .from('channels')
            .delete()
            .eq('id', channelId)
            .eq('user_id', userId)
            .select();

        if (error) {
            throw new Error(error.message);
        }

        return data[0];
    }

    async getChannelById(userId, channelId) {
        const { data, error } = await supabase
            .from('channels')
            .select('*')
            .eq('id', channelId)
            .eq('user_id', userId)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }
}

module.exports = new ChannelService();