const supabase = require('../database/supabase');
const UserService = require('./UserService');

class KeywordService {
    async addKeyword(userId, keywordData) {
        const canAdd = await UserService.canAddKeyword(userId);
        if (!canAdd) {
            throw new Error('Keyword limit reached. Please upgrade your plan.');
        }

        const { data, error } = await supabase
            .from('keywords')
            .insert([{ user_id: userId, ...keywordData }])
            .select();

        if (error) {
            throw new Error(error.message);
        }

        return data[0];
    }

    // New: resolve keywords by channel owner and normalize schema
    async getKeywordsByChannelId(channelId) {
        try {
            const { data: channel } = await supabase
                .from('channels')
                .select('user_id')
                .eq('id', channelId)
                .maybeSingle();
            if (!channel) return [];
            return await this.getUserKeywords(channel.user_id, true);
        } catch { return []; }
    }

    async getUserKeywords(userId, activeOnly = true) {
        let query = supabase
            .from('keywords')
            .select('id, user_id, keyword, is_active, case_sensitive, exact_match, match_mode, priority')
            .eq('user_id', userId);

        if (activeOnly) {
            query = query.eq('is_active', true);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        // Normalize types to be robust
        return (data || []).map(k => ({
            ...k,
            case_sensitive: k.case_sensitive === true || k.case_sensitive === 'true',
            exact_match: k.exact_match === true || k.exact_match === 'true',
            match_mode: (k.match_mode || 'contains').toLowerCase()
        }));
    }

    async toggleKeyword(userId, keywordId, isActive) {
        const { data, error } = await supabase
            .from('keywords')
            .update({ is_active: isActive })
            .eq('id', keywordId)
            .eq('user_id', userId)
            .select();

        if (error) {
            throw new Error(error.message);
        }

        return data[0];
    }

    async incrementMatchCount(keywordId) {
        const { data, error } = await supabase.rpc('increment_match_count', { keyword_id: keywordId });

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    async findMatchingKeywords(userId, text) {
        const keywords = await this.getUserKeywords(userId);
        const matches = [];

        for (const keyword of keywords) {
            if (this.doesTextMatchKeyword(text, keyword)) {
                matches.push(keyword);
            }
        }

        return matches;
    }

    doesTextMatchKeyword(text, keyword) {
        const mode = (keyword.match_mode || 'contains').toLowerCase();
        let searchText = text || '';
        let searchKeyword = keyword.keyword || '';

        if (!keyword.case_sensitive) {
            searchText = searchText.toLowerCase();
            searchKeyword = searchKeyword.toLowerCase();
        }

        if (mode === 'regex') {
            try { return new RegExp(searchKeyword, keyword.case_sensitive ? '' : 'i').test(text || ''); } catch { return false; }
        }

        if (mode === 'exact' || keyword.exact_match) {
            return searchText === searchKeyword;
        }

        // default contains
        return searchText.includes(searchKeyword);
    }

    async deleteKeyword(userId, keywordId) {
        const { data, error } = await supabase
            .from('keywords')
            .delete()
            .eq('id', keywordId)
            .eq('user_id', userId)
            .select();

        if (error) {
            throw new Error(error.message);
        }

        return data[0];
    }
}

module.exports = new KeywordService();