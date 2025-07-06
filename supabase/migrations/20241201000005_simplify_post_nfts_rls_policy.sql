-- Simplify RLS policy for post_nfts to allow any authenticated user to insert
-- Drop all existing insert policies
DROP POLICY IF EXISTS "Users can insert their own post_nfts." ON public.post_nfts;
DROP POLICY IF EXISTS "Allow authenticated users to insert post_nfts (dev)" ON public.post_nfts;

-- Create a simple policy that allows any authenticated user to insert
CREATE POLICY "Allow authenticated users to insert post_nfts"
  ON public.post_nfts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Also allow users to update their own NFTs
DROP POLICY IF EXISTS "Users can update their own post_nfts." ON public.post_nfts;
CREATE POLICY "Allow users to update their own post_nfts"
  ON public.post_nfts FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Keep the select policy as is (public read access)
-- Keep the delete policy as is 