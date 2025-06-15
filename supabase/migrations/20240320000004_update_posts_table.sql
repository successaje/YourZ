-- First, let's check if we need to add any missing columns
DO $$ 
BEGIN
    -- Add title column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'posts' AND column_name = 'title') THEN
        ALTER TABLE public.posts ADD COLUMN title TEXT NOT NULL DEFAULT '';
    END IF;

    -- Add content column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'posts' AND column_name = 'content') THEN
        ALTER TABLE public.posts ADD COLUMN content TEXT NOT NULL DEFAULT '';
    END IF;

    -- Add metadata column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'posts' AND column_name = 'metadata') THEN
        ALTER TABLE public.posts ADD COLUMN metadata JSONB;
    END IF;

    -- Add author_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'posts' AND column_name = 'author_id') THEN
        ALTER TABLE public.posts ADD COLUMN author_id UUID REFERENCES public.profiles(id);
    END IF;

    -- Add author_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'posts' AND column_name = 'author_name') THEN
        ALTER TABLE public.posts ADD COLUMN author_name TEXT;
    END IF;

    -- Add author_avatar column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'posts' AND column_name = 'author_avatar') THEN
        ALTER TABLE public.posts ADD COLUMN author_avatar TEXT;
    END IF;

    -- Add wallet_address column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'posts' AND column_name = 'wallet_address') THEN
        ALTER TABLE public.posts ADD COLUMN wallet_address TEXT NOT NULL DEFAULT '';
    END IF;

    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'posts' AND column_name = 'status') THEN
        ALTER TABLE public.posts ADD COLUMN status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived'));
    END IF;

    -- Add is_nft column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'posts' AND column_name = 'is_nft') THEN
        ALTER TABLE public.posts ADD COLUMN is_nft BOOLEAN DEFAULT false;
    END IF;

    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'posts' AND column_name = 'created_at') THEN
        ALTER TABLE public.posts ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'posts' AND column_name = 'updated_at') THEN
        ALTER TABLE public.posts ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS posts_author_id_idx ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS posts_wallet_address_idx ON public.posts(wallet_address);
CREATE INDEX IF NOT EXISTS posts_status_idx ON public.posts(status);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON public.posts(created_at);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Users can create their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;

-- Create new policies
CREATE POLICY "Public posts are viewable by everyone"
    ON public.posts FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own posts"
    ON public.posts FOR INSERT
    WITH CHECK (true);  -- Temporarily allow all inserts for testing

CREATE POLICY "Users can update their own posts"
    ON public.posts FOR UPDATE
    USING (true);  -- Temporarily allow all updates for testing

CREATE POLICY "Users can delete their own posts"
    ON public.posts FOR DELETE
    USING (true);  -- Temporarily allow all deletes for testing

-- Create or replace the trigger for updated_at
DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column(); 