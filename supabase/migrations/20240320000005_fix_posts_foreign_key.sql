-- First, drop the existing foreign key constraint if it exists
ALTER TABLE IF EXISTS public.posts
    DROP CONSTRAINT IF EXISTS posts_author_id_fkey;

-- Add the correct foreign key constraint referencing profiles table
ALTER TABLE public.posts
    ADD CONSTRAINT posts_author_id_fkey
    FOREIGN KEY (author_id)
    REFERENCES public.profiles(id)
    ON DELETE SET NULL;

-- Make author_id nullable since we're using ON DELETE SET NULL
ALTER TABLE public.posts
    ALTER COLUMN author_id DROP NOT NULL; 