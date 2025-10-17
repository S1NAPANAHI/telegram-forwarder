-- V6: Add Views and Functions

-- Create views for common queries
CREATE OR REPLACE VIEW active_user_stats AS
SELECT 
    u.id,
    u.username,
    u.telegram_id,
    u.language,
    u.subscription_type,
    COUNT(DISTINCT k.id) as keyword_count,
    COUNT(DISTINCT c.id) as channel_count,
    COUNT(DISTINCT d.id) as destination_count,
    COUNT(DISTINCT ml.id) as message_count,
    u.created_at,
    u.last_login_at
FROM users u
LEFT JOIN keywords k ON u.id = k.user_id AND k.is_active = true
LEFT JOIN channels c ON u.id = c.user_id AND c.is_active = true
LEFT JOIN destinations d ON u.id = d.user_id AND d.is_active = true
LEFT JOIN message_logs ml ON u.id = ml.user_id AND ml.created_at > NOW() - INTERVAL '30 days'
WHERE u.is_active = true
GROUP BY u.id, u.username, u.telegram_id, u.language, u.subscription_type, u.created_at, u.last_login_at;

CREATE OR REPLACE VIEW daily_message_stats AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_messages,
    COUNT(CASE WHEN status = 'processed' THEN 1 END) as successful_messages,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_messages,
    COUNT(DISTINCT user_id) as active_users,
    AVG(processing_time_ms) as avg_processing_time
FROM message_logs
WHERE created_at > NOW() - INTERVAL '90 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

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
