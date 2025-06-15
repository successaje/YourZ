-- Drop existing tables if they exist
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS user_stats CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    address TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    ipfs_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    bio TEXT,
    level INTEGER DEFAULT 1,
    social_links JSONB DEFAULT '{}',
    email TEXT
);

-- Create user_stats table
CREATE TABLE user_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    address TEXT REFERENCES users(address) ON DELETE CASCADE,
    posts_count INTEGER DEFAULT 0,
    collections_count INTEGER DEFAULT 0,
    nfts_count INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    address TEXT REFERENCES users(address) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    status TEXT DEFAULT 'draft',
    is_nft BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users are viewable by everyone"
    ON users FOR SELECT
    USING (true);

CREATE POLICY "Users can be created by anyone"
    ON users FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (auth.uid()::text = address);

-- Add RLS policies for user_stats table
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User stats are viewable by everyone"
    ON user_stats FOR SELECT
    USING (true);

CREATE POLICY "User stats can be created by service role"
    ON user_stats FOR INSERT
    WITH CHECK (true);

CREATE POLICY "User stats can be updated by service role"
    ON user_stats FOR UPDATE
    USING (true);

-- Add RLS policies for posts table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts are viewable by everyone"
    ON posts FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own posts"
    ON posts FOR INSERT
    WITH CHECK (auth.uid()::text = address);

CREATE POLICY "Users can update their own posts"
    ON posts FOR UPDATE
    USING (auth.uid()::text = address);

CREATE POLICY "Users can delete their own posts"
    ON posts FOR DELETE
    USING (auth.uid()::text = address);

-- Create indexes
CREATE INDEX idx_users_address ON users(address);
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX idx_user_stats_address ON user_stats(address);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_address ON posts(address);

-- First, ensure all posts have corresponding users
INSERT INTO users (address, username, ipfs_hash, created_at, updated_at)
SELECT DISTINCT p.address, 'user_' || substring(p.address from 3 for 6), '', NOW(), NOW()
FROM posts p
LEFT JOIN users u ON p.address = u.address
WHERE u.address IS NULL;

-- Add address column to user_stats if it doesn't exist (without constraint)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_stats' 
        AND column_name = 'address'
    ) THEN
        ALTER TABLE user_stats ADD COLUMN address TEXT;
    END IF;
END $$;

-- Update user_stats with addresses from users
UPDATE user_stats us
SET address = u.address
FROM users u
WHERE us.id = u.id
AND us.address IS NULL;

-- Now add the foreign key constraints
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'user_stats' 
        AND constraint_name = 'user_stats_address_fkey'
    ) THEN
        ALTER TABLE user_stats ADD CONSTRAINT user_stats_address_fkey 
        FOREIGN KEY (address) REFERENCES users(address) ON DELETE CASCADE;
    END IF;
END $$;

-- Add indexes if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'user_stats' 
        AND indexname = 'idx_user_stats_address'
    ) THEN
        CREATE INDEX idx_user_stats_address ON user_stats(address);
    END IF;
END $$;

-- Update RLS policies
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "User stats are viewable by everyone" ON user_stats;
DROP POLICY IF EXISTS "User stats can be created by service role" ON user_stats;
DROP POLICY IF EXISTS "User stats can be updated by service role" ON user_stats;

-- Create new policies
CREATE POLICY "User stats are viewable by everyone"
    ON user_stats FOR SELECT
    USING (true);

CREATE POLICY "User stats can be created by service role"
    ON user_stats FOR INSERT
    WITH CHECK (true);

CREATE POLICY "User stats can be updated by service role"
    ON user_stats FOR UPDATE
    USING (true);

-- Add RLS policies for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can be created by anyone" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

CREATE POLICY "Users are viewable by everyone"
    ON users FOR SELECT
    USING (true);

CREATE POLICY "Users can be created by anyone"
    ON users FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (auth.uid()::text = address);

-- Add RLS policies for posts table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;
DROP POLICY IF EXISTS "Users can create their own posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

CREATE POLICY "Posts are viewable by everyone"
    ON posts FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own posts"
    ON posts FOR INSERT
    WITH CHECK (auth.uid()::text = address);

CREATE POLICY "Users can update their own posts"
    ON posts FOR UPDATE
    USING (auth.uid()::text = address);

CREATE POLICY "Users can delete their own posts"
    ON posts FOR DELETE
    USING (auth.uid()::text = address);

-- Add foreign key constraint for posts address if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'posts' 
        AND constraint_name = 'posts_address_fkey'
    ) THEN
        ALTER TABLE posts ADD CONSTRAINT posts_address_fkey 
        FOREIGN KEY (address) REFERENCES users(address) ON DELETE CASCADE;
    END IF;
END $$;

-- Add index for posts address if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'posts' 
        AND indexname = 'idx_posts_address'
    ) THEN
        CREATE INDEX idx_posts_address ON posts(address);
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_address ON users(address);
CREATE INDEX IF NOT EXISTS idx_user_stats_id ON user_stats(id);
CREATE INDEX IF NOT EXISTS idx_user_stats_address ON user_stats(address);
CREATE INDEX IF NOT EXISTS idx_posts_id ON posts(id);
CREATE INDEX IF NOT EXISTS idx_posts_address ON posts(address); 