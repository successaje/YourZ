-- Create post_coins table to track coins created for posts
create table if not exists public.post_coins (
  id uuid not null default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  contract_address text not null,
  name text not null,
  symbol text not null,
  total_supply numeric not null,
  creator_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  
  constraint post_coins_pkey primary key (id),
  constraint post_coins_post_id_key unique (post_id),
  constraint post_coins_contract_address_key unique (contract_address)
);

-- Enable Row Level Security
alter table public.post_coins enable row level security;

-- Create policies for post_coins
create policy "Public post_coins are viewable by everyone."
  on public.post_coins for select
  using ( true );

create policy "Users can insert their own post_coins."
  on public.post_coins for insert
  with check ( auth.uid() = creator_id );

create policy "Users can update their own post_coins."
  on public.post_coins for update
  using ( auth.uid() = creator_id );

-- Create a function to update the updated_at column
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Create a trigger to update the updated_at column
create trigger handle_post_coins_updated_at
  before update on public.post_coins
  for each row
  execute function public.handle_updated_at();

-- Create an index on post_id for faster lookups
create index if not exists post_coins_post_id_idx on public.post_coins (post_id);

-- Create an index on creator_id for faster lookups
create index if not exists post_coins_creator_id_idx on public.post_coins (creator_id);
