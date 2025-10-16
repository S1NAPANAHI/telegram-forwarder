// TelegramDiscoveryService.js - Enhanced Discovery System (Phase 1.1)
// Comprehensive chat discovery with admin status detection

const TelegramBot = require('node-telegram-bot-api');
const { TelegramApi } = require('telegram');
const logger = require('../utils/logger');

class TelegramDiscoveryService {
    constructor() {
        this.botToken = process.env.TELEGRAM_BOT_TOKEN;
        this.bot = new TelegramBot(this.botToken, { polling: false });
    }

    /**
     * Main discovery method - combines Bot API and Client API results
     * @param {string} userId - User ID from database
     * @returns {Promise<Array>} Discovered chats with admin status
     */
    async discoverAllChats(userId) {
        try {
            logger.info(`Starting chat discovery for user ${userId}`);
            
            const botChats = await this.getBotChats();
            const clientChats = await this.getClientChats(userId);
            
            const mergedChats = this.mergeChatLists(botChats, clientChats);
            await this.saveDiscoveredChats(userId, mergedChats);
            
            logger.info(`Discovered ${mergedChats.length} chats for user ${userId}`);
            return mergedChats;
        } catch (error) {
            logger.error('Error in discoverAllChats:', error);
            throw error;
        }
    }

    /**
     * Discover chats using Bot API - detects admin status
     * @returns {Promise<Array>} Chats where bot is member with admin status
     */
    async getBotChats() {
        try {
            const chats = [];
            
            // Get updates to find all chats the bot is in
            const updates = await this.bot.getUpdates({ limit: 100 });
            const chatIds = new Set();
            
            // Extract unique chat IDs from updates
            updates.forEach(update => {
                if (update.message) {
                    chatIds.add(update.message.chat.id);
                } else if (update.channel_post) {
                    chatIds.add(update.channel_post.chat.id);
                }
            });

            // Check admin status for each chat
            for (const chatId of chatIds) {
                try {
                    const chat = await this.bot.getChat(chatId);
                    const botMember = await this.bot.getChatMember(chatId, this.bot.options.polling ? this.bot.me.id : await this.getBotId());
                    
                    const isAdmin = ['administrator', 'creator'].includes(botMember.status);
                    
                    chats.push({
                        chat_id: chatId.toString(),
                        chat_type: chat.type,
                        chat_title: chat.title || chat.first_name || 'Private Chat',
                        chat_username: chat.username || null,
                        is_admin: isAdmin,
                        member_count: await this.getChatMemberCount(chatId),
                        discovery_method: 'bot_api'
                    });
                } catch (chatError) {
                    logger.warn(`Could not get info for chat ${chatId}:`, chatError.message);
                }
            }
            
            return chats;
        } catch (error) {
            logger.error('Error in getBotChats:', error);
            return [];
        }
    }

    /**
     * Discover chats using Client API (gramJS) - for non-admin chats
     * @param {string} userId - User ID to get client credentials
     * @returns {Promise<Array>} Chats accessible via user account
     */
    async getClientChats(userId) {
        try {
            // Check if client credentials are available
            const hasClientCreds = process.env.TG_API_ID && process.env.TG_API_HASH;
            if (!hasClientCreds) {
                logger.info('Client API credentials not available, skipping client discovery');
                return [];
            }

            // This is a placeholder for gramJS implementation
            // Will be implemented when client API is fully set up
            logger.info('Client API discovery not yet implemented');
            return [];
            
            /* Future implementation with gramJS:
            const client = new TelegramApi(stringSession, {
                apiId: parseInt(process.env.TG_API_ID),
                apiHash: process.env.TG_API_HASH,
            });
            
            const dialogs = await client.getDialogs();
            const chats = [];
            
            dialogs.forEach(dialog => {
                if (dialog.isChannel || dialog.isGroup) {
                    chats.push({
                        chat_id: dialog.id.toString(),
                        chat_type: dialog.isChannel ? 'channel' : 'group',
                        chat_title: dialog.title,
                        chat_username: dialog.username,
                        is_admin: false, // Default for client API
                        member_count: dialog.participantsCount,
                        discovery_method: 'client_api'
                    });
                }
            });
            
            return chats;
            */
        } catch (error) {
            logger.error('Error in getClientChats:', error);
            return [];
        }
    }

    /**
     * Merge chat lists from different sources, removing duplicates
     * @param {Array} botChats - Chats from Bot API
     * @param {Array} clientChats - Chats from Client API
     * @returns {Array} Merged and deduplicated chat list
     */
    mergeChatLists(botChats, clientChats) {
        const chatMap = new Map();
        
        // Add bot chats (priority for admin status)
        botChats.forEach(chat => {
            chatMap.set(chat.chat_id, chat);
        });
        
        // Add client chats (only if not already in bot chats)
        clientChats.forEach(chat => {
            if (!chatMap.has(chat.chat_id)) {
                chatMap.set(chat.chat_id, chat);
            }
        });
        
        return Array.from(chatMap.values());
    }

