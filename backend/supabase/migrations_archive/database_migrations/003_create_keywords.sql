-- Migration: Create keywords table for Keyword Manager
-- Fictional but production-ready schema

CREATE TABLE IF NOT EXISTS keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  keyword TEXT NOT NULL,
  description TEXT,
  match_mode TEXT NOT NULL DEFAULT 'contains', -- exact | contains | regex
  case_sensitive BOOLEAN NOT NULL DEFAULT false,
  priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_keywords_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT ck_keywords_match_mode CHECK (match_mode IN ('exact','contains','regex'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_keywords_user_id ON keywords(user_id);
CREATE INDEX IF NOT EXISTS idx_keywords_active ON keywords(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_keywords_priority ON keywords(user_id, priority DESC);
CREATE INDEX IF NOT EXISTS idx_keywords_keyword_trgm ON keywords USING gin (keyword gin_trgm_ops);

-- Enable extensions if not already (trigram for search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- RLS
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "keywords_select_own" ON keywords
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "keywords_insert_own" ON keywords
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "keywords_update_own" ON keywords
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "keywords_delete_own" ON keywords
  FOR DELETE USING (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_keywords_updated_at ON keywords;
CREATE TRIGGER trg_keywords_updated_at
BEFORE UPDATE ON keywords
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
