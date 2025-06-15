-- First, update author_ids in posts based on wallet_address
UPDATE public.posts p
SET author_id = u.id
FROM public.users u
WHERE p.wallet_address = u.address
AND p.author_id IS DISTINCT FROM u.id;

-- Now we can safely update the foreign key constraint
ALTER TABLE public.posts
  DROP CONSTRAINT IF EXISTS posts_author_id_fkey,
  ADD CONSTRAINT posts_author_id_fkey 
    FOREIGN KEY (author_id) 
    REFERENCES public.users(id) 
    ON DELETE SET NULL;

-- Do the same for comments
UPDATE public.comments c
SET author_id = u.id
FROM public.users u
WHERE c.wallet_address = u.address
AND c.author_id IS DISTINCT FROM u.id;

ALTER TABLE public.comments
  DROP CONSTRAINT IF EXISTS comments_author_id_fkey,
  ADD CONSTRAINT comments_author_id_fkey 
    FOREIGN KEY (author_id) 
    REFERENCES public.users(id) 
    ON DELETE SET NULL;

-- And for likes
UPDATE public.likes l
SET user_id = u.id
FROM public.users u
WHERE l.wallet_address = u.address
AND l.user_id IS DISTINCT FROM u.id;

ALTER TABLE public.likes
  DROP CONSTRAINT IF EXISTS likes_user_id_fkey,
  ADD CONSTRAINT likes_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.users(id) 
    ON DELETE CASCADE;

-- And for bookmarks
UPDATE public.bookmarks b
SET user_id = u.id
FROM public.users u
WHERE b.wallet_address = u.address
AND b.user_id IS DISTINCT FROM u.id;

ALTER TABLE public.bookmarks
  DROP CONSTRAINT IF EXISTS bookmarks_user_id_fkey,
  ADD CONSTRAINT bookmarks_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.users(id) 
    ON DELETE CASCADE;

-- Update wallet_address columns to use address instead
ALTER TABLE public.posts 
  RENAME COLUMN wallet_address TO address;

ALTER TABLE public.comments 
  RENAME COLUMN wallet_address TO address;

ALTER TABLE public.likes 
  RENAME COLUMN wallet_address TO address;

ALTER TABLE public.bookmarks 
  RENAME COLUMN wallet_address TO address;

ALTER TABLE public.profiles 
  RENAME COLUMN wallet_address TO address; 