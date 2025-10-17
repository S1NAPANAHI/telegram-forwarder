-- Add is_promoted column to discovered_chats table for auto-promotion tracking
-- This prevents duplicate promotions and tracks which chats have been processed

-- Add the is_promoted column if it doesn't exist
ALTER TABLE discovered_chats 
ADD COLUMN IF NOT EXISTS is_promoted BOOLEAN DEFAULT false;

-- Create index for better performance on auto-promotion queries
CREATE INDEX IF NOT EXISTS idx_discovered_chats_is_promoted ON discovered_chats(is_promoted);

-- Create composite index for auto-promotion queries
CREATE INDEX IF NOT EXISTS idx_discovered_chats_auto_promotion 
ON discovered_chats(is_admin, is_promoted, user_id) 
WHERE is_admin = true AND is_promoted = false AND user_id IS NOT NULL;

-- Update existing rows to set is_promoted = false if not already set
UPDATE discovered_chats 
SET is_promoted = false 
WHERE is_promoted IS NULL;

-- Add helpful comment
COMMENT ON COLUMN discovered_chats.is_promoted IS 'Whether this discovered chat has been promoted to active monitoring';

SELECT 'Added is_promoted column to discovered_chats table successfully' as result;