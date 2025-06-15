-- Function to create posts table
CREATE OR REPLACE FUNCTION create_posts_table()
RETURNS void AS $$
BEGIN
    CREATE TABLE IF NOT EXISTS posts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        content TEXT NOT NULL,
        metadata JSONB DEFAULT '{}'::jsonb,
        author_id UUID REFERENCES auth.users(id),
        author_name TEXT,
        author_avatar TEXT,
        wallet_address TEXT NOT NULL,
        status TEXT DEFAULT 'draft',
        is_nft BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create indexes
CREATE OR REPLACE FUNCTION create_posts_indexes()
RETURNS void AS $$
BEGIN
    CREATE INDEX IF NOT EXISTS posts_wallet_address_idx ON posts(wallet_address);
    CREATE INDEX IF NOT EXISTS posts_author_id_idx ON posts(author_id);
    CREATE INDEX IF NOT EXISTS posts_status_idx ON posts(status);
    CREATE INDEX IF NOT EXISTS posts_is_nft_idx ON posts(is_nft);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to enable RLS
CREATE OR REPLACE FUNCTION enable_posts_rls()
RETURNS void AS $$
BEGIN
    ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create policies
CREATE OR REPLACE FUNCTION create_posts_policies()
RETURNS void AS $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON posts;
    DROP POLICY IF EXISTS "Users can insert their own posts" ON posts;
    DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
    DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

    -- Create new policies
    CREATE POLICY "Public posts are viewable by everyone"
        ON posts FOR SELECT
        USING (status = 'published');

    CREATE POLICY "Users can insert their own posts"
        ON posts FOR INSERT
        WITH CHECK (auth.uid() = author_id);

    CREATE POLICY "Users can update their own posts"
        ON posts FOR UPDATE
        USING (auth.uid() = author_id);

    CREATE POLICY "Users can delete their own posts"
        ON posts FOR DELETE
        USING (auth.uid() = author_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 