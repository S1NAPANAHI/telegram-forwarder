const supabase = require('../database/supabase');
const monitoringManager = require('./monitoringManager');

class AutoPromoteService {
  static TELEGRAM_ONLY = true; // scope to telegram for now

  /**
   * Decide best channel_url from discovered chat data
   */
  static buildChannelUrl(discovered) {
    if (discovered.username) return `https://t.me/${discovered.username}`;
    // If chat_id looks like numeric id, keep it
    if (/^-?\d+$/.test(discovered.chat_id)) return discovered.chat_id;
    // Fallback to invite_link if available
    if (discovered.invite_link) return discovered.invite_link;
    // Last resort: raw chat_id
    return discovered.chat_id;
  }

  /**
   * Auto-promote a single discovered chat to channels table for a user
   * Returns the created or existing channel row, or null on failure
   */
  static async promoteOne(userId, discovered) {
    try {
      if (this.TELEGRAM_ONLY && discovered.chat_type === 'eitaa') return null;

      const channel_url = this.buildChannelUrl(discovered);
      const channel_name = discovered.title || (discovered.username ? `@${discovered.username}` : `Chat ${discovered.chat_id}`);

      // Check duplicates for this user
      const { data: existing, error: existErr } = await supabase
        .from('channels')
        .select('id, user_id, channel_url')
        .eq('user_id', userId)
        .eq('channel_url', channel_url)
        .maybeSingle();

      if (existing) {
        return existing; // already promoted
      }

      const insert = {
        user_id: userId,
        platform: 'telegram',
        channel_url,
        channel_name,
        is_active: true
      };

      const { data: newChannel, error: insErr } = await supabase
        .from('channels')
        .insert([insert])
        .select('*')
        .single();

      if (insErr) throw new Error(insErr.message);

      // Start monitoring immediately
      await monitoringManager.startMonitoringChannel(newChannel);

      return newChannel;
    } catch (e) {
      console.error('AutoPromoteService.promoteOne error:', e.message);
      return null;
    }
  }

  /**
   * Auto-promote all discovered admin chats for a user
   */
  static async promoteAllAdminForUser(userId) {
    try {
      const { data: chats, error } = await supabase
        .from('discovered_chats')
        .select('*')
        .eq('is_bot_member', true)
        .eq('is_bot_admin', true)
        .order('last_seen_at', { ascending: false });

      if (error) throw new Error(error.message);

      const results = [];
      for (const c of chats) {
        // Telegram-only scope
        if (this.TELEGRAM_ONLY && c.chat_type === 'eitaa') continue;
        const promoted = await this.promoteOne(userId, c);
        if (promoted) results.push(promoted);
      }
      return results;
    } catch (e) {
      console.error('AutoPromoteService.promoteAllAdminForUser error:', e.message);
      return [];
    }
  }
}

module.exports = AutoPromoteService;
