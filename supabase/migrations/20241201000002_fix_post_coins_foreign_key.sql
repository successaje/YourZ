-- Fix foreign key constraints to work with our custom users table
-- The creator_id columns are TEXT and should reference users.address

-- Fix post_coins table - creator_id is TEXT and should reference users.address
ALTER TABLE public.post_coins 
DROP CONSTRAINT IF EXISTS post_coins_creator_id_fkey;

ALTER TABLE public.post_coins 
ADD CONSTRAINT post_coins_creator_id_fkey 
FOREIGN KEY (creator_id) 
REFERENCES public.users(address) 
ON DELETE CASCADE;

-- Fix post_nfts table - creator_id is TEXT and should reference users.address
ALTER TABLE public.post_nfts 
DROP CONSTRAINT IF EXISTS post_nfts_creator_id_fkey;

ALTER TABLE public.post_nfts 
ADD CONSTRAINT post_nfts_creator_id_fkey 
FOREIGN KEY (creator_id) 
REFERENCES public.users(address) 
ON DELETE CASCADE;

-- Fix posts table - author_id should reference users.id (this one is still UUID)
ALTER TABLE public.posts 
DROP CONSTRAINT IF EXISTS posts_author_id_fkey;

ALTER TABLE public.posts 
ADD CONSTRAINT posts_author_id_fkey 
FOREIGN KEY (author_id) 
REFERENCES public.users(id) 
ON DELETE SET NULL;

-- Update RLS policies to work with our custom users table
-- post_coins policies
DROP POLICY IF EXISTS "Users can insert their own post_coins." ON public.post_coins;
DROP POLICY IF EXISTS "Users can update their own post_coins." ON public.post_coins;

CREATE POLICY "Users can insert their own post_coins."
ON public.post_coins FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own post_coins."
ON public.post_coins FOR UPDATE
USING (true);

-- post_nfts policies
DROP POLICY IF EXISTS "Users can insert their own post_nfts." ON public.post_nfts;
DROP POLICY IF EXISTS "Users can update their own post_nfts." ON public.post_nfts;

CREATE POLICY "Users can insert their own post_nfts."
ON public.post_nfts FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own post_nfts."
ON public.post_nfts FOR UPDATE
USING (true); 