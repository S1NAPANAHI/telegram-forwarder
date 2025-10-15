-- Migration: Safe channels schema for Channel & Group Manager

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Base table (idempotent)
CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  platform TEXT NOT NULL DEFAULT 'telegram',
  chat_type TEXT NOT NULL DEFAULT 'channel',
  chat_id TEXT NOT NULL,
  channel_name TEXT,
  username TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  forward_enabled BOOLEAN NOT NULL DEFAULT true,
  allow_media BOOLEAN NOT NULL DEFAULT true,
  allow_links BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_channels_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT ck_channels_platform CHECK (platform IN ('telegram','eitaa','website')),
  CONSTRAINT ck_channels_chat_type CHECK (chat_type IN ('channel','group','supergroup','private'))
);

-- Add any missing columns to existing installs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='forward_enabled') THEN
    ALTER TABLE channels ADD COLUMN forward_enabled BOOLEAN NOT NULL DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='allow_media') THEN
    ALTER TABLE channels ADD COLUMN allow_media BOOLEAN NOT NULL DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='allow_links') THEN
    ALTER TABLE channels ADD COLUMN allow_links BOOLEAN NOT NULL DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='priority') THEN
    ALTER TABLE channels ADD COLUMN priority INTEGER NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='last_seen_at') THEN
    ALTER TABLE channels ADD COLUMN last_seen_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='channels' AND column_name='updated_at') THEN
    ALTER TABLE channels ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_channels_user_id ON channels(user_id);
CREATE INDEX IF NOT EXISTS idx_channels_active ON channels(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_channels_priority ON channels(user_id, priority DESC);
CREATE INDEX IF NOT EXISTS idx_channels_chat_id ON channels(user_id, chat_id);
CREATE INDEX IF NOT EXISTS idx_channels_name_trgm ON channels USING gin (channel_name gin_trgm_ops);

-- RLS
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
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

-- updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_channels_updated_at ON channels;
CREATE TRIGGER trg_channels_updated_at
BEFORE UPDATE ON channels
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