    /**
     * Save discovered chats to database
     * @param {string} userId - User ID
     * @param {Array} chats - Discovered chats
     */
    async saveDiscoveredChats(userId, chats) {
        try {
            const supabase = require('../database/supabase');
            
            for (const chat of chats) {
                const { error } = await supabase
                    .from('discovered_chats')
                    .upsert({
                        user_id: userId,
                        chat_id: chat.chat_id,
                        chat_type: chat.chat_type,
                        chat_title: chat.chat_title,
                        chat_username: chat.chat_username,
                        is_admin: chat.is_admin,
                        member_count: chat.member_count,
                        discovery_method: chat.discovery_method,
                        last_discovered: new Date().toISOString()
                    }, {
                        onConflict: 'user_id,chat_id'
                    });
                
                if (error) {
                    logger.error('Error saving discovered chat:', error);
                }
            }
        } catch (error) {
            logger.error('Error in saveDiscoveredChats:', error);
            throw error;
        }
    }

    /**
     * Get discovered chats from database with filtering
     * @param {string} userId - User ID
     * @param {Object} filters - Filter options
     * @returns {Promise<Array>} Filtered discovered chats
     */
    async getDiscoveredChats(userId, filters = {}) {
        try {
            const supabase = require('../database/supabase');
            
            let query = supabase
                .from('discovered_chats')
                .select('*')
                .eq('user_id', userId)
                .order('last_discovered', { ascending: false });
            
            if (filters.adminOnly) {
                query = query.eq('is_admin', true);
            }
            
            if (filters.chatType) {
                query = query.eq('chat_type', filters.chatType);
            }
            
            if (filters.notPromoted) {
                query = query.eq('is_promoted', false);
            }
            
            const { data, error } = await query;
            
            if (error) {
                logger.error('Error getting discovered chats:', error);
                throw error;
            }
            
            return data || [];
        } catch (error) {
            logger.error('Error in getDiscoveredChats:', error);
            throw error;
        }
    }

    /**
     * Mark chat as promoted to channels
     * @param {string} userId - User ID
     * @param {string} chatId - Chat ID
     */
    async markChatAsPromoted(userId, chatId) {
        try {
            const supabase = require('../database/supabase');
            
            const { error } = await supabase
                .from('discovered_chats')
                .update({ is_promoted: true })
                .eq('user_id', userId)
                .eq('chat_id', chatId);
            
            if (error) {
                logger.error('Error marking chat as promoted:', error);
                throw error;
            }
        } catch (error) {
            logger.error('Error in markChatAsPromoted:', error);
            throw error;
        }
    }

    /**
     * Helper methods
     */
    async getBotId() {
        try {
            const me = await this.bot.getMe();
            return me.id;
        } catch (error) {
            logger.error('Error getting bot ID:', error);
            return null;
        }
    }

    async getChatMemberCount(chatId) {
        try {
            const count = await this.bot.getChatMembersCount(chatId);
            return count;
        } catch (error) {
            return null;
        }
    }

    /**
     * Format discovery response for telegram command
     * @param {Array} chats - Discovered chats
     * @returns {string} Formatted response
     */
    formatDiscoveryResponse(chats) {
        if (chats.length === 0) {
            return '🔍 <b>Chat Discovery Complete</b>\n\nNo chats found. Make sure the bot is added to groups/channels you want to monitor.';
        }

        const adminChats = chats.filter(c => c.is_admin);
        const memberChats = chats.filter(c => !c.is_admin);
        
        let response = `🔍 <b>Chat Discovery Complete</b>\n\n`;
        response += `📊 <b>Summary:</b>\n`;
        response += `• Total chats: ${chats.length}\n`;
        response += `• Admin chats: ${adminChats.length}\n`;
        response += `• Member chats: ${memberChats.length}\n\n`;
        
        if (adminChats.length > 0) {
            response += `👑 <b>Admin Chats (can use Bot API):</b>\n`;
            adminChats.slice(0, 5).forEach(chat => {
                response += `• ${chat.chat_title} (${chat.chat_type})\n`;
            });
            if (adminChats.length > 5) {
                response += `... and ${adminChats.length - 5} more\n`;
            }
            response += '\n';
        }
        
        if (memberChats.length > 0) {
            response += `👤 <b>Member Chats (require Client API):</b>\n`;
            memberChats.slice(0, 5).forEach(chat => {
                response += `• ${chat.chat_title} (${chat.chat_type})\n`;
            });
            if (memberChats.length > 5) {
                response += `... and ${memberChats.length - 5} more\n`;
            }
        }
        
        response += '\n💡 Visit your web dashboard to configure monitoring for these chats.';
        
        return response;
    }
}

module.exports = TelegramDiscoveryService;