// TelegramDiscoveryService.js - Enhanced Discovery System (Phase 1.1)
// Comprehensive chat discovery with admin status detection (webhook-compatible)

const TelegramBot = require('node-telegram-bot-api');
const logger = require('../utils/logger');

class TelegramDiscoveryService {
    constructor() {
        this.botToken = process.env.TELEGRAM_BOT_TOKEN;
        this.bot = new TelegramBot(this.botToken, { polling: false });
    }

    normalizeChatId(urlOrId) {
        if (!urlOrId) return null;
        const v = urlOrId.toString();
        if (v.startsWith('@')) return v;
        if (v.includes('t.me/')) {
            const m = v.match(/t\.me\/([^\s/]+)/);
            if (m) return `@${m[1]}`;
        }
        return v; // numeric id or raw username
    }

    async probeKnownChannels(userId) {
        const supabase = require('../database/supabase');
        try {
            const { data: channels, error } = await supabase
                .from('channels')
                .select('*')
                .eq('user_id', userId)
                .eq('platform', 'telegram');
            if (error) {
                logger.error('probeKnownChannels: channels query error', error);
                return [];
            }
            if (!channels || channels.length === 0) return [];

            const me = await this.bot.getMe();
            const botId = me.id;
            const upserts = [];

            for (const ch of channels) {
                const chatId = this.normalizeChatId(ch.channel_url);
                try {
                    const chat = await this.bot.getChat(chatId);
                    let isAdmin = false;
                    try {
                        const member = await this.bot.getChatMember(chatId, botId);
                        isAdmin = ['administrator', 'creator'].includes(member.status);
                    } catch (e) {
                        // getChatMember can fail for channels where bot is not a member
                        isAdmin = false;
                    }
                    upserts.push({
                        user_id: userId,
                        chat_id: chatId.toString(),
                        chat_type: chat.type,
                        chat_title: chat.title || chat.first_name || 'Chat',
                        chat_username: chat.username || null,
                        is_admin: isAdmin,
                        discovery_method: 'bot_api',
                        last_discovered: new Date().toISOString(),
                    });
                } catch (e) {
                    logger.warn(`probeKnownChannels: getChat failed for ${chatId}: ${e.message}`);
                }
            }

            if (upserts.length > 0) {
                const { error: upErr } = await supabase
                    .from('discovered_chats')
                    .upsert(upserts, { onConflict: 'user_id,chat_id' });
                if (upErr) logger.error('probeKnownChannels: upsert error', upErr);
            }
            return upserts;
        } catch (e) {
            logger.error('probeKnownChannels error', e);
            return [];
        }
    }

    async discoverAllChats(userId) {
        try {
            // First, probe known channels (webhook-friendly)
            await this.probeKnownChannels(userId);
            // Then, return what we have in discovered_chats
            return await this.getDiscoveredChats(userId);
        } catch (error) {
            logger.error('discoverAllChats error', error);
            throw error;
        }
    }

    async getDiscoveredChats(userId, filters = {}) {
        const supabase = require('../database/supabase');
        let query = supabase
            .from('discovered_chats')
            .select('*')
            .eq('user_id', userId)
            .order('last_discovered', { ascending: false });
        if (filters.adminOnly) query = query.eq('is_admin', true);
        if (filters.chatType) query = query.eq('chat_type', filters.chatType);
        if (filters.notPromoted) query = query.eq('is_promoted', false);
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    }

    async markChatAsPromoted(userId, chatId) {
        const supabase = require('../database/supabase');
        const { error } = await supabase
            .from('discovered_chats')
            .update({ is_promoted: true })
            .eq('user_id', userId)
            .eq('chat_id', chatId);
        if (error) throw error;
    }

    formatDiscoveryResponse(chats) {
        if (!chats || chats.length === 0) {
            return '🔍 <b>Chat Discovery Complete</b>\n\nNo chats found. If you recently added channels in the panel, try again in a moment. Ensure the bot is a member and privacy mode is disabled.';
        }
        const adminChats = chats.filter(c => c.is_admin);
        const memberChats = chats.filter(c => !c.is_admin);
        let response = `🔍 <b>Chat Discovery Complete</b>\n\n`;
        response += `📊 <b>Summary:</b>\n`;
        response += `• Total chats: ${chats.length}\n`;
        response += `• Admin chats: ${adminChats.length}\n`;
        response += `• Member chats: ${memberChats.length}\n\n`;
        if (adminChats.length > 0) {
            response += `👑 <b>Admin Chats (Bot API):</b>\n`;
            adminChats.slice(0, 5).forEach(c => { response += `• ${c.chat_title} (${c.chat_type})\n`; });
            if (adminChats.length > 5) response += `... and ${adminChats.length - 5} more\n`;
            response += '\n';
        }
        if (memberChats.length > 0) {
            response += `👤 <b>Member Chats (Client API):</b>\n`;
            memberChats.slice(0, 5).forEach(c => { response += `• ${c.chat_title} (${c.chat_type})\n`; });
            if (memberChats.length > 5) response += `... and ${memberChats.length - 5} more\n`;
        }
        response += '\n💡 Manage these in your web dashboard.';
        return response;
    }
}

module.exports = TelegramDiscoveryService;
