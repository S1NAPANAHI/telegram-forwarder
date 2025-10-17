-- Add last_active column to users table
ALTER TABLE users
ADD COLUMN last_active TIMESTAMP WITH TIME ZONE;