-- Add these columns to your users table, if they don't already exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS telegram_id BIGINT UNIQUE,
ADD COLUMN IF NOT EXISTS telegram_username TEXT;

-- Create index for faster lookups, if it doesn't already exist
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);