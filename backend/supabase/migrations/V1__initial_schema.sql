-- V1: Initial Schema

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
