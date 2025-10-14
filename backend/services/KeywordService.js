const User = require('../models/User');
const Keyword = require('../models/Keyword');
const UserService = require('./UserService');

class KeywordService {
    async addKeyword(userId, keywordData) {
        const canAdd = await UserService.canAddKeyword(userId);
        if (!canAdd) {
            throw new Error('Keyword limit reached. Please upgrade your plan.');
        }

        const keyword = new Keyword({
            userId,
            ...keywordData
        });

        return await keyword.save();
    }

    async getUserKeywords(userId, activeOnly = true) {
        const query = { userId };
        if (activeOnly) {
            query.isActive = true;
        }
        
        return await Keyword.find(query).sort({ createdAt: -1 });
    }

    async toggleKeyword(userId, keywordId, isActive) {
        return await Keyword.findOneAndUpdate(
            { _id: keywordId, userId },
            { isActive },
            { new: true }
        );
    }

    async incrementMatchCount(keywordId) {
        return await Keyword.findByIdAndUpdate(
            keywordId,
            { $inc: { matchCount: 1 } },
            { new: true }
        );
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

    async doesTextMatchKeyword(text, keyword) {
        let searchText = text;
        let searchKeyword = keyword.keyword;

        if (!keyword.caseSensitive) {
            searchText = searchText.toLowerCase();
            searchKeyword = searchKeyword.toLowerCase();
        }

        if (keyword.exactMatch) {
            return searchText === searchKeyword;
        } else {
            return searchText.includes(searchKeyword);
        }
    }

    async deleteKeyword(userId, keywordId) {
        const keyword = await Keyword.findOneAndDelete({
            _id: keywordId,
            userId: userId
        });
        return keyword;
    }
}

module.exports = new KeywordService();