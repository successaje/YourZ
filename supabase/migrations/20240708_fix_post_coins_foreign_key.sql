-- Fix post_coins foreign key constraint issue
-- Drop all existing policies that depend on creator_id
DROP POLICY IF EXISTS "Users can update their own post_coins." ON post_coins;
DROP POLICY IF EXISTS "Users can insert their own post_coins." ON post_coins;
DROP POLICY IF EXISTS "Public post_coins are viewable by everyone." ON post_coins;
DROP POLICY IF EXISTS "Allow authenticated insert" ON post_coins;
DROP POLICY IF EXISTS "Allow all insert" ON post_coins;

-- Drop the foreign key constraint
ALTER TABLE post_coins DROP CONSTRAINT IF EXISTS post_coins_creator_id_fkey;

-- Change creator_id from UUID to TEXT
ALTER TABLE post_coins ALTER COLUMN creator_id TYPE TEXT;

-- Add foreign key constraint referencing users.address
ALTER TABLE post_coins ADD CONSTRAINT post_coins_creator_id_fkey 
    FOREIGN KEY (creator_id) REFERENCES users(address) ON DELETE CASCADE;

-- Recreate the policies with the correct column reference
CREATE POLICY "Users can update their own post_coins." ON post_coins
    FOR UPDATE USING (creator_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert their own post_coins." ON post_coins
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Public post_coins are viewable by everyone." ON post_coins
    FOR SELECT USING (true); 