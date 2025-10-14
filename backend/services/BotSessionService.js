const supabase = require('../database/supabase');

class BotSessionService {
    async createOrUpdateSession(userId, currentState, context = {}) {
        const { data, error } = await supabase
            .from('bot_sessions')
            .upsert({
                user_id: userId,
                current_state: currentState,
                context: context,
                last_interaction: new Date()
            }, { onConflict: 'user_id' })
            .select();

        if (error) {
            throw new Error(error.message);
        }

        return data[0];
    }

    async getSession(userId) {
        const { data, error } = await supabase
            .from('bot_sessions')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116: single row not found
            throw new Error(error.message);
        }

        return data;
    }

    async clearSession(userId) {
        const { data, error } = await supabase
            .from('bot_sessions')
            .delete()
            .eq('user_id', userId);

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    async updateLastInteraction(userId) {
        const { data, error } = await supabase
            .from('bot_sessions')
            .update({ last_interaction: new Date() })
            .eq('user_id', userId)
            .select();

        if (error) {
            throw new Error(error.message);
        }

        return data[0];
    }
}

module.exports = new BotSessionService();