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

    async getUserKeywords(userId, activeOnly = true) {
        let query = supabase.from('keywords').select('*').eq('user_id', userId);

        if (activeOnly) {
            query = query.eq('is_active', true);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return data;
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
        let searchText = text;
        let searchKeyword = keyword.keyword;

        if (!keyword.case_sensitive) {
            searchText = searchText.toLowerCase();
            searchKeyword = searchKeyword.toLowerCase();
        }

        if (keyword.exact_match) {
            return searchText === searchKeyword;
        } else {
            return searchText.includes(searchKeyword);
        }
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