const supabase = require('../database/supabase');

class UserService {
    async findOrCreateUser(telegramUser) {
        try {
            let { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('telegram_id', telegramUser.id.toString())
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116: single row not found
                throw new Error(error.message);
            }

            if (!user) {
                const { data: newUser, error: insertError } = await supabase
                    .from('users')
                    .insert([{
                        telegram_id: telegramUser.id.toString(),
                        username: telegramUser.username,
                        first_name: telegramUser.first_name,
                        last_name: telegramUser.last_name,
                        language: telegramUser.language_code || 'fa'
                    }])
                    .select()
                    .single();
                if (insertError) throw new Error(insertError.message);
                user = newUser;
            } else {
                const { data: updatedUser, error: updateError } = await supabase
                    .from('users')
                    .update({ last_active: new Date() })
                    .eq('id', user.id)
                    .select()
                    .single();
                if (updateError) throw new Error(updateError.message);
                user = updatedUser;
            }

            return user;
        } catch (error) {
            console.error('Error in findOrCreateUser:', error);
            throw error;
        }
    }

    /**
     * Get user by Telegram ID - used by telegram bot
     * @param {string|number} telegramId - Telegram user ID
     * @returns {Promise<Object|null>} User object or null
     */
    async getByTelegramId(telegramId) {
        try {
            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('telegram_id', telegramId.toString())
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116: single row not found
                console.error('Error getting user by Telegram ID:', error);
                throw new Error(error.message);
            }

            return user || null;
        } catch (error) {
            console.error('Error in getByTelegramId:', error);
            return null;
        }
    }

    /**
     * Create or update user - used by telegram bot
     * @param {Object} userData - User data object
     * @returns {Promise<Object>} User object
     */
    async createOrUpdateUser(userData) {
        try {
            // If telegram_id is provided, try to find existing user
            if (userData.telegram_id) {
                let existingUser = await this.getByTelegramId(userData.telegram_id);
                
                if (existingUser) {
                    // Update existing user
                    const updateData = {
                        ...userData,
                        last_active: new Date().toISOString()
                    };
                    delete updateData.id; // Don't update ID
                    
                    const { data: updatedUser, error: updateError } = await supabase
                        .from('users')
                        .update(updateData)
                        .eq('id', existingUser.id)
                        .select()
                        .single();
                    
                    if (updateError) {
                        console.error('Error updating user:', updateError);
                        throw new Error(updateError.message);
                    }
                    
                    return updatedUser;
                } else {
                    // Create new user
                    const createData = {
                        ...userData,
                        telegram_id: userData.telegram_id.toString(),
                        language: userData.language || userData.lang || 'en',
                        created_at: new Date().toISOString(),
                        last_active: new Date().toISOString()
                    };
                    
                    const { data: newUser, error: insertError } = await supabase
                        .from('users')
                        .insert([createData])
                        .select()
                        .single();
                    
                    if (insertError) {
                        console.error('Error creating user:', insertError);
                        throw new Error(insertError.message);
                    }
                    
                    return newUser;
                }
            } else {
                // No telegram_id, create new user
                const createData = {
                    ...userData,
                    language: userData.language || userData.lang || 'en',
                    created_at: new Date().toISOString(),
                    last_active: new Date().toISOString()
                };
                
                const { data: newUser, error: insertError } = await supabase
                    .from('users')
                    .insert([createData])
                    .select()
                    .single();
                
                if (insertError) {
                    console.error('Error creating user:', insertError);
                    throw new Error(insertError.message);
                }
                
                return newUser;
            }
        } catch (error) {
            console.error('Error in createOrUpdateUser:', error);
            throw error;
        }
    }

    async getUserSubscription(userId) {
        const { data: user, error } = await supabase
            .from('users')
            .select('subscription_plan, keywords_limit, channels_limit, subscription_expires_at')
            .eq('id', userId)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return user;
    }

    async canAddKeyword(userId) {
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('keywords_limit')
            .eq('id', userId)
            .single();

        if (userError) throw new Error(userError.message);

        const { count, error: countError } = await supabase
            .from('keywords')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_active', true);

        if (countError) throw new Error(countError.message);

        return count < user.keywords_limit;
    }

    async canAddChannel(userId) {
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('channels_limit')
            .eq('id', userId)
            .single();

        if (userError) throw new Error(userError.message);

        const { count, error: countError } = await supabase
            .from('channels')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_active', true);

        if (countError) throw new Error(countError.message);

        return count < user.channels_limit;
    }

    async updateUserPlan(userId, plan) {
        const plans = {
            free: { keywords_limit: 10, channels_limit: 5 },
            premium: { keywords_limit: 100, channels_limit: 20 },
            enterprise: { keywords_limit: 1000, channels_limit: 100 }
        };

        const update = {
            subscription_plan: plan,
            keywords_limit: plans[plan].keywords_limit,
            channels_limit: plans[plan].channels_limit,
            subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        };

        const { data, error } = await supabase
            .from('users')
            .update(update)
            .eq('id', userId)
            .select();

        if (error) {
            throw new Error(error.message);
        }

        return data[0];
    }

    async updateLastActive(userId) {
        const { data, error } = await supabase
            .from('users')
            .update({ last_active: new Date() })
            .eq('id', userId)
            .select();

        if (error) {
            throw new Error(error.message);
        }

        return data[0];
    }

    async findUserByTelegramId(telegramId) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('telegram_id', telegramId)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw new Error(error.message);
            }

            return data;
        } catch (error) {
            console.error('Error finding user by Telegram ID:', error);
            throw error;
        }
    }

    async linkTelegramAccount(userId, telegramId, telegramUsername) {
        try {
            const { data, error } = await supabase
                .from('users')
                .update({ 
                    telegram_id: telegramId,
                    telegram_username: telegramUsername 
                })
                .eq('id', userId);

            if (error) {
                throw new Error(error.message);
            }

            return data;
        } catch (error) {
            console.error('Error linking Telegram account:', error);
            throw error;
        }
    }
}

module.exports = new UserService();