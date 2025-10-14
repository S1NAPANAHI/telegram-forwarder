const supabase = require('../database/supabase');

class DestinationService {
    async addDestination(userId, destinationData) {
        const { data, error } = await supabase
            .from('destinations')
            .insert([{ user_id: userId, ...destinationData }])
            .select();

        if (error) {
            throw new Error(error.message);
        }

        return data[0];
    }

    async getUserDestinations(userId, activeOnly = true) {
        let query = supabase.from('destinations').select('*').eq('user_id', userId);

        if (activeOnly) {
            query = query.eq('is_active', true);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    async deleteDestination(userId, destinationId) {
        const { data, error } = await supabase
            .from('destinations')
            .delete()
            .eq('id', destinationId)
            .eq('user_id', userId)
            .select();

        if (error) {
            throw new Error(error.message);
        }

        return data[0];
    }
}

module.exports = new DestinationService();