-- First, ensure any profile data is moved to users table
UPDATE public.users u
SET 
  username = COALESCE(p.username, u.username),
  bio = COALESCE(p.bio, u.bio),
  social_links = COALESCE(p.social_links, u.social_links),
  updated_at = GREATEST(u.updated_at, p.updated_at)
FROM public.profiles p
WHERE p.user_id = u.id;

-- Drop the profiles table
DROP TABLE IF EXISTS public.profiles; 