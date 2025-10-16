#!/usr/bin/env node
// Database Migration Checker and Runner
// Checks if discovered_chats table exists and creates it if missing

require('dotenv').config();
const supabase = require('../database/supabase');

async function checkAndRunMigration() {
    console.log('🔍 Checking database schema...');
    
    try {
        // Test if discovered_chats table exists by querying it
        const { data, error } = await supabase
            .from('discovered_chats')
            .select('id')
            .limit(1);
        
        if (error) {
            if (error.message.includes('does not exist') || error.code === '42P01') {
                console.log('❌ discovered_chats table not found. Creating...');
                await createDiscoveredChatsTable();
            } else {
                console.error('❌ Database error:', error.message);
                throw error;
            }
        } else {
            console.log('✅ discovered_chats table exists');
        }
        
        // Check if channels table has new columns
        await checkChannelsTableColumns();
        
        console.log('✅ Database schema check complete');
        
    } catch (error) {
        console.error('💥 Migration check failed:', error.message);
        process.exit(1);
    }
}

async function createDiscoveredChatsTable() {
    const createTableSQL = `
        -- Create discovered_chats table
        CREATE TABLE IF NOT EXISTS discovered_chats (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            chat_id TEXT NOT NULL,
            chat_type TEXT NOT NULL, -- 'group', 'supergroup', 'channel'
            chat_title TEXT,
            chat_username TEXT,
            is_admin BOOLEAN DEFAULT false,
            member_count INTEGER,
            discovery_method TEXT, -- 'bot_api', 'client_api'
            last_discovered TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            is_promoted BOOLEAN DEFAULT false, -- track if auto-promoted to channels
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, chat_id)
        );
        
        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_discovered_chats_user_id ON discovered_chats(user_id);
        CREATE INDEX IF NOT EXISTS idx_discovered_chats_chat_id ON discovered_chats(chat_id);
        CREATE INDEX IF NOT EXISTS idx_discovered_chats_is_admin ON discovered_chats(is_admin);
        CREATE INDEX IF NOT EXISTS idx_discovered_chats_last_discovered ON discovered_chats(last_discovered);
        
        -- Create function to automatically update last_discovered timestamp
        CREATE OR REPLACE FUNCTION update_discovered_chats_timestamp()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.last_discovered = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
        
        -- Create trigger for automatic timestamp updates
        DROP TRIGGER IF EXISTS update_discovered_chats_timestamp ON discovered_chats;
        CREATE TRIGGER update_discovered_chats_timestamp
            BEFORE UPDATE ON discovered_chats
            FOR EACH ROW
            EXECUTE FUNCTION update_discovered_chats_timestamp();
    `;
    
    try {
        const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
        
        if (error) {
            // If RPC doesn't work, try direct table creation
            console.log('⚠️  RPC method failed, trying direct table creation...');
            
            // Create table directly
            const { error: createError } = await supabase
                .from('discovered_chats')
                .select('id')
                .limit(0); // This will fail if table doesn't exist
            
            if (createError) {
                console.log('❌ Cannot create table automatically.');
                console.log('📝 Please run the following SQL manually in your Supabase SQL editor:');
                console.log('\n' + createTableSQL);
                throw new Error('Manual migration required');
            }
        } else {
            console.log('✅ discovered_chats table created successfully');
        }
    } catch (error) {
        console.error('❌ Failed to create discovered_chats table:', error.message);
        console.log('\n📝 Please run the migration SQL manually in your Supabase SQL editor.');
        console.log('File: backend/database/migrations/add_discovered_chats_table.sql');
        throw error;
    }
}

async function checkChannelsTableColumns() {
    try {
        // Try to query the new columns
        const { data, error } = await supabase
            .from('channels')
            .select('monitoring_method, admin_status, discovery_source')
            .limit(1);
        
        if (error && error.message.includes('does not exist')) {
            console.log('❌ Missing columns in channels table. Adding...');
            await addChannelsTableColumns();
        } else {
            console.log('✅ channels table columns are up to date');
        }
    } catch (error) {
        console.warn('⚠️  Could not verify channels table columns:', error.message);
    }
}

async function addChannelsTableColumns() {
    const alterTableSQL = `
        -- Add new columns to existing channels table
        ALTER TABLE channels 
        ADD COLUMN IF NOT EXISTS monitoring_method TEXT DEFAULT 'bot_api',
        ADD COLUMN IF NOT EXISTS admin_status BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS discovery_source TEXT DEFAULT 'manual'; -- 'manual', 'auto_discovered'
    `;
    
    try {
        const { error } = await supabase.rpc('exec_sql', { sql: alterTableSQL });
        
        if (error) {
            console.log('❌ Cannot alter channels table automatically.');
            console.log('📝 Please run the following SQL manually in your Supabase SQL editor:');
            console.log('\n' + alterTableSQL);
            throw new Error('Manual migration required for channels table');
        } else {
            console.log('✅ channels table columns added successfully');
        }
    } catch (error) {
        console.error('❌ Failed to add channels table columns:', error.message);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    checkAndRunMigration()
        .then(() => {
            console.log('🎉 Migration check completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Migration failed:', error.message);
            process.exit(1);
        });
}

module.exports = { checkAndRunMigration };