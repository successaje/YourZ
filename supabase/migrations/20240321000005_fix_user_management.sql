-- First, ensure all user data is properly moved to profiles
INSERT INTO public.profiles (
  user_id,
  address,
  username,
  bio,
  social_links,
  created_at,
  updated_at
)
SELECT 
  id,
  address,
  username,
  bio,
  social_links,
  created_at,
  updated_at
FROM public.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.user_id = u.id
);

-- Now we can safely remove the redundant columns from users table
ALTER TABLE public.users 
  DROP COLUMN IF EXISTS username,
  DROP COLUMN IF EXISTS bio,
  DROP COLUMN IF EXISTS social_links;

-- Make address the primary identifier and add proper constraints
ALTER TABLE public.users 
  ALTER COLUMN address SET NOT NULL,
  ADD CONSTRAINT users_address_check CHECK (char_length(address) = 42);

-- Drop the redundant wallet_address column if it exists
ALTER TABLE public.users 
  DROP COLUMN IF EXISTS wallet_address;

-- Update the profiles table to be the main user information table
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_user_id_fkey,
  ADD CONSTRAINT profiles_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.users(id) 
    ON DELETE CASCADE;

-- Update the user_followers table to reference users instead of profiles
ALTER TABLE public.user_followers
  DROP CONSTRAINT IF EXISTS user_followers_follower_id_fkey,
  DROP CONSTRAINT IF EXISTS user_followers_followed_id_fkey,
  ADD CONSTRAINT user_followers_follower_id_fkey 
    FOREIGN KEY (follower_id) 
    REFERENCES public.users(id) 
    ON DELETE CASCADE,
  ADD CONSTRAINT user_followers_followed_id_fkey 
    FOREIGN KEY (followed_id) 
    REFERENCES public.users(id) 
    ON DELETE CASCADE;

-- Update the user_stats table to reference users
ALTER TABLE public.user_stats
  DROP CONSTRAINT IF EXISTS user_stats_user_id_fkey,
  ADD CONSTRAINT user_stats_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.users(id) 
    ON DELETE CASCADE; 