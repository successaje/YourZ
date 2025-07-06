-- Enable RLS if not already enabled
ALTER TABLE post_coins ENABLE ROW LEVEL SECURITY;

-- Drop any existing insert policies
DROP POLICY IF EXISTS "Allow authenticated insert" ON post_coins;
DROP POLICY IF EXISTS "Allow all insert" ON post_coins;

-- Allow all inserts (for debugging)
CREATE POLICY "Allow all insert" ON post_coins
FOR INSERT
WITH CHECK (true); 