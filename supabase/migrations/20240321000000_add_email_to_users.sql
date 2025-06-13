-- Add email column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Add RLS policy for email
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for email visibility
CREATE POLICY "Email is viewable by the user and admins"
    ON users FOR SELECT
    USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');

-- Policy for email updates
CREATE POLICY "Users can update their own email"
    ON users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Add unique constraint to prevent duplicate emails
ALTER TABLE users
ADD CONSTRAINT users_email_unique UNIQUE (email); 