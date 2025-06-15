-- Create posts table
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

-- Create index on wallet_address for faster lookups
CREATE INDEX IF NOT EXISTS posts_wallet_address_idx ON posts(wallet_address);

-- Create index on author_id for faster lookups
CREATE INDEX IF NOT EXISTS posts_author_id_idx ON posts(author_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS posts_status_idx ON posts(status);

-- Create index on is_nft for filtering
CREATE INDEX IF NOT EXISTS posts_is_nft_idx ON posts(is_nft);

-- Enable Row Level Security (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 