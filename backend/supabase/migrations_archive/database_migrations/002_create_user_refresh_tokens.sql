-- Migration: Create user_refresh_tokens table
-- This table stores refresh tokens for persistent authentication across server restarts

CREATE TABLE IF NOT EXISTS user_refresh_tokens (
    user_id UUID NOT NULL PRIMARY KEY,
    token_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Foreign key constraint (assuming users table exists)
    CONSTRAINT fk_user_refresh_tokens_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES auth.users(id) 
        ON DELETE CASCADE
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_refresh_tokens_user_id ON user_refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_refresh_tokens_expires_at ON user_refresh_tokens(expires_at);

-- Enable Row Level Security
ALTER TABLE user_refresh_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own refresh tokens
CREATE POLICY "Users can access their own refresh tokens" ON user_refresh_tokens
    FOR ALL USING (auth.uid() = user_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_refresh_tokens_updated_at 
    BEFORE UPDATE ON user_refresh_tokens 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE user_refresh_tokens IS 'Stores hashed refresh tokens for user authentication persistence';
COMMENT ON COLUMN user_refresh_tokens.user_id IS 'References the Supabase auth.users table';
COMMENT ON COLUMN user_refresh_tokens.token_hash IS 'SHA256 hash of the refresh token for security';
COMMENT ON COLUMN user_refresh_tokens.expires_at IS 'When this refresh token expires and should be cleaned up';