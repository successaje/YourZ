-- Rename image_url to image_uri in post_nfts table
ALTER TABLE public.post_nfts RENAME COLUMN image_url TO image_uri;

-- Update the get_recent_nfts function to use the new column name
CREATE OR REPLACE FUNCTION public.get_recent_nfts(limit_count integer default 10)
RETURNS TABLE (
  id uuid,
  post_id uuid,
  contract_address text,
  token_id text,
  name text,
  description text,
  image_uri text,
  price numeric,
  creator_address text,
  status text,
  minted_at timestamp with time zone,
  post_title text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pn.id,
    pn.post_id,
    pn.contract_address,
    pn.token_id,
    pn.name,
    pn.description,
    pn.image_uri,
    pn.price,
    pn.creator_address,
    pn.status,
    pn.minted_at,
    p.title as post_title
  FROM public.post_nfts pn
  JOIN public.posts p ON pn.post_id = p.id
  ORDER BY pn.minted_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 