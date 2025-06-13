-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to create a new user (for registration)
CREATE POLICY "Anyone can create a new user"
    ON users FOR INSERT
    WITH CHECK (true);

-- Policy to allow users to view their own data
CREATE POLICY "Users can view their own data"
    ON users FOR SELECT
    USING (auth.uid() = id);

-- Policy to allow users to update their own data
CREATE POLICY "Users can update their own data"
    ON users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy to allow service role to update user data
CREATE POLICY "Service role can update user data"
    ON users FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Policy to allow users to delete their own account
CREATE POLICY "Users can delete their own account"
    ON users FOR DELETE
    USING (auth.uid() = id);

-- Policy to allow public read access to certain fields
CREATE POLICY "Public can view basic user info"
    ON users FOR SELECT
    USING (true); 