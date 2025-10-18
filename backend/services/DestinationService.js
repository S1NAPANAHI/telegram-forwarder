const supabase = require('../database/supabase');
const IDResolutionService = require('./IDResolutionService');

class DestinationService {
  constructor() {
    this.idResolver = new IDResolutionService();
  }

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
    return data || [];
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

  /**
   * Add destination with automatic ID resolution
   */
  async addDestinationWithResolution(userId, input, name = null) {
    try {
      // Validate and resolve the destination
      const validation = await this.idResolver.validateDestination(input);
      
      if (!validation.valid) {
        throw new Error(`Invalid destination: ${validation.error}`);
      }

      const { chatInfo, canSend, botStatus } = validation;
      
      // Prepare destination data
      const destinationData = {
        type: 'chat',
        platform: 'telegram',
        chat_id: chatInfo.id, // This is now the numeric ID
        name: name || chatInfo.title,
        settings: { // Using 'settings' column for metadata
          original_input: input,
          chat_type: chatInfo.type,
          username: chatInfo.username,
          can_send: canSend,
          bot_status: botStatus,
          resolved_at: new Date().toISOString()
        }
      };

      // Save to database
      const destination = await this.addDestination(userId, destinationData);
      
      return {
        success: true,
        destination,
        chatInfo,
        warnings: validation.warning ? [validation.warning] : []
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Bulk validate destinations
   */
  async validateExistingDestinations(userId) {
    const destinations = await this.getUserDestinations(userId, false);
    const results = [];

    for (const dest of destinations) {
      try {
        const validation = await this.idResolver.validateDestination(dest.chat_id);
        results.push({
          destination: dest,
          validation,
          needsUpdate: false
        });
      } catch (error) {
        results.push({
          destination: dest,
          validation: { valid: false, error: error.message },
          needsUpdate: true
        });
      }
    }

    return results;
  }
}

module.exports = DestinationService;