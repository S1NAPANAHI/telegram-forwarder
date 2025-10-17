-- V2: Add Indexes and RLS Policies

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

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_logs ENABLE ROW LEVEL SECURITY;

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
