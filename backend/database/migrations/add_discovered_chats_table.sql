-- Migration: Add discovered_chats table and update channels table
-- This migration implements Phase 1.2: Database Schema Updates

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

-- Add new columns to existing channels table
ALTER TABLE channels 
ADD COLUMN IF NOT EXISTS monitoring_method TEXT DEFAULT 'bot_api',
ADD COLUMN IF NOT EXISTS admin_status BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS discovery_source TEXT DEFAULT 'manual'; -- 'manual', 'auto_discovered'

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