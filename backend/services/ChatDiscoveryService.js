const supabase = require('../database/supabase');

class ChatDiscoveryService {
  constructor(bot) {
    this.bot = bot;
  }

  /**
   * Save or update a discovered chat
   */
  async saveDiscoveredChat(chatData) {
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

      const { data, error } = await supabase
        .from('discovered_chats')
        .upsert({
          chat_id: chat_id.toString(),
          chat_type,
          title,
          username,
          invite_link,
          is_bot_admin,
          is_bot_member,
          member_count,
          description,
          last_seen_at: new Date().toISOString(),
          admin_checked_at: is_bot_admin !== undefined ? new Date().toISOString() : null
        }, {
          onConflict: 'chat_id',
          ignoreDuplicates: false
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
      
      // Update the database
      await supabase
        .from('discovered_chats')
        .update({
          is_bot_admin: isAdmin,
          is_bot_member: isMember,
          admin_checked_at: new Date().toISOString(),
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
   */
  async processUpdate(update) {
    try {
      const chat = update.chat;
      if (!chat) return;

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
        const adminStatus = await this.checkAdminStatus(chat.id);
        chatData.is_bot_admin = adminStatus.isAdmin;
        chatData.is_bot_member = adminStatus.isMember;
      }

      // Save the discovered chat
      await this.saveDiscoveredChat(chatData);
    } catch (err) {
      console.error('Error processing update for chat discovery:', err.message);
    }
  }

  /**
   * Get all discovered chats
   */
  async getDiscoveredChats(filters = {}) {
    try {
      let query = supabase
        .from('discovered_chats')
        .select('*')
        .order('last_seen_at', { ascending: false });

      if (filters.adminOnly) {
        query = query.eq('is_bot_admin', true);
      }
      if (filters.memberOnly) {
        query = query.eq('is_bot_member', true);
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
  async refreshAllAdminStatuses() {
    try {
      const chats = await this.getDiscoveredChats({ memberOnly: true });
      const results = [];

      for (const chat of chats) {
        // Skip private chats
        if (chat.chat_type === 'private') continue;
        
        const status = await this.checkAdminStatus(chat.chat_id);
        results.push({
          chat_id: chat.chat_id,
          title: chat.title,
          ...status
        });
        
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
        .single();

      if (error || !discoveredChat) {
        throw new Error('Discovered chat not found');
      }

      // Create channel record
      const channelData = {
        user_id: userId,
        platform: 'telegram',
        channel_url: discoveredChat.username 
          ? `https://t.me/${discoveredChat.username}` 
          : discoveredChat.invite_link 
          ? discoveredChat.invite_link
          : chatId,
        channel_name: channelName || discoveredChat.title || `Chat ${chatId}`,
        is_active: discoveredChat.is_bot_admin // Only activate if bot is admin
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