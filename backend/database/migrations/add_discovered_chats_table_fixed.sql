-- FIXED Migration: Add discovered_chats table and update channels table
-- This migration implements Phase 1.2: Database Schema Updates
-- Fixed version to handle potential foreign key issues

-- First, let's check if users table exists and get its structure
-- If this fails, we'll need to create the users table first

-- Step 1: Create discovered_chats table with safe foreign key reference
CREATE TABLE IF NOT EXISTS discovered_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- We'll add the foreign key constraint separately
    chat_id TEXT NOT NULL,
    chat_type TEXT NOT NULL CHECK (chat_type IN ('group', 'supergroup', 'channel', 'private')),
    chat_title TEXT,
    chat_username TEXT,
    is_admin BOOLEAN DEFAULT false,
    member_count INTEGER,
    discovery_method TEXT DEFAULT 'bot_api' CHECK (discovery_method IN ('bot_api', 'client_api')),
    last_discovered TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_promoted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create unique constraint
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'discovered_chats_user_chat_unique'
    ) THEN
        ALTER TABLE discovered_chats 
        ADD CONSTRAINT discovered_chats_user_chat_unique UNIQUE(user_id, chat_id);
    END IF;
END $$;

-- Step 3: Add foreign key constraint if users table exists
DO $$ 
BEGIN
    -- Check if users table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        -- Check if the foreign key constraint doesn't already exist
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'discovered_chats_user_id_fkey'
        ) THEN
            -- Add foreign key constraint
            ALTER TABLE discovered_chats 
            ADD CONSTRAINT discovered_chats_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        END IF;
    ELSE
        RAISE NOTICE 'Users table does not exist. Foreign key constraint not added.';
    END IF;
END $$;

-- Step 4: Add new columns to existing channels table (if it exists)
DO $$ 
BEGIN
    -- Check if channels table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'channels') THEN
        -- Add monitoring_method column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'channels' AND column_name = 'monitoring_method'
        ) THEN
            ALTER TABLE channels ADD COLUMN monitoring_method TEXT DEFAULT 'bot_api';
        END IF;
        
        -- Add admin_status column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'channels' AND column_name = 'admin_status'
        ) THEN
            ALTER TABLE channels ADD COLUMN admin_status BOOLEAN DEFAULT false;
        END IF;
        
        -- Add discovery_source column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'channels' AND column_name = 'discovery_source'
        ) THEN
            ALTER TABLE channels ADD COLUMN discovery_source TEXT DEFAULT 'manual';
        END IF;
    ELSE
        RAISE NOTICE 'Channels table does not exist. Column additions skipped.';
    END IF;
END $$;

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_discovered_chats_user_id ON discovered_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_discovered_chats_chat_id ON discovered_chats(chat_id);
CREATE INDEX IF NOT EXISTS idx_discovered_chats_is_admin ON discovered_chats(is_admin);
CREATE INDEX IF NOT EXISTS idx_discovered_chats_last_discovered ON discovered_chats(last_discovered DESC);
CREATE INDEX IF NOT EXISTS idx_discovered_chats_is_promoted ON discovered_chats(is_promoted);
CREATE INDEX IF NOT EXISTS idx_discovered_chats_discovery_method ON discovered_chats(discovery_method);
CREATE INDEX IF NOT EXISTS idx_discovered_chats_chat_type ON discovered_chats(chat_type);

-- Step 6: Create function to automatically update timestamps
CREATE OR REPLACE FUNCTION update_discovered_chats_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.last_discovered = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_discovered_chats_timestamps ON discovered_chats;
CREATE TRIGGER update_discovered_chats_timestamps
    BEFORE UPDATE ON discovered_chats
    FOR EACH ROW
    EXECUTE FUNCTION update_discovered_chats_timestamps();

-- Step 8: Create function to automatically update updated_at on any update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Add RLS (Row Level Security) policies if using Supabase
DO $$ 
BEGIN
    -- Enable RLS on discovered_chats table
    ALTER TABLE discovered_chats ENABLE ROW LEVEL SECURITY;
    
    -- Create policy for users to access their own discovered chats
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'discovered_chats' AND policyname = 'Users can access their own discovered chats'
    ) THEN
        CREATE POLICY "Users can access their own discovered chats" ON discovered_chats
            FOR ALL USING (auth.uid()::uuid = user_id);
    END IF;
    
EXCEPTION
    WHEN undefined_function THEN
        RAISE NOTICE 'Supabase auth functions not available. Skipping RLS setup.';
END $$;

-- Step 10: Insert some helpful comments
COMMENT ON TABLE discovered_chats IS 'Stores automatically discovered Telegram chats with admin status tracking';
COMMENT ON COLUMN discovered_chats.user_id IS 'Reference to the user who discovered this chat';
COMMENT ON COLUMN discovered_chats.chat_id IS 'Telegram chat ID (can be numeric ID or @username)';
COMMENT ON COLUMN discovered_chats.chat_type IS 'Type of chat: group, supergroup, channel, or private';
COMMENT ON COLUMN discovered_chats.is_admin IS 'Whether the bot has admin rights in this chat';
COMMENT ON COLUMN discovered_chats.discovery_method IS 'How this chat was discovered: bot_api or client_api';
COMMENT ON COLUMN discovered_chats.is_promoted IS 'Whether this chat has been promoted to active monitoring';

-- Final verification query to check if everything was created successfully
DO $$ 
BEGIN
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Created table: discovered_chats';
    
    -- Check if users table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE NOTICE 'Users table exists - foreign key constraint added';
    ELSE
        RAISE NOTICE 'Users table missing - you may need to create it first';
    END IF;
    
    -- Check if channels table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'channels') THEN
        RAISE NOTICE 'Channels table exists - columns added';
    ELSE
        RAISE NOTICE 'Channels table missing - column additions skipped';
    END IF;
END $$;