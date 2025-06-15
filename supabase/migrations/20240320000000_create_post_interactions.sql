-- Create post_likes table
CREATE TABLE IF NOT EXISTS post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(post_id, user_address)
);

-- Create post_bookmarks table
CREATE TABLE IF NOT EXISTS post_bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(post_id, user_address)
);

-- Add RLS policies for post_likes
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read post likes"
ON post_likes FOR SELECT
USING (true);

CREATE POLICY "Anyone can like posts"
ON post_likes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can unlike their own likes"
ON post_likes FOR DELETE
USING (user_address = current_setting('request.jwt.claims', true)::json->>'sub');

-- Add RLS policies for post_bookmarks
ALTER TABLE post_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read post bookmarks"
ON post_bookmarks FOR SELECT
USING (true);

CREATE POLICY "Anyone can bookmark posts"
ON post_bookmarks FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can remove their own bookmarks"
ON post_bookmarks FOR DELETE
USING (user_address = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS post_likes_post_id_idx ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS post_likes_user_address_idx ON post_likes(user_address);
CREATE INDEX IF NOT EXISTS post_bookmarks_post_id_idx ON post_bookmarks(post_id);
CREATE INDEX IF NOT EXISTS post_bookmarks_user_address_idx ON post_bookmarks(user_address); 