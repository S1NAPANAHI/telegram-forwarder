const supabase = require('../database/supabase');

// Get system user ID for fallback operations
async function getSystemUserId() {
  try {
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_id', 'system_bot')
      .single();
    return data?.id || null;
  } catch {
    // Fallback to finding any user
    try {
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      return users?.[0]?.id || null;
    } catch {
      return null;
    }
  }
}

class ChatDiscoveryService {
  constructor(bot) {
    this.bot = bot;
    this.systemUserId = null;
    this.initSystemUser();
  }

  async initSystemUser() {
    this.systemUserId = await getSystemUserId();
  }

  /**
   * Save or update a discovered chat with proper user_id handling
   */
  async saveDiscoveredChat(chatData, userId = null) {
    try {
      const {
        chat_id,
        chat_type,
        title = null,
        username = null,
        invite_link = null,
        is_bot_admin = false,
        is_bot_member = true,
        member_count = null,
        description = null
      } = chatData;

      // Use provided userId or fallback to system user
      const targetUserId = userId || this.systemUserId || await getSystemUserId();
      
      if (!targetUserId) {
        console.warn('No user ID available for saving discovered chat:', chat_id);
        return null;
      }

      const { data, error } = await supabase
        .from('discovered_chats')
        .upsert({
          user_id: targetUserId,
          chat_id: chat_id.toString(),
          chat_type,
          chat_title: title,
          chat_username: username,
          is_admin: is_bot_admin,
          is_member: is_bot_member,
          discovery_method: 'bot_api',
          last_discovered: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,chat_id'
        })
        .select('*')
        .single();

      if (error) {
        console.warn('Error saving discovered chat:', error.message);
        return null;
      }

      console.log(`Discovered chat saved: ${title || chat_id} (${chat_type})`);
      return data;
    } catch (err) {
      console.error('ChatDiscoveryService saveDiscoveredChat error:', err.message);
      return null;
    }
  }

  /**
   * Check if bot is admin in a specific chat
   */
  async checkAdminStatus(chatId) {
    try {
      const me = await this.bot.getMe();
      const member = await this.bot.getChatMember(chatId, me.id);
      const isAdmin = ['administrator', 'creator'].includes(member.status);
      const isMember = !['left', 'kicked'].includes(member.status);
      
      console.log(`Admin check for ${chatId}: ${member.status} (admin: ${isAdmin})`);
      
      // Update the database - find the relevant entry to update
      await supabase
        .from('discovered_chats')
        .update({
          is_admin: isAdmin,
          is_member: isMember,
          last_discovered: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('chat_id', chatId.toString());

      return { isAdmin, isMember, status: member.status };
    } catch (err) {
      console.warn(`Failed to check admin status for ${chatId}:`, err.message);
      return { isAdmin: false, isMember: false, status: 'unknown' };
    }
  }

  /**
   * Process a message or channel_post and save chat info
   * FIXED: Safely handle messages without 'from' property
   */
  async processUpdate(update, userId = null) {
    try {
      const chat = update.chat;
      if (!chat) return;

      // FIXED: Safely get user ID from the update if available
      let updateUserId = userId;
      if (!updateUserId && update.from && update.from.id) {
        try {
          const UserService = require('./UserService');
          const user = await UserService.getByTelegramId(update.from.id);
          updateUserId = user?.id;
        } catch (e) {
          console.warn('Could not resolve user from update:', e.message);
        }
      }

      // Extract chat information
      const chatData = {
        chat_id: chat.id.toString(),
        chat_type: chat.type,
        title: chat.title || null,
        username: chat.username || null,
        member_count: chat.members_count || null,
        description: chat.description || null
      };

      // Check admin status for groups/channels (not private chats)
      if (['group', 'supergroup', 'channel'].includes(chat.type)) {
        try {
          const adminStatus = await this.checkAdminStatus(chat.id);
          chatData.is_bot_admin = adminStatus.isAdmin;
          chatData.is_bot_member = adminStatus.isMember;
        } catch (e) {
          console.warn('Error checking admin status:', e.message);
          chatData.is_bot_admin = false;
          chatData.is_bot_member = false;
        }
      }

      // Save the discovered chat with proper user ID
      await this.saveDiscoveredChat(chatData, updateUserId);
    } catch (err) {
      console.error('Error processing update for chat discovery:', err.message);
    }
  }

  /**
   * Get all discovered chats for a specific user
   */
  async getDiscoveredChats(userId, filters = {}) {
    try {
      let query = supabase
        .from('discovered_chats')
        .select('*')
        .order('last_discovered', { ascending: false });

      // Filter by user ID if provided
      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (filters.adminOnly) {
        query = query.eq('is_admin', true);
      }
      if (filters.memberOnly) {
        query = query.eq('is_member', true);
      }
      if (filters.type) {
        query = query.eq('chat_type', filters.type);
      }

      const { data, error } = await query;
      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (err) {
      console.error('Error fetching discovered chats:', err.message);
      return [];
    }
  }

  /**
   * Bulk check admin status for all discovered chats
   */
  async refreshAllAdminStatuses(userId = null) {
    try {
      const chats = await this.getDiscoveredChats(userId, { memberOnly: true });
      const results = [];

      for (const chat of chats) {
        // Skip private chats
        if (chat.chat_type === 'private') continue;
        
        try {
          const status = await this.checkAdminStatus(chat.chat_id);
          results.push({
            chat_id: chat.chat_id,
            title: chat.chat_title,
            ...status
          });
        } catch (e) {
          console.warn(`Error checking admin status for ${chat.chat_id}:`, e.message);
        }
        
        // Add delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log(`Admin status refresh complete for ${results.length} chats`);
      return results;
    } catch (err) {
      console.error('Error refreshing admin statuses:', err.message);
      return [];
    }
  }

  /**
   * Convert discovered chat to monitored channel
   */
  async promoteToMonitoredChannel(userId, chatId, channelName = null) {
    try {
      // Get discovered chat info
      const { data: discoveredChat, error } = await supabase
        .from('discovered_chats')
        .select('*')
        .eq('chat_id', chatId)
        .eq('user_id', userId)
        .single();

      if (error || !discoveredChat) {
        throw new Error('Discovered chat not found for this user');
      }

      // Create channel record
      const channelData = {
        user_id: userId,
        platform: 'telegram',
        channel_url: discoveredChat.chat_username 
          ? `https://t.me/${discoveredChat.chat_username}` 
          : discoveredChat.chat_id,
        channel_name: channelName || discoveredChat.chat_title || `Chat ${chatId}`,
        is_active: discoveredChat.is_admin, // Only activate if bot is admin
        admin_status: discoveredChat.is_admin,
        monitoring_method: discoveredChat.is_admin ? 'bot_api' : 'client_api'
      };

      // Check if already exists
      const { data: existing } = await supabase
        .from('channels')
        .select('id')
        .eq('user_id', userId)
        .eq('channel_url', channelData.channel_url)
        .maybeSingle();

      if (existing) {
        throw new Error('Channel already exists in monitored list');
      }

      const { data: newChannel, error: insertError } = await supabase
        .from('channels')
        .insert([channelData])
        .select('*')
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      console.log(`Promoted discovered chat to monitored channel: ${channelData.channel_name}`);
      return newChannel;
    } catch (err) {
      console.error('Error promoting discovered chat:', err.message);
      throw err;
    }
  }
}

module.exports = ChatDiscoveryService;