const supabase = require('../database/supabase');

function normalizeTelegramTarget(chatId) {
  if (!chatId) return null;
  const v = chatId.toString().trim();
  if (/^-?\d+$/.test(v)) return v; // numeric id
  if (v.startsWith('@')) return v;
  if (/^[A-Za-z0-9_]{5,}$/i.test(v)) return '@' + v;
  return v;
}

class DestinationService {
  async addDestination(userId, destinationData) {
    const { data, error } = await supabase
      .from('destinations')
      .insert([{ user_id: userId, ...destinationData }])
      .select();
    if (error) throw new Error(error.message);
    return data[0];
  }

  async getUserDestinations(userId, activeOnly = true) {
    let query = supabase
      .from('destinations')
      .select('id, user_id, type, platform, chat_id, name, is_active')
      .eq('user_id', userId);
    if (activeOnly) query = query.eq('is_active', true);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map(d => ({ ...d, chat_id: normalizeTelegramTarget(d.chat_id) }));
  }

  async deleteDestination(userId, destinationId) {
    const { data, error } = await supabase
      .from('destinations')
      .delete()
      .eq('id', destinationId)
      .eq('user_id', userId)
      .select();
    if (error) throw new Error(error.message);
    return data[0];
  }
}

module.exports = { DestinationService, normalizeTelegramTarget };