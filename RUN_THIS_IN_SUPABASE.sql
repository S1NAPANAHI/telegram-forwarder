-- =====================================================
-- COPY AND RUN THIS ENTIRE SQL IN SUPABASE SQL EDITOR
-- =====================================================

-- First, create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS discovered_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    chat_id VARCHAR(100) NOT NULL,
    chat_type VARCHAR(50) NOT NULL,
    chat_title VARCHAR(500),
    chat_username VARCHAR(100),
    is_admin BOOLEAN DEFAULT false,
    is_member BOOLEAN DEFAULT true,
    discovery_method VARCHAR(50) DEFAULT 'bot_api',
    last_discovered TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_discovered_chats_user_id ON discovered_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_discovered_chats_chat_id ON discovered_chats(chat_id);
CREATE INDEX IF NOT EXISTS idx_discovered_chats_is_admin ON discovered_chats(is_admin);
CREATE INDEX IF NOT EXISTS idx_discovered_chats_last_discovered ON discovered_chats(last_discovered DESC);

-- Create unique constraint on user_id + chat_id combination
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_user_chat' 
        AND conrelid = 'discovered_chats'::regclass
    ) THEN
        ALTER TABLE discovered_chats 
        ADD CONSTRAINT unique_user_chat UNIQUE(user_id, chat_id);
    END IF;
END $$;

-- Create a default system user for bot operations if it doesn't exist
INSERT INTO users (
    id,
    username,
    telegram_id,
    first_name,
    is_active,
    registered_via,
    language
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'telegram_bot_system',
    'system_bot',
    'System Bot User',
    true,
    'system',
    'en'
) ON CONFLICT (telegram_id) DO NOTHING;

-- Update any existing discovered_chats rows that have NULL user_id
-- to use the system user
UPDATE discovered_chats 
SET user_id = '00000000-0000-0000-0000-000000000001'::uuid 
WHERE user_id IS NULL;

-- Now make user_id NOT NULL since we've fixed existing data
ALTER TABLE discovered_chats 
ALTER COLUMN user_id SET NOT NULL;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_discovered_chats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_discovered_chats_updated_at ON discovered_chats;
CREATE TRIGGER update_discovered_chats_updated_at 
    BEFORE UPDATE ON discovered_chats
    FOR EACH ROW 
    EXECUTE FUNCTION update_discovered_chats_updated_at();

-- Add RLS policy for discovered_chats
ALTER TABLE discovered_chats ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can manage own discovered chats" ON discovered_chats;

-- Create RLS policy
CREATE POLICY "Users can manage own discovered chats" ON discovered_chats
    FOR ALL USING (
        auth.uid()::text = user_id::text 
        OR user_id = '00000000-0000-0000-0000-000000000001'::uuid
    );

-- Create a function to safely insert discovered chats
CREATE OR REPLACE FUNCTION upsert_discovered_chat(
    p_user_id UUID,
    p_chat_id VARCHAR(100),
    p_chat_type VARCHAR(50),
    p_chat_title VARCHAR(500) DEFAULT NULL,
    p_chat_username VARCHAR(100) DEFAULT NULL,
    p_is_admin BOOLEAN DEFAULT false,
    p_discovery_method VARCHAR(50) DEFAULT 'bot_api'
)
RETURNS UUID AS $$
DECLARE
    result_id UUID;
    target_user_id UUID;
BEGIN
    -- Use provided user_id or fall back to system user
    target_user_id := COALESCE(p_user_id, '00000000-0000-0000-0000-000000000001'::uuid);
    
    -- Ensure the user exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = target_user_id) THEN
        target_user_id := '00000000-0000-0000-0000-000000000001'::uuid;
    END IF;
    
    -- Upsert the discovered chat
    INSERT INTO discovered_chats (
        user_id,
        chat_id,
        chat_type,
        chat_title,
        chat_username,
        is_admin,
        discovery_method,
        last_discovered
    ) VALUES (
        target_user_id,
        p_chat_id,
        p_chat_type,
        p_chat_title,
        p_chat_username,
        p_is_admin,
        p_discovery_method,
        NOW()
    )
    ON CONFLICT (user_id, chat_id) 
    DO UPDATE SET
        chat_title = EXCLUDED.chat_title,
        chat_username = EXCLUDED.chat_username,
        is_admin = EXCLUDED.is_admin,
        discovery_method = EXCLUDED.discovery_method,
        last_discovered = NOW(),
        updated_at = NOW()
    RETURNING id INTO result_id;
    
    RETURN result_id;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON discovered_chats TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_discovered_chat TO authenticated;

SELECT 'Database migration completed successfully! Your bot should work now.' as result;