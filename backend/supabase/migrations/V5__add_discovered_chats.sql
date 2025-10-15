-- Create table to track all chats the bot has encountered
CREATE TABLE discovered_chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id TEXT NOT NULL UNIQUE,
  chat_type TEXT NOT NULL, -- 'private', 'group', 'supergroup', 'channel'
  title TEXT,
  username TEXT,
  invite_link TEXT,
  is_bot_admin BOOLEAN DEFAULT false,
  is_bot_member BOOLEAN DEFAULT true,
  member_count INTEGER,
  description TEXT,
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  admin_checked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient lookups
CREATE INDEX idx_discovered_chats_chat_id ON discovered_chats(chat_id);
CREATE INDEX idx_discovered_chats_type ON discovered_chats(chat_type);
CREATE INDEX idx_discovered_chats_admin ON discovered_chats(is_bot_admin);
CREATE INDEX idx_discovered_chats_last_seen ON discovered_chats(last_seen_at);

-- Update trigger for updated_at
CREATE TRIGGER update_discovered_chats_updated_at 
    BEFORE UPDATE ON discovered_chats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();