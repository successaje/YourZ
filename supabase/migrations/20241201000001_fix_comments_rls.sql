-- Fix comments table RLS policies to work with wallet addresses
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read comments" ON comments;
DROP POLICY IF EXISTS "Anyone can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;

-- Disable RLS for comments table since we're not using JWT authentication
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;

-- Also update the column name if it hasn't been updated yet
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'comments' 
        AND column_name = 'user_address'
    ) THEN
        ALTER TABLE comments RENAME COLUMN user_address TO address;
    END IF;
END $$; 