CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  password TEXT, -- Will be handled by Supabase Auth
  telegram_id TEXT UNIQUE,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  language VARCHAR(2) DEFAULT 'fa',
  subscription_plan TEXT DEFAULT 'free',
  keywords_limit INT DEFAULT 10,
  channels_limit INT DEFAULT 5,
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  channel_url TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_checked TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  check_interval INT DEFAULT 30000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  case_sensitive BOOLEAN DEFAULT false,
  exact_match BOOLEAN DEFAULT false,
  match_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, keyword)
);

CREATE TABLE destinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  platform TEXT NOT NULL,
  chat_id TEXT NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE message_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  keyword_id UUID REFERENCES keywords(id) ON DELETE SET NULL,
  channel_id UUID REFERENCES channels(id) ON DELETE SET NULL,
  original_message_id TEXT,
  original_message_text TEXT,
  matched_text TEXT NOT NULL,
  status TEXT DEFAULT 'processed',
  processing_time_ms INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_logs_created_at ON message_logs(created_at DESC);

CREATE OR REPLACE FUNCTION increment_match_count(keyword_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE keywords
  SET match_count = match_count + 1
  WHERE id = keyword_id;
END;
$$;