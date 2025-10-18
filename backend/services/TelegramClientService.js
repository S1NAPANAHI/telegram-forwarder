const supabase = require('../database/supabase');

class TelegramClientService {
  async saveCredentials({ userId, apiId, apiHash, phone }) {
    const { data, error } = await supabase
      .from('user_telegram_clients')
      .upsert(
        {
          user_id: userId,
          api_id: apiId,
          api_hash: apiHash,
          phone: phone,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select();

    if (error) {
      console.error('Error saving telegram client credentials:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data[0] };
  }

  async getCredentials(userId) {
    const { data, error } = await supabase
      .from('user_telegram_clients')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error getting telegram client credentials:', error);
    }

    return data;
  }

  async updateSession({ userId, session }) {
    const { data, error } = await supabase
      .from('user_telegram_clients')
      .update({ session: session, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error('Error updating telegram client session:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data[0] };
  }

  async updatePhoneCodeHash({ userId, phoneCodeHash }) {
    const { data, error } = await supabase
      .from('user_telegram_clients')
      .update({ phone_code_hash: phoneCodeHash, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error('Error updating phone code hash:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data[0] };
  }

  async updateStatus({ userId, status, error = null }) {
    const { data, error: dbError } = await supabase
      .from('user_telegram_clients')
      .update({ status: status, last_error: error, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select();

    if (dbError) {
      console.error('Error updating telegram client status:', dbError);
      return { success: false, error: dbError.message };
    }

    return { success: true, data: data[0] };
  }

  async getActiveSessions() {
    const { data, error } = await supabase
      .from('user_telegram_clients')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error getting active telegram client sessions:', error);
      return [];
    }

    return data;
  }
}

module.exports = TelegramClientService;