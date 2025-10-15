-- Migration: Safe channels schema for Channel & Group Manager

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create channels table if it doesn't exist (basic structure)
CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add ALL columns safely (whether table existed or not)
DO $$
BEGIN
  -- Add platform column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='platform') THEN
    ALTER TABLE channels ADD COLUMN platform TEXT NOT NULL DEFAULT 'telegram';
    ALTER TABLE channels ADD CONSTRAINT ck_channels_platform CHECK (platform IN ('telegram','eitaa','website'));
  END IF;
  
  -- Add chat_type column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='chat_type') THEN
    ALTER TABLE channels ADD COLUMN chat_type TEXT NOT NULL DEFAULT 'channel';
    ALTER TABLE channels ADD CONSTRAINT ck_channels_chat_type CHECK (chat_type IN ('channel','group','supergroup','private'));
  END IF;
  
  -- Add chat_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='chat_id') THEN
    ALTER TABLE channels ADD COLUMN chat_id TEXT NOT NULL DEFAULT '';
  END IF;
  
  -- Add channel_name column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='channel_name') THEN
    ALTER TABLE channels ADD COLUMN channel_name TEXT;
  END IF;
  
  -- Add username column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='username') THEN
    ALTER TABLE channels ADD COLUMN username TEXT;
  END IF;
  
  -- Add description column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='description') THEN
    ALTER TABLE channels ADD COLUMN description TEXT;
  END IF;
  
  -- Add is_active column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='is_active') THEN
    ALTER TABLE channels ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
  END IF;
  
  -- Add forward_enabled column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='forward_enabled') THEN
    ALTER TABLE channels ADD COLUMN forward_enabled BOOLEAN NOT NULL DEFAULT true;
  END IF;
  
  -- Add allow_media column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='allow_media') THEN
    ALTER TABLE channels ADD COLUMN allow_media BOOLEAN NOT NULL DEFAULT true;
  END IF;
  
  -- Add allow_links column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='allow_links') THEN
    ALTER TABLE channels ADD COLUMN allow_links BOOLEAN NOT NULL DEFAULT true;
  END IF;
  
  -- Add priority column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='priority') THEN
    ALTER TABLE channels ADD COLUMN priority INTEGER NOT NULL DEFAULT 0;
  END IF;
  
  -- Add last_seen_at column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='last_seen_at') THEN
    ALTER TABLE channels ADD COLUMN last_seen_at TIMESTAMPTZ;
  END IF;
  
  -- Add updated_at column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='updated_at') THEN
    ALTER TABLE channels ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='fk_channels_user_id') THEN
    ALTER TABLE channels ADD CONSTRAINT fk_channels_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes only if columns exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='user_id') THEN
    CREATE INDEX IF NOT EXISTS idx_channels_user_id ON channels(user_id);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='is_active') THEN
    CREATE INDEX IF NOT EXISTS idx_channels_active ON channels(user_id, is_active);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='priority') THEN
    CREATE INDEX IF NOT EXISTS idx_channels_priority ON channels(user_id, priority DESC);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='chat_id') THEN
    CREATE INDEX IF NOT EXISTS idx_channels_chat_id ON channels(user_id, chat_id);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='channel_name') THEN
    CREATE INDEX IF NOT EXISTS idx_channels_name_trgm ON channels USING gin (channel_name gin_trgm_ops);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "channels_select_own" ON channels;
DROP POLICY IF EXISTS "channels_insert_own" ON channels;
DROP POLICY IF EXISTS "channels_update_own" ON channels;
DROP POLICY IF EXISTS "channels_delete_own" ON channels;

CREATE POLICY "channels_select_own" ON channels
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "channels_insert_own" ON channels
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "channels_update_own" ON channels
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "channels_delete_own" ON channels
  FOR DELETE USING (auth.uid() = user_id);

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger only if updated_at column exists
DROP TRIGGER IF EXISTS trg_channels_updated_at ON channels;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='updated_at') THEN
    CREATE TRIGGER trg_channels_updated_at
    BEFORE UPDATE ON channels
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

-- Update any existing rows with default values for new columns
UPDATE channels 
SET 
  platform = COALESCE(platform, 'telegram'),
  chat_type = COALESCE(chat_type, 'channel'),
  chat_id = COALESCE(chat_id, ''),
  is_active = COALESCE(is_active, true),
  forward_enabled = COALESCE(forward_enabled, true),
  allow_media = COALESCE(allow_media, true),
  allow_links = COALESCE(allow_links, true),
  priority = COALESCE(priority, 0),
  updated_at = COALESCE(updated_at, NOW())
WHERE 
  platform IS NULL 
  OR chat_type IS NULL 
  OR chat_id IS NULL 
  OR is_active IS NULL 
  OR forward_enabled IS NULL 
  OR allow_media IS NULL 
  OR allow_links IS NULL 
  OR priority IS NULL 
  OR updated_at IS NULL;
