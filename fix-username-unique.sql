-- Fix username uniqueness constraint
-- Run this in your Supabase SQL Editor

-- Remove the unique constraint from username column
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key;

-- Add a comment to document that usernames are not unique
COMMENT ON COLUMN users.username IS 'Display name - not unique, multiple users can have the same display name';

-- Success message
SELECT 'Username uniqueness constraint removed successfully!' as status; 