-- Fix post_nfts foreign key constraint issue
-- First, disable RLS to avoid policy conflicts
ALTER TABLE post_nfts DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies that depend on creator_id
DROP POLICY IF EXISTS "Users can update their own post_nfts." ON post_nfts;
DROP POLICY IF EXISTS "Users can insert their own post_nfts." ON post_nfts;
DROP POLICY IF EXISTS "Public post_nfts are viewable by everyone." ON post_nfts;
DROP POLICY IF EXISTS "Allow authenticated users to insert post_nfts" ON post_nfts;
DROP POLICY IF EXISTS "Allow users to update their own post_nfts" ON post_nfts;
DROP POLICY IF EXISTS "Users can delete their own post_nfts." ON post_nfts;

-- Drop the foreign key constraint
ALTER TABLE post_nfts DROP CONSTRAINT IF EXISTS post_nfts_creator_id_fkey;

-- Change creator_id from UUID to TEXT
ALTER TABLE post_nfts ALTER COLUMN creator_id TYPE TEXT;

-- Add foreign key constraint referencing users.address
ALTER TABLE post_nfts ADD CONSTRAINT post_nfts_creator_id_fkey 
    FOREIGN KEY (creator_id) REFERENCES users(address) ON DELETE CASCADE;

-- Re-enable RLS
ALTER TABLE post_nfts ENABLE ROW LEVEL SECURITY;

-- Recreate the policies with the correct column reference
CREATE POLICY "Users can update their own post_nfts." ON post_nfts
    FOR UPDATE USING (creator_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert their own post_nfts." ON post_nfts
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Public post_nfts are viewable by everyone." ON post_nfts
    FOR SELECT USING (true);

CREATE POLICY "Users can delete their own post_nfts." ON post_nfts
    FOR DELETE USING (creator_id = auth.jwt() ->> 'sub'); 