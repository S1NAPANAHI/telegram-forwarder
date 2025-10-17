-- V4: Add Remaining Tables

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

-- Discovered Chats
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_promoted BOOLEAN DEFAULT false
);

-- Message Feed
CREATE TABLE IF NOT EXISTS message_feed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    queue_id UUID NULL,
    title TEXT,
    content TEXT,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message Queue
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
