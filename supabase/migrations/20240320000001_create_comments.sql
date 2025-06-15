-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_address TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies for comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments"
ON comments FOR SELECT
USING (true);

CREATE POLICY "Anyone can create comments"
ON comments FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own comments"
ON comments FOR UPDATE
USING (user_address = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete their own comments"
ON comments FOR DELETE
USING (user_address = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS comments_post_id_idx ON comments(post_id);
CREATE INDEX IF NOT EXISTS comments_user_address_idx ON comments(user_address);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON comments(created_at); 