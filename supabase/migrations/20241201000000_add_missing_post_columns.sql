-- Add missing columns to posts table for PostsList component
-- These columns are expected by the frontend but missing from the current schema

-- Add likes_count column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'likes_count'
    ) THEN
        ALTER TABLE posts ADD COLUMN likes_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add views_count column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'views_count'
    ) THEN
        ALTER TABLE posts ADD COLUMN views_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add comments_count column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'comments_count'
    ) THEN
        ALTER TABLE posts ADD COLUMN comments_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add is_liked column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'is_liked'
    ) THEN
        ALTER TABLE posts ADD COLUMN is_liked BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add is_bookmarked column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'is_bookmarked'
    ) THEN
        ALTER TABLE posts ADD COLUMN is_bookmarked BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add is_featured column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'is_featured'
    ) THEN
        ALTER TABLE posts ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add image_url column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'image_url'
    ) THEN
        ALTER TABLE posts ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- Add author_name column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'author_name'
    ) THEN
        ALTER TABLE posts ADD COLUMN author_name TEXT;
    END IF;
END $$;

-- Update existing posts to have author_name from users table
UPDATE posts 
SET author_name = u.username 
FROM users u 
WHERE posts.address = u.address 
AND posts.author_name IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_likes_count ON posts(likes_count);
CREATE INDEX IF NOT EXISTS idx_posts_views_count ON posts(views_count);
CREATE INDEX IF NOT EXISTS idx_posts_is_featured ON posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at); 