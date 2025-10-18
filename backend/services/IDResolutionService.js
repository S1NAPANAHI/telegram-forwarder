const TelegramBot = require('node-telegram-bot-api');
const logger = require('../utils/logger');

class IDResolutionService {
    constructor() {
        this.botToken = process.env.TELEGRAM_BOT_TOKEN;
        this.bot = new TelegramBot(this.botToken, { polling: false });
    }

    /**
     * Resolves any chat identifier to numeric ID
     * Handles: @username, t.me/username, https://t.me/username, numeric IDs
     */
    async resolveToNumericId(input) {
        if (!input) return null;
        
        const normalized = this.normalizeInput(input);
        
        // If already numeric, return as string
        if (this.isNumericId(normalized)) {
            return normalized;
        }
        
        // Resolve username to numeric ID
        return await this.resolveUsernameToId(normalized);
    }

    normalizeInput(input) {
        const str = input.toString().trim();
        
        // Handle t.me links
        if (str.includes('t.me/')) {
            const match = str.match(/t\.me\/([A-Za-z0-9_]+)/);
            if (match) return `@${match[1]}`;
        }
        
        // Handle @username
        if (str.startsWith('@')) {
            return str;
        }
        
        // Handle plain username
        if (/^[A-Za-z0-9_]{5,32}$/.test(str)) {
            return `@${str}`;
        }
        
        // Return as-is (might be numeric ID)
        return str;
    }

    isNumericId(str) {
        return /^-?\d+$/.test(str);
    }

    async resolveUsernameToId(username) {
        try {
            // Remove @ if present
            const cleanUsername = username.replace('@', '');
            
            // Use getChat to resolve username to chat info
            const chat = await this.bot.getChat(`@${cleanUsername}`);
            
            return chat.id.toString();
        } catch (error) {
            logger.error(`Failed to resolve username ${username}:`, error.message);
            throw new Error(`Could not resolve "${username}" to a valid chat ID. Make sure the username is correct and the chat is accessible.`);
        }
    }

    /**
     * Get detailed chat information
     */
    async getChatInfo(chatIdOrUsername) {
        try {
            const resolvedId = await this.resolveToNumericId(chatIdOrUsername);
            const chat = await this.bot.getChat(resolvedId);
            
            return {
                id: chat.id.toString(),
                type: chat.type,
                title: chat.title || chat.first_name || 'Private Chat',
                username: chat.username || null,
                description: chat.description || null
            };
        } catch (error) {
            logger.error('Failed to get chat info:', error.message);
            throw error;
        }
    }

    /**
     * Validate if destination is accessible for forwarding
     */
    async validateDestination(chatIdOrUsername) {
        try {
            const chatInfo = await this.getChatInfo(chatIdOrUsername);
            
            // Try to get bot's status in the chat
            const me = await this.bot.getMe();
            try {
                const member = await this.bot.getChatMember(chatInfo.id, me.id);
                const canSend = ['administrator', 'creator', 'member'].includes(member.status);
                
                return {
                    valid: true,
                    chatInfo,
                    canSend,
                    botStatus: member.status
                };
            } catch (memberError) {
                // Bot is not a member or no permissions
                return {
                    valid: true,
                    chatInfo,
                    canSend: false,
                    botStatus: 'not_member',
                    warning: 'Bot may not be able to send messages to this chat'
                };
            }
        } catch (error) {
            return {
                valid: false,
                error: error.message
            };
        }
    }
}

module.exports = IDResolutionService;