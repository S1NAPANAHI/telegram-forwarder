-- Comprehensive Database Schema for Telegram Forwarder Bot
-- Supports PostgreSQL/Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table with enhanced features
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id VARCHAR(50) UNIQUE,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    language VARCHAR(10) DEFAULT 'fa',
    timezone VARCHAR(50) DEFAULT 'Asia/Tehran',
    role VARCHAR(20) DEFAULT 'user', -- user, admin, premium
    subscription_type VARCHAR(20) DEFAULT 'free', -- free, basic, premium
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    phone_verified_at TIMESTAMP WITH TIME ZONE,
    registered_via VARCHAR(20) DEFAULT 'web', -- web, telegram_webapp, telegram_bot
    last_login_at TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions for authentication
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    device_info JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Keywords table with advanced matching options
CREATE TABLE IF NOT EXISTS keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    description TEXT,
    category VARCHAR(100),
    case_sensitive BOOLEAN DEFAULT false,
    exact_match BOOLEAN DEFAULT false,
    regex_pattern TEXT, -- For advanced regex matching
    priority INTEGER DEFAULT 1, -- 1-10, higher = more important
    is_active BOOLEAN DEFAULT true,
    match_count INTEGER DEFAULT 0,
    last_matched_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[], -- Array of tags for organization
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Channels/Sources table with enhanced monitoring
CREATE TABLE IF NOT EXISTS channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(20) NOT NULL, -- telegram, discord, twitter, rss, etc.
    channel_name VARCHAR(200) NOT NULL,
    channel_url TEXT NOT NULL,
    channel_id VARCHAR(100), -- Platform-specific ID
    description TEXT,
    category VARCHAR(100),
    language VARCHAR(10) DEFAULT 'fa',
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    monitoring_enabled BOOLEAN DEFAULT true,
    last_message_at TIMESTAMP WITH TIME ZONE,
    message_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    last_error_at TIMESTAMP WITH TIME ZONE,
    settings JSONB DEFAULT '{}', -- Platform-specific settings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Destinations table for forwarding
CREATE TABLE IF NOT EXISTS destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL, -- private_chat, group, channel, webhook, email
    platform VARCHAR(20) NOT NULL, -- telegram, discord, email, webhook
    chat_id VARCHAR(100), -- For chat platforms
    webhook_url TEXT, -- For webhook destinations
    email_address VARCHAR(255), -- For email destinations
    is_active BOOLEAN DEFAULT true,
    format_template TEXT, -- Message formatting template
    settings JSONB DEFAULT '{}',
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Keyword-Channel associations (many-to-many)
CREATE TABLE IF NOT EXISTS keyword_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keyword_id UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(keyword_id, channel_id)
);

-- Keyword-Destination associations (many-to-many)
CREATE TABLE IF NOT EXISTS keyword_destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keyword_id UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(keyword_id, destination_id)
);

-- Enhanced logs table for message processing
CREATE TABLE IF NOT EXISTS message_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    keyword_id UUID REFERENCES keywords(id) ON DELETE SET NULL,
    channel_id UUID REFERENCES channels(id) ON DELETE SET NULL,
    destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL,
    original_message_id VARCHAR(100),
    forwarded_message_id VARCHAR(100),
    original_message_text TEXT,
    formatted_message_text TEXT,
    matched_keyword TEXT,
    match_type VARCHAR(20), -- exact, partial, regex
    processing_time_ms INTEGER,
    status VARCHAR(20) DEFAULT 'pending', -- pending, processed, failed, skipped
    error_message TEXT,
    duplicate_of UUID REFERENCES message_logs(id),
    metadata JSONB DEFAULT '{}', -- Additional message data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Filters for advanced message filtering
CREATE TABLE IF NOT EXISTS message_filters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    filter_type VARCHAR(20) NOT NULL, -- blacklist, whitelist, regex, length, time
    filter_value TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    apply_to VARCHAR(20) DEFAULT 'all', -- all, keywords, channels, destinations
    target_id UUID, -- specific keyword/channel/destination ID if apply_to is not 'all'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User notifications and alerts
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- system, keyword_match, error, quota_warning
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    is_sent BOOLEAN DEFAULT false,
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, critical
    delivery_method VARCHAR(20) DEFAULT 'in_app', -- in_app, email, telegram, sms
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API rate limiting
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ip_address INET,
    endpoint VARCHAR(200) NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    window_end TIMESTAMP WITH TIME ZONE,
    is_blocked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs for security and debugging
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50), -- user, keyword, channel, destination
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings and configuration
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_keywords_user_id ON keywords(user_id);
CREATE INDEX IF NOT EXISTS idx_keywords_is_active ON keywords(is_active);
CREATE INDEX IF NOT EXISTS idx_keywords_keyword ON keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_keywords_priority ON keywords(priority DESC);

CREATE INDEX IF NOT EXISTS idx_channels_user_id ON channels(user_id);
CREATE INDEX IF NOT EXISTS idx_channels_platform ON channels(platform);
CREATE INDEX IF NOT EXISTS idx_channels_is_active ON channels(is_active);
CREATE INDEX IF NOT EXISTS idx_channels_monitoring_enabled ON channels(monitoring_enabled);

CREATE INDEX IF NOT EXISTS idx_destinations_user_id ON destinations(user_id);
CREATE INDEX IF NOT EXISTS idx_destinations_is_active ON destinations(is_active);

