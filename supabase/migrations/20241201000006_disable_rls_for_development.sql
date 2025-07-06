-- Temporarily disable RLS on post_nfts table for development
-- This allows any operation without authentication requirements
ALTER TABLE public.post_nfts DISABLE ROW LEVEL SECURITY;

-- Note: This is for development only. In production, you should:
-- 1. Set up proper Supabase authentication
-- 2. Re-enable RLS with appropriate policies
-- 3. Ensure users are authenticated before inserting data 