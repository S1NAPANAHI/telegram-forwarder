#!/usr/bin/env node

/**
 * CRITICAL DIAGNOSTIC TOOL
 * Run this to diagnose and fix your Telegram bot monitoring issues
 * 
 * Usage: node backend/diagnostic.js
 */

require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');

// Your specific configuration
const TARGET_CHAT_ID = '-1003137283604';  // Test group
const YOUR_TELEGRAM_ID = '7213129111';    // Your personal chat for DMs
const YOUR_USER_ID = '9db18e85-c617-44d7-81a8-486905a0ebac'; // From logs

async function runDiagnostic() {
  console.log('🔍 TELEGRAM BOT DIAGNOSTIC STARTING...');
  console.log('=' .repeat(60));
  
  // 1. Check environment variables
  console.log('\n1️⃣ CHECKING ENVIRONMENT VARIABLES...');
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!token) {
    console.log('❌ TELEGRAM_BOT_TOKEN missing!');
    return;
  }
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Supabase credentials missing!');
    return;
  }
  
  console.log('✅ Environment variables OK');
  
  // 2. Test bot connection
  console.log('\n2️⃣ TESTING BOT CONNECTION...');
  const bot = new TelegramBot(token, { polling: false });
  
  try {
    const me = await bot.getMe();
    console.log(`✅ Bot connected: @${me.username} (${me.first_name})`);
  } catch (error) {
    console.log(`❌ Bot connection failed: ${error.message}`);
    return;
  }
  
  // 3. Check bot permissions in target chat
  console.log('\n3️⃣ CHECKING BOT PERMISSIONS...');
  try {
    const chat = await bot.getChat(TARGET_CHAT_ID);
    console.log(`✅ Bot can access chat: ${chat.title} (${chat.type})`);
    
    const me = await bot.getMe();
    const member = await bot.getChatMember(TARGET_CHAT_ID, me.id);
    console.log(`✅ Bot status in chat: ${member.status}`);
    
    const isAdmin = ['administrator', 'creator'].includes(member.status);
    if (!isAdmin) {
      console.log('❌ Bot is NOT admin in the target chat!');
      console.log('🔧 FIX: Make your bot admin in the Test group');
      return;
    }
    console.log('✅ Bot is admin in target chat');
    
  } catch (error) {
    console.log(`❌ Bot permission check failed: ${error.message}`);
    console.log('🔧 FIX: Add bot to the Test group and make it admin');
    return;
  }
  
  // 4. Test Supabase connection
  console.log('\n4️⃣ TESTING DATABASE CONNECTION...');
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, telegram_id')
      .eq('id', YOUR_USER_ID)
      .single();
      
    if (error) throw error;
    console.log(`✅ Database connected. User: ${data.id}`);
    console.log(`✅ Your telegram_id: ${data.telegram_id}`);
    
  } catch (error) {
    console.log(`❌ Database connection failed: ${error.message}`);
    return;
  }
  
  // 5. Check channel monitoring setup
  console.log('\n5️⃣ CHECKING CHANNEL MONITORING SETUP...');
  try {
    const { data: channels, error } = await supabase
      .from('channels')
      .select('*')
      .eq('user_id', YOUR_USER_ID)
      .eq('channel_url', TARGET_CHAT_ID);
      
    if (error) throw error;
    
    if (!channels || channels.length === 0) {
      console.log('❌ Channel not configured for monitoring!');
      console.log('🔧 FIXING: Adding channel to monitoring...');
      
      // Add channel to monitoring
      const { error: insertError } = await supabase
        .from('channels')
        .insert({
          user_id: YOUR_USER_ID,
          platform: 'telegram',
          channel_url: TARGET_CHAT_ID,
          channel_name: 'Test Channel',
          platform_specific_id: TARGET_CHAT_ID,
          is_active: true,
          admin_status: true
        });
        
      if (insertError) {
        console.log(`❌ Failed to add channel: ${insertError.message}`);
        return;
      }
      
      console.log('✅ Channel added to monitoring');
    } else {
      console.log(`✅ Channel monitoring configured: ${channels[0].channel_name}`);
      console.log(`   - Active: ${channels[0].is_active}`);
      console.log(`   - Admin Status: ${channels[0].admin_status}`);
    }
    
  } catch (error) {
    console.log(`❌ Channel setup check failed: ${error.message}`);
    return;
  }
  
  // 6. Check keywords configuration
  console.log('\n6️⃣ CHECKING KEYWORDS CONFIGURATION...');
  try {
    const { data: channelData, error: channelError } = await supabase
      .from('channels')
      .select('id')
      .eq('user_id', YOUR_USER_ID)
      .eq('channel_url', TARGET_CHAT_ID)
      .single();
      
    if (channelError) throw channelError;
    
    const { data: keywords, error: keywordError } = await supabase
      .from('keywords')
      .select('*')
      .eq('channel_id', channelData.id);
      
    if (keywordError) throw keywordError;
    
    if (!keywords || keywords.length === 0) {
      console.log('❌ No keywords configured!');
      console.log('🔧 FIXING: Adding test keyword...');
      
      // Add a test keyword
      const { error: insertError } = await supabase
        .from('keywords')
        .insert({
          user_id: YOUR_USER_ID,
          channel_id: channelData.id,
          keyword: 'test',
          match_type: 'contains',
          case_sensitive: false,
          is_active: true
        });
        
      if (insertError) {
        console.log(`❌ Failed to add keyword: ${insertError.message}`);
        return;
      }
      
      console.log('✅ Test keyword added: "test"');
    } else {
      console.log(`✅ Keywords configured: ${keywords.length}`);
      keywords.forEach(k => {
        console.log(`   - "${k.keyword}" (${k.match_type}, active: ${k.is_active})`);
      });
    }
    
  } catch (error) {
    console.log(`❌ Keyword setup check failed: ${error.message}`);
    return;
  }
  
  // 7. Check destinations configuration
  console.log('\n7️⃣ CHECKING DESTINATIONS CONFIGURATION...');
  try {
    const { data: destinations, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('user_id', YOUR_USER_ID)
      .eq('platform', 'telegram');
      
    if (error) throw error;
    
    if (!destinations || destinations.length === 0) {
      console.log('❌ No Telegram destination configured!');
      console.log('🔧 FIXING: Adding your Telegram DM destination...');
      
      // Add your Telegram DM destination
      const { error: insertError } = await supabase
        .from('destinations')
        .insert({
          user_id: YOUR_USER_ID,
          name: 'SINA Personal Chat',
          platform: 'telegram',
          chat_id: YOUR_TELEGRAM_ID,
          is_active: true
        });
        
      if (insertError) {
        console.log(`❌ Failed to add destination: ${insertError.message}`);
        return;
      }
      
      console.log('✅ Telegram DM destination added');
    } else {
      console.log(`✅ Telegram destinations configured: ${destinations.length}`);
      destinations.forEach(d => {
        console.log(`   - ${d.name} (${d.chat_id}, active: ${d.is_active})`);
      });
    }
    
  } catch (error) {
    console.log(`❌ Destination setup check failed: ${error.message}`);
    return;
  }
  
  // 8. Test webhook URL
  console.log('\n8️⃣ CHECKING WEBHOOK CONFIGURATION...');
  const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL || 'https://backend-service-idry.onrender.com/api/bot/webhook';
  
  try {
    // Check current webhook
    const webhookInfo = await bot.getWebHookInfo();
    console.log(`Current webhook: ${webhookInfo.url || 'None'}`);
    console.log(`Pending updates: ${webhookInfo.pending_update_count}`);
    
    if (webhookInfo.url !== webhookUrl) {
      console.log('🔧 FIXING: Setting correct webhook...');
      await bot.deleteWebHook({ drop_pending_updates: true });
      await bot.setWebHook(webhookUrl);
      console.log(`✅ Webhook set to: ${webhookUrl}`);
    } else {
      console.log('✅ Webhook correctly configured');
    }
    
  } catch (error) {
    console.log(`❌ Webhook setup failed: ${error.message}`);
    return;
  }
  
  // 9. Check required database tables
  console.log('\n9️⃣ CHECKING DATABASE TABLES...');
  try {
    // Test message_feed table
    const { error: feedError } = await supabase
      .from('message_feed')
      .select('id')
      .limit(1);
      
    if (feedError) {
      console.log(`❌ message_feed table issue: ${feedError.message}`);
      console.log('🔧 RUN THIS SQL IN SUPABASE:');
      console.log(`
CREATE TABLE IF NOT EXISTS message_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT,
  content TEXT,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE message_feed ENABLE ROW LEVEL SECURITY;
CREATE POLICY feed_select_own ON message_feed FOR SELECT USING (user_id = auth.uid());
CREATE POLICY feed_insert_own ON message_feed FOR INSERT WITH CHECK (user_id = auth.uid());
`);
      return;
    }
    
    // Test message_queue table
    const { error: queueError } = await supabase
      .from('message_queue')
      .select('id')
      .limit(1);
      
    if (queueError) {
      console.log(`❌ message_queue table issue: ${queueError.message}`);
      console.log('🔧 RUN THIS SQL IN SUPABASE:');
      console.log(`
CREATE TABLE IF NOT EXISTS message_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  channel_id UUID NULL,
  original_chat_id TEXT,
  message_text TEXT,
  message_type TEXT DEFAULT 'text',
  matched_keywords JSONB,
  message_data JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE message_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY queue_select_own ON message_queue FOR SELECT USING (user_id = auth.uid());
CREATE POLICY queue_insert_own ON message_queue FOR INSERT WITH CHECK (user_id = auth.uid());
`);
      return;
    }
    
    console.log('✅ Database tables are ready');
    
  } catch (error) {
    console.log(`❌ Database table check failed: ${error.message}`);
    return;
  }
  
  // 10. Send test message to yourself
  console.log('\n🔟 SENDING TEST MESSAGE...');
  try {
    await bot.sendMessage(YOUR_TELEGRAM_ID, 
      '🤖 **DIAGNOSTIC COMPLETE**\n\n' +
      'Your Telegram forwarder bot is now configured!\n\n' +
      '**To test:**\n' +
      '1. Send a message containing "test" to your Test group\n' +
      '2. You should receive a DM here\n' +
      '3. Check your web dashboard for the message\n\n' +
      '**Target Group:** Test (-1003137283604)\n' +
      '**Keywords:** test\n' +
      '**Status:** Ready ✅',
      { parse_mode: 'Markdown' }
    );
    
    console.log('✅ Test message sent to your DM');
    
  } catch (error) {
    console.log(`❌ Failed to send test message: ${error.message}`);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('🎉 DIAGNOSTIC COMPLETE!');
  console.log('');
  console.log('✅ Your bot should now be working properly!');
  console.log('📝 Test by sending a message with "test" to your Test group');
  console.log('📱 You should receive a DM notification');
  console.log('🌐 Check your web feed for the message');
  console.log('');
  console.log('If you still have issues:');
  console.log('1. Restart your Render.com backend service');
  console.log('2. Make sure the bot is admin in the Test group');
  console.log('3. Check Render.com logs for any errors');
  
  process.exit(0);
}

// Handle errors
runDiagnostic().catch(error => {
  console.error('\n❌ DIAGNOSTIC FAILED:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
});
