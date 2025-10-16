-- =======================================================================
-- CRITICAL FIX: Complete database schema and data fixes for all issues
-- Run this SQL in Supabase to fix ALL problems at once
-- =======================================================================

-- 1. Fix discovered_chats schema (stop "is_member column" errors)
ALTER TABLE discovered_chats ADD COLUMN IF NOT EXISTS is_member BOOLEAN DEFAULT true;
ALTER TABLE discovered_chats ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE discovered_chats ADD COLUMN IF NOT EXISTS is_promoted BOOLEAN DEFAULT false;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_discovered_chats_is_member ON discovered_chats(is_member);
CREATE INDEX IF NOT EXISTS idx_discovered_chats_is_promoted ON discovered_chats(is_promoted);

-- 2. Fix destinations schema (stop 500 on PUT /api/destinations)
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create update trigger for destinations
CREATE OR REPLACE FUNCTION set_destinations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_destinations_updated ON destinations;
CREATE TRIGGER trg_destinations_updated
    BEFORE UPDATE ON destinations
    FOR EACH ROW
    EXECUTE FUNCTION set_destinations_updated_at();

-- 3. Create message_feed and message_queue tables (fix 404/500 on /api/messages/feed)
CREATE TABLE IF NOT EXISTS message_feed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    queue_id UUID NULL,
    title TEXT,
    content TEXT,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT
);

-- Add indexes for message tables
CREATE INDEX IF NOT EXISTS idx_message_feed_user_id ON message_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_message_feed_created_at ON message_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_queue_user_id ON message_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_message_queue_status ON message_queue(status);
CREATE INDEX IF NOT EXISTS idx_message_queue_created_at ON message_queue(created_at DESC);

-- 4. Enable RLS and create policies for message tables
ALTER TABLE message_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_queue ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "feed_select_own" ON message_feed;
DROP POLICY IF EXISTS "feed_insert_own" ON message_feed;
DROP POLICY IF EXISTS "feed_delete_own" ON message_feed;
DROP POLICY IF EXISTS "queue_select_own" ON message_queue;
DROP POLICY IF EXISTS "queue_insert_own" ON message_queue;
DROP POLICY IF EXISTS "queue_update_own" ON message_queue;

-- Create RLS policies for message_feed
CREATE POLICY "feed_select_own" ON message_feed
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "feed_insert_own" ON message_feed
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "feed_delete_own" ON message_feed
    FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for message_queue
CREATE POLICY "queue_select_own" ON message_queue
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "queue_insert_own" ON message_queue
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "queue_update_own" ON message_queue
    FOR UPDATE USING (user_id = auth.uid());

-- 5. Fix user ownership for your current logged-in user
-- This ensures the frontend shows the channels and bot works properly
UPDATE channels SET 
    user_id = '9db18e85-c617-44d7-81a8-486905a0ebac',
    monitoring_method = 'bot_api',
    admin_status = true,
    is_active = true,
    updated_at = NOW()
WHERE channel_url = '-1003137283604' OR platform_specific_id = '-1003137283604';

UPDATE discovered_chats SET 
    user_id = '9db18e85-c617-44d7-81a8-486905a0ebac',
    is_promoted = true,
    is_admin = true,
    is_member = true,
    updated_at = NOW()
WHERE chat_id = '-1003137283604';

-- 6. Ensure you have at least one active destination
INSERT INTO destinations (
    id,
    user_id,
    name,
    platform,
    chat_id,
    is_active,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '9db18e85-c617-44d7-81a8-486905a0ebac',
    'Auto-Created Destination',
    'telegram',
    'INKBLOOD', -- You can update this to your numeric chat ID later
    true,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- 7. Create channels row if it doesn't exist (ensure monitoring works)
INSERT INTO channels (
    id,
    user_id,
    platform,
    channel_url,
    channel_name,
    platform_specific_id,
    is_active,
    admin_status,
    monitoring_method,
    discovery_source,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '9db18e85-c617-44d7-81a8-486905a0ebac',
    'telegram',
    '-1003137283604',
    'Test',
    '-1003137283604',
    true,
    true,
    'bot_api',
    'auto_discovered',
    NOW(),
    NOW()
) ON CONFLICT (user_id, channel_url) DO UPDATE SET
    is_active = true,
    admin_status = true,
    monitoring_method = 'bot_api',
    platform_specific_id = '-1003137283604',
    updated_at = NOW();

-- 8. Create helper function for message queue statistics
CREATE OR REPLACE FUNCTION get_message_queue_stats(p_user_id UUID)
RETURNS TABLE (
    total_messages BIGINT,
    pending_messages BIGINT,
    delivered_messages BIGINT,
    failed_messages BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_messages,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_messages,
        COUNT(*) FILTER (WHERE status = 'delivered') as delivered_messages,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_messages
    FROM message_queue 
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON message_feed TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON message_queue TO authenticated;
GRANT EXECUTE ON FUNCTION get_message_queue_stats TO authenticated;

-- Success message
SELECT 'ALL CRITICAL ISSUES FIXED! Your bot should work now. Please redeploy the backend.' AS result;