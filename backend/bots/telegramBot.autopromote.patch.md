const TelegramBot = require('node-telegram-bot-api');
const UserService = require('../services/UserService');
const ChatDiscoveryService = require('../services/ChatDiscoveryService');
const TelegramDiscoveryService = require('../services/TelegramDiscoveryService');

// ... keep existing imports from the current file

// helper to get auto_promote setting
async function shouldAutoPromote(userId) {
  try {
    const { supabase } = require('../database/supabase');
    const { data } = await supabase.from('users').select('auto_promote_admin').eq('id', userId).maybeSingle();
    return data?.auto_promote_admin !== false; // default true
  } catch {
    return true;
  }
}

// inside class TelegramMonitor, replace registerPassiveDiscovery with auto-promotion
