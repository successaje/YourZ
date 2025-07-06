-- Fix RLS policy for post_nfts to allow users to insert their own NFTs
-- Drop the existing insert policy
DROP POLICY IF EXISTS "Users can insert their own post_nfts." ON public.post_nfts;

-- Create a new insert policy that allows users to insert NFTs
-- This policy allows insertion if the user is authenticated and the creator_id matches their user ID
CREATE POLICY "Users can insert their own post_nfts."
  ON public.post_nfts FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    (
      auth.uid() = creator_id OR 
      EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = creator_id 
        AND users.address = (
          SELECT address FROM public.users WHERE id = auth.uid()
        )
      )
    )
  );

-- Also create a more permissive policy for development/testing
-- You can remove this in production
CREATE POLICY "Allow authenticated users to insert post_nfts (dev)"
  ON public.post_nfts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL); 