CREATE INDEX IF NOT EXISTS idx_message_logs_user_id ON message_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_message_logs_keyword_id ON message_logs(keyword_id);
CREATE INDEX IF NOT EXISTS idx_message_logs_channel_id ON message_logs(channel_id);
CREATE INDEX IF NOT EXISTS idx_message_logs_status ON message_logs(status);
CREATE INDEX IF NOT EXISTS idx_message_logs_created_at ON message_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_keywords_updated_at BEFORE UPDATE ON keywords
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON channels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON destinations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_logs_updated_at BEFORE UPDATE ON message_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_filters_updated_at BEFORE UPDATE ON message_filters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_limits_updated_at BEFORE UPDATE ON rate_limits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default system settings
INSERT INTO system_settings (key, value, description, is_public) VALUES
('app_name', '"Telegram Forwarder Bot"', 'Application name', true),
('app_version', '"2.0.0"', 'Application version', true),
('default_language', '"fa"', 'Default system language', true),
('max_keywords_per_user', '100', 'Maximum keywords per user', false),
('max_channels_per_user', '50', 'Maximum channels per user', false),
('max_destinations_per_user', '20', 'Maximum destinations per user', false),
('rate_limit_requests_per_minute', '60', 'API rate limit per minute', false),
('session_duration_hours', '168', 'Session duration in hours (7 days)', false),
('enable_email_notifications', 'true', 'Enable email notifications', false),
('enable_telegram_notifications', 'true', 'Enable Telegram notifications', false)
ON CONFLICT (key) DO NOTHING;

-- Discovered Chats table for bot's known groups/channels
CREATE TABLE IF NOT EXISTS discovered_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chat_id VARCHAR(100) NOT NULL, -- Numeric chat ID (can be negative for groups/channels)
    chat_type VARCHAR(20) NOT NULL, -- private, group, supergroup, channel
    chat_title VARCHAR(255),
    chat_username VARCHAR(100), -- @username if available
    is_admin BOOLEAN DEFAULT false, -- True if bot is admin in this chat
    is_member BOOLEAN DEFAULT true, -- True if bot is still a member of this chat
    is_promoted BOOLEAN DEFAULT false, -- True if this chat has been auto-promoted to a monitored channel
    discovery_method VARCHAR(50), -- e.g., 'bot_api', 'updates_scan', 'passive'
    last_discovered TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, chat_id)
);

-- Create indexes for discovered_chats
CREATE INDEX IF NOT EXISTS idx_discovered_chats_user_id ON discovered_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_discovered_chats_chat_id ON discovered_chats(chat_id);
CREATE INDEX IF NOT EXISTS idx_discovered_chats_is_admin ON discovered_chats(is_admin);
CREATE INDEX IF NOT EXISTS idx_discovered_chats_is_promoted ON discovered_chats(is_promoted);

-- Add trigger for discovered_chats updated_at
CREATE TRIGGER update_discovered_chats_updated_at BEFORE UPDATE ON discovered_chats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policy for discovered_chats
ALTER TABLE discovered_chats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own discovered chats" ON discovered_chats
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Comment on discovered_chats table
COMMENT ON TABLE discovered_chats IS 'Chats (groups/channels) discovered by the bot for a user, including admin status.';

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

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see/modify their own data
CREATE POLICY "Users can view own data" ON users
    FOR ALL USING (auth.uid()::text = id::text OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can manage own keywords" ON keywords
    FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own channels" ON channels
    FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own destinations" ON destinations
    FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own message logs" ON message_logs
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own notifications" ON notifications
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Comment the schema
COMMENT ON TABLE users IS 'User accounts with authentication and subscription info';
COMMENT ON TABLE keywords IS 'Keywords to monitor in messages';
COMMENT ON TABLE channels IS 'Channels and sources to monitor';
COMMENT ON TABLE destinations IS 'Destinations for forwarding matched messages';
COMMENT ON TABLE message_logs IS 'Log of all processed messages';
COMMENT ON TABLE notifications IS 'User notifications and system alerts';
COMMENT ON TABLE audit_logs IS 'Audit trail for security and compliance';
COMMENT ON TABLE system_settings IS 'System-wide configuration settings';

-- Create functions for common operations
CREATE OR REPLACE FUNCTION get_user_quota_usage(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'keywords_used', (SELECT COUNT(*) FROM keywords WHERE user_id = user_uuid AND is_active = true),
        'channels_used', (SELECT COUNT(*) FROM channels WHERE user_id = user_uuid AND is_active = true),
        'destinations_used', (SELECT COUNT(*) FROM destinations WHERE user_id = user_uuid AND is_active = true),
        'messages_today', (SELECT COUNT(*) FROM message_logs WHERE user_id = user_uuid AND created_at > CURRENT_DATE),
        'messages_this_month', (SELECT COUNT(*) FROM message_logs WHERE user_id = user_uuid AND created_at > DATE_TRUNC('month', CURRENT_DATE))
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_user_quota_usage IS 'Get current usage statistics for a user';

-- Success! Database schema is now ready

-- User-specific Telegram client credentials
CREATE TABLE IF NOT EXISTS user_telegram_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    api_id VARCHAR(255) NOT NULL,
    api_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    phone_code_hash VARCHAR(255),
    session TEXT,
    is_active BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'disconnected', -- disconnected, connecting, connected, error
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create indexes for user_telegram_clients
CREATE INDEX IF NOT EXISTS idx_user_telegram_clients_user_id ON user_telegram_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_user_telegram_clients_is_active ON user_telegram_clients(is_active);

-- Add trigger for user_telegram_clients updated_at
CREATE TRIGGER update_user_telegram_clients_updated_at BEFORE UPDATE ON user_telegram_clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policy for user_telegram_clients
ALTER TABLE user_telegram_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own telegram client" ON user_telegram_clients
    FOR ALL USING (auth.uid() = user_id);

-- Comment on user_telegram_clients table
COMMENT ON TABLE user_telegram_clients IS 'Stores user-provided credentials for running a Telegram client session.';